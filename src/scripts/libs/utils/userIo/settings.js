/**
 * @file Settings routines for use with the modal dialog.
 *
 * @module libs/utils/dialog/settings
 *
 * @license GPL-3.0-or-later
 * Lesson RunnerCreate quizzes and lessons from plain text files.
 * Copyright 2023 Steve Butler (henspace.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as dialog from './modalDialog.js';
import { ManagedElement } from '../dom/managedElement.js';
import { loadCurrentLesson } from '../../../lessons/lessonManager.js';
import { i18n } from '../i18n/i18n.js';

/**
 * Array of all the controls on the current SettingsDialog.
 * @type {ManagedElement[]}
 */
let dialogControls = [];

/**
 * String appended to keys to make localStorage unique when testing locally.
 * If running a server on the unbuilt source, the {@link module:data/constants.BUILD_INFO.bundleName} is
 * not unique, so a prefix of 'LR' is also appended. This should be modified
 * for each application.
 * @type{string}
 */
let localStorageKey = `app`;

/**
 * Set the prefix for the storage key. This is primarily used to stop apps
 * from the the same domain sharing the same storage values.
 * @param {string} prefix
 */
export function setStorageKeyPrefix(prefix) {
  localStorageKey = prefix;
}

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} pass -true on success.
 * @property {string} errorMessage - message if fails. Empty if passes.
 */

/**
 * Definition of an object. This is either an array of strings each holding the
 * text to display, or a set of key/value entries where the value is the
 * text to display.
 * @typedef {string[] | Object<string, string>} OptionDetails
 */

/**
 * Definition of a setting
 * @typedef {Object} SettingDefinition
 * @property {string | number} defaultValue - default value
 * @property {string[]} dependents - array of keys for the
 * @property {string} label - text used to label the UI control
 * @property {number} max - maximum value
 * @property {number} min - minimum value
 * @property {function(*) :boolean} onupdate - function that is called when the setting
 * is changed. The argument holds the new value. If the method returns true,
 * all select controls have their options reloaded if they are options.
 * @property {OptionDetails | function(): OptionDetails} options - options for a select control.
 * @property {function(*): ValidationResult} validate - validator function.
 * Returns {@link ValidationResult} where pass is true if okay.
 * @property {string} type - input type. E.g. 'range'.
 */

/**
 * Collection of settings as key, value record.
 * @typedef {Object.<string, SettingDefinition>} SettingDefinitions
 */

/**
 * Class to encapsulate a range indicator. The control tracks the input
 * control.
 */
class RangeIndicator extends ManagedElement {
  /**
   * Construct the indicator.
   * @param {ManagedElement} control - input control of type range.
   */
  constructor(control) {
    super('div', 'utils-range-value');
    this.control = control;
    this.listenToEventOn('input', this.control, '');
    this.hide();
  }

  /**
   * Handle the change input event.
   * @param {Event} event
   */
  handleInputEvent(event) {
    if (!this.timerId) {
      this.timerId = setTimeout(() => {
        this.hide();
        this.timerId = null;
      }, 500);
    }
    const controlEl = this.control.element;
    const minValue = parseFloat(controlEl.min ?? 0);
    const maxValue = parseFloat(controlEl.max ?? 100);
    const currentValue = parseFloat(controlEl.value);
    const proportion = (currentValue - minValue) / (maxValue - minValue);
    this.element.innerHTML = event.target.value;
    this.element.style.opacity = 100;
    const top = controlEl.offsetTop - this.element.offsetHeight;
    let left =
      controlEl.offsetLeft +
      controlEl.offsetWidth * proportion -
      this.element.offsetWidth / 2;
    left = Math.max(controlEl.offsetLeft, left);
    left = Math.min(
      controlEl.offsetLeft + controlEl.offsetWidth - this.element.offsetWidth,
      left
    );
    this.element.style.left = `${left}px`;
    this.element.style.top = `${top}px`;
    this.show();
  }

  /**
   * Hide the indicator.
   */
  hide() {
    this.element.style.opacity = 0;
    this.element.style.visibility = 'hidden';
  }

  /**
   * Show the indicator.
   */
  show() {
    this.element.style.visibility = 'visible';
    this.element.style.opacity = 100;
  }
}

/**
 * Separator control class
 */
class SeparatorControl extends ManagedElement {
  constructor(key, definition) {
    super('div', 'utils-settings-separator');
    this.element.innerHTML =
      '<span class="utils-hr"><hr></span>' +
      `<span> ${definition.label} </span>` +
      '<span class="utils-hr"><hr></span>';
  }
}

/**
 * Select control class
 */
class SelectControl extends ManagedElement {
  /**
   *
   * @param {string} key
   * @param {SettingDefinition} definition
   */
  constructor(key, definition) {
    super('span', 'utils-custom-select');
    this.definition = definition;
    this.selection = new ManagedElement('button', 'utils-selection');
    this.appendChild(this.selection);

    this.optionsContainer = new ManagedElement('span', 'utils-options');
    this.appendChildTo(this.optionsContainer, document.body);

    this.addOptions();
    this.listenToOwnEvent('click');
    this.listenToEventOn('focusout', this.selection);
    this.setValue(getFromStorage(key, definition.defaultValue));
  }

  /**
   * Handle the focus out event. This removes the `data-open` attribute from the
   * `this.element` element.
   * @param {Event} eventIgnored - event triggering the call.
   */
  handleFocusoutEvent(eventIgnored) {
    this.focusTimer = setTimeout(() => {
      this.element.removeAttribute('data-open');
      this.optionsContainer.element.removeAttribute('data-open');
    }, 500);
  }

  /**
   * Handle the click event.
   * @param {Event} event - triggering event.
   */
  handleClickEvent(event) {
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
      this.focusTimer = null;
    }
    const parent = event.target.parent;
    if (this.element.hasAttribute('data-open')) {
      this.element.removeAttribute('data-open');
      this.optionsContainer.element.removeAttribute('data-open');
      if (event.target !== this.selection) {
        const key = event.target.getAttribute('data-value');
        this.setValue(key);
        this.element.dispatchEvent(new Event('input'));
      }

      this.clearShiftSoVisible(parent);
    } else {
      this.element.setAttribute('data-open', true);
      this.optionsContainer.element.setAttribute('data-open', true);
      this.shiftSoVisible();
    }
  }

  /**
   * Remove the shift that may have been applied to the `optionsContainer` to
   * make it.
   */
  clearShiftSoVisible() {
    this.optionsContainer.element.style.left = 'initial';
    this.optionsContainer.element.style.top = 'initial';
  }

  /**
   * Shift the `optionsContainer` so that it is visible.
   */
  shiftSoVisible() {
    const selectionBounds = this.element.getBoundingClientRect();
    const optionsBounds = this.optionsContainer.element.getBoundingClientRect();
    const overlapsRight =
      selectionBounds.left + optionsBounds.width > window.innerWidth;
    const overlapsBottom =
      selectionBounds.bottom + optionsBounds.height > window.innerHeight;

    let left = selectionBounds.left;
    let top = selectionBounds.bottom;
    if (overlapsRight) {
      left = selectionBounds.right - optionsBounds.right;
    }
    if (overlapsBottom) {
      top = selectionBounds.top - optionsBounds.height;
    }

    this.optionsContainer.element.style.left = `${left}px`;
    this.optionsContainer.element.style.top = `${top}px`;
  }
  /**
   * Add options
   */
  addOptions() {
    this.options = this.definition.options;
    if (typeof this.options === 'function') {
      this.options = this.options.call(this);
    }

    for (const key in this.options) {
      const optionControl = new ManagedElement('button', 'utils-option');
      optionControl.element.setAttribute('data-value', key);
      optionControl.element.innerHTML = this.options[key];
      this.listenToEventOn('click', optionControl);
      this.optionsContainer.appendChild(optionControl);
    }
  }

  /**
   * Remove options
   */
  removeOptions() {
    this.options = null;
    this.optionsContainer.removeChildren();
  }

  /**
   * Set the element's value.
   * @param {key} key - the option's key.
   */
  setValue(key) {
    if (key == null || !this.options[key]) {
      console.log(`Cannot find key ${key}. Falling back to first option`);
      key = Object.keys(this.options)[0];
    }
    this.selection.element.setAttribute('data-value', key);
    this.selection.element.innerHTML = this.options[key];
  }

  /**
   * Get the element's option details.
   * @returns {string}
   */
  getValue() {
    return this.selection.element.getAttribute('data-value');
  }

  /**
   * Reload the options. This only has an affect if the options are generated by
   * a function in the definition.
   */
  reloadOptions() {
    this.options = this.definition.options;
    if (typeof this.definition.options === 'function') {
      this.removeOptions();
      this.addOptions();
      this.setValue(0);
      this.element.dispatchEvent(new Event('input'));
    }
  }
}
/**
 * Input control class
 */
class InputControl extends ManagedElement {
  /**
   * Construct an range control.
   * @param {string} key - the key for the item. This is used for saving the value
   * to and from local storage.
   * @param {SettingDefinition} definition
   */
  constructor(key, definition) {
    super('input');
    this.type = definition.type;
    this.element.setAttribute(
      'type',
      definition.type === 'toggle' ? 'checkbox' : definition.type
    );
    this.element.setAttribute('min', definition.min);
    this.element.setAttribute('max', definition.max);
    this.element.className = definition.type;
    this.setValue(getFromStorage(key, definition.defaultValue));
  }

  /**
   * Set the element's value.
   * @param {*} value
   */
  setValue(value) {
    switch (this.type) {
      case 'toggle':
      case 'checkbox':
        this.element.checked = value;
        return;
      default:
        this.element.value = value;
        return;
    }
  }

  /**
   * Get the element's value.
   * @returns {*} value
   */
  getValue() {
    switch (this.type) {
      case 'toggle':
      case 'checkbox':
        return this.element.checked;
      case 'range':
        return parseFloat(this.element.value);
      default:
        return this.element.value;
    }
  }
}

/**
 * Class to manage inputs. The class comprise a `div` element with a `label`
 * element containing the `label` text and the input control. Another `div` is
 * positioned after the `label` to hold any validation error messages.
 */
class LabeledControl extends ManagedElement {
  /**
   * Create a form control from a definition
   * @param {string} key - the key for the item. This is used for saving the value
   * to and from local storage.
   * @param {SettingDefinition} definition
   * @returns {Element} the root element for the control.
   */
  constructor(key, definition) {
    super('div');
    this.element.className = 'labeled-control-container';
    this.label = new ManagedElement('label');
    this.appendChild(this.label);
    this.key = key;
    this.definition = definition;
    this.label.element.innerHTML = `<span>${definition.label}</span>`;
    if (definition.type === 'select') {
      this.control = new SelectControl(key, definition);
    } else {
      this.control = new InputControl(key, definition);
    }
    this.label.appendChild(this.control);

    this.error = this.appendChild(
      new ManagedElement('div', 'utils-input-error-message')
    );

    if (definition.type === 'range') {
      this.label.appendChild(new RangeIndicator(this.control));
    }
    this.listenToEventOn('input', this.control, '');
    this.label.appendChild(this.control);
    if (definition.type === 'toggle') {
      const slider = new ManagedElement('span', 'utils-slider');
      this.label.appendChild(slider);
    }
  }

  /**
   * Handle the input event.
   * @param {Event} eventIgnored
   */
  handleInputEvent(eventIgnored) {
    const value = this.control.getValue();
    if (this.definition.validate) {
      const validation = this.definition.validate(value);
      if (!validation.pass) {
        this.error.element.innerHTML = validation.errorMessage;
        this.element.classList.add('utils-error');
        return;
      }
    }
    this.element.classList.remove('utils-error');
    saveToStorage(this.key, value);

    if (this.definition.onupdate) {
      this.definition.onupdate(value).then(() => {
        reloadDependents(this.definition.dependents);
      });
    }
  }
}

/**
 * Refresh the options on any select control.
 */
function reloadDependents(dependents) {
  dependents?.forEach((value) => {
    const dependentControl = dialogControls.find(
      (control) => control.key === value
    );
    if (dependentControl) {
      if (dependentControl.control instanceof SelectControl) {
        dependentControl.control.reloadOptions();
      } else {
        console.log(`Ignoring dependent ${value} as it is not a select type.`);
      }
    }
  });
}

/**
 * Pop up a dialog allowing the current settings to be modified.
 * @returns {Promise} Fulfils to index of button pressed. This will be 0.
 */
export function showAllSettings() {
  if (dialogControls.length !== 0) {
    return Promise.reject(
      new Error('Attempt made to show settings on top of another.')
    );
  }
  const dialogContent = document.createElement('div');
  dialogContent.innerHTML = `
    <div class='utils-palette'>
    <span class='utils-primary'></span>
    <span class='utils-secondary'></span>
    <span class='utils-tertiary'></span>
    </div>
  `;

  for (const key in settingDefinitions) {
    const setting = settingDefinitions[key];
    let control;
    if (isSeparator(setting)) {
      control = new SeparatorControl(key, setting);
    } else {
      control = new LabeledControl(key, setting, dialogControls);
    }
    dialogControls.push(control);
    dialogContent.appendChild(control.element);
  }

  return dialog
    .showSettingsDialog(dialogContent)
    .then((value) => {
      if (value === 0) {
        return value;
      }
      return resetIfConfirmed();
    })
    .then((value) => {
      dialogControls.forEach((control) => {
        control.remove();
      });
      dialogControls = [];
      return value;
    })
    .then((valueIgnored) => {
      return loadCurrentLesson();
    });
}

/**
 * Set the definitions used to configure the UI controls. When set, the onupdate
 * function for each setting will be called, using the currently stored value.
 * Note that any dependents are updated, so `definitions` should be valid
 * before calling.
 * @param {SettingDefinitions} definitions - key, definitions pairs
 * @returns {Promise} Fulfills to undefined
 */
export function loadSettingDefinitions(definitions) {
  return initialiseSettingDefinitions(definitions).then(() =>
    setSettingDefinitions(definitions)
  );
}

/**
 * Set the definitions used to configure the UI controls. When set, the onupdate
 * function for each setting will be called, using the currently stored value.
 * Note that any dependents are updated, so {@link definitions} should be valid
 * before calling.
 * @param {SettingDefinitions} definitions - key, definitions pairs
 * @returns {Promise} Fulfills to undefined
 */
function setSettingDefinitions(definitions) {
  const promises = [];
  settingDefinitions = definitions;
  for (const key in settingDefinitions) {
    if (!isSeparator(settingDefinitions[key])) {
      const storedValue = getFromStorage(
        key,
        settingDefinitions[key].defaultValue
      );
      const promise = settingDefinitions[key].onupdate?.call(this, storedValue);
      if (promise) {
        promises.push(promise);
      }
    }
  }
  if (promises.length > 0) {
    return Promise.all(promises);
  } else {
    return Promise.resolve(undefined);
  }
}

/**
 * Resets all values to their factory defaults if confirmed by the user.
 * @returns {Promise} Fulfils to undefined.
 */
function resetIfConfirmed() {
  return dialog
    .showConfirm(
      i18n`Are you sure you want to reset all settings to their factory defaults?`
    )
    .then((value) => {
      if (value === 0) {
        return resetAll();
      }
      return Promise.resolve();
    });
}

/**
 * Test if definition is a separator.
 * @param {SettingDefinition} definition
 * @returns {boolean}
 */
function isSeparator(definition) {
  return definition.type === 'separator';
}

/**
 * Reset everything back to its defaults.
 */
function resetAll() {
  const promises = [];
  for (const key in settingDefinitions) {
    console.log(`Resetting ${key}`);
    const definition = settingDefinitions[key];
    if (!isSeparator(definition)) {
      const value = definition.defaultValue;
      saveToStorage(key, value);
      if (definition.onupdate) {
        promises.push(definition.onupdate(value));
      }
    }
  }
  return promises.length > 0 ? Promise.all(promises) : Promise.resolve();
}

/**
 * Initialise the setting definitions. This calls the initialise method of each
 * setting
 * @param {SettingDefinitions} definitions - key, definitions pairs
 * @returns {Promise} Fulfills to undefined when all settings have been initialised
 */
function initialiseSettingDefinitions(definitions) {
  const promises = [];
  for (const key in definitions) {
    if (definitions[key].initialise) {
      promises.push(definitions[key].initialise());
    }
  }
  if (promises.length > 0) {
    return Promise.all(promises);
  } else {
    return Promise.resolve();
  }
}

/**
 * Create a unique key for the localStorage. To do this, LOCAL_STORAGE_KEY is
 * added to the front of the key.
 * @param {string} key
 * @returns {string} the unique key.
 */
function createStorageKey(key) {
  return `${localStorageKey}${key}`;
}

/**
 * Get setting from localStorage
 * @param {string} key - saved item key. NB. this is prefixed by
 * LOCAL_STORAGE_ID to prevent clashes with local debugging.
 * @param {*} defaultValue
 * @returns {*}
 */
export function getFromStorage(key, defaultValue) {
  key = createStorageKey(key);
  const value = localStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.log(error);
    }
  }
  return defaultValue;
}

/**
 * Save setting to local storage
 * @param {string} key
 * @param {*} value
 * @returns {undefined}
 */
function saveToStorage(key, value) {
  key = createStorageKey(key);
  return localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Convert a simple data array into an array of {@link OptionDetails}
 * @param {string[]} dataArray
 * @returns {OptionDetails[]}
 */
export function convertToOptionDetails(dataArray) {
  const details = {};
  dataArray.forEach((value, index) => {
    details[index] = {
      value: value,
      text: value,
    };
  });
  return details;
}

let settingDefinitions = {};
