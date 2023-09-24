/**
 * @file Settings routines for use with the modal dialog.
 *
 * @module utils/userio/settings
 *
 * @license GPL-3.0-or-later
 * Create quizzes and lessons from plain text files.
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

import { ModalDialog } from './modalDialog.js';
import { ManagedElement } from './managedElement.js';
import { i18n } from '../i18n/i18n.js';
import { reloader } from './reloader.js';
import { persistentData } from './storage.js';
import { SettingsValueCache } from './settingsValueCache.js';
import { SeparatorControl } from './controls.js';
import { LabeledControlManager } from './labeledControl.js';

/**
 * Array of all the controls on the current SettingsDialog.
 * @type {LabeledControlManager}
 */
let manager = null;

/**
 * Current settings.
 * @type{SettingDefinitions}
 */
let settingDefinitions = {};

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} pass -true on success.
 * @property {string} errorMessage - message if fails. Empty if passes.
 */

/**
 * Definition of an object. This is either an array of strings each holding the
 * text to display, or a map of key/value entries where the value is the
 * text to display.
 * @typedef {string[] | Map<string, string>} OptionDetails
 */

/**
 * Definition of a setting
 * @typedef {Object} SettingDefinition
 * @property {string | number} defaultValue - default value
 * @property {string[]} dependents - array of keys for dependent controls.
 * @property {string} label - text used to label the UI control
 * @property {number} max - maximum value
 * @property {number} min - minimum value
 * @property {function(*)} onupdate - function that is called when the setting
 * is changed. The argument holds the new value.
 * @property {function()} initialise - function that is called to initialise the setting.
 * @property {OptionDetails | function(): OptionDetails} options - options for a select control.
 * @property {function(*): ValidationResult} validate - validator function.
 * Returns {@link ValidationResult} where pass is true if okay.
 * @property {string} type - input type. E.g. 'range'.
 * @property {boolean} reloadIfChanged = application should be reloaded if this has changed.
 */

/**
 * Collection of settings as key, value record.
 * @typedef {Object.<string, SettingDefinition>} SettingDefinitions
 */

/**
 * Set the definitions used to configure the UI controls. When set, the onupdate
 * function for each setting will be called, using the currently stored value.
 * Note that any dependents are updated, so {@link definitions} should be valid
 * before calling.
 * @param {SettingDefinitions} definitions - key, definitions pairs
 */
function setSettingDefinitions(definitions) {
  settingDefinitions = definitions;
  for (const key in settingDefinitions) {
    if (!isSeparator(settingDefinitions[key])) {
      const storedValue = persistentData.getFromStorage(
        key,
        settingDefinitions[key].defaultValue
      );
      settingDefinitions[key].onupdate?.call(this, storedValue);
    }
  }
}

/**
 * Resets all values to their factory defaults if confirmed by the user.
 * @returns {Promise} Fulfils to undefined.
 */
function resetIfConfirmed() {
  return ModalDialog.showConfirm(
    i18n`Are you sure you want to reset all settings to their factory defaults?`
  ).then((value) => {
    if (value === ModalDialog.DialogIndex.CONFIRM_YES) {
      return resetAll();
    }
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
 * Reset everything in the settingDefinitions back to their defaults.
 */
function resetAll() {
  for (const key in settingDefinitions) {
    console.info(`Resetting ${key} to its default.`);
    const definition = settingDefinitions[key];
    if (!isSeparator(definition)) {
      const value = definition.defaultValue;
      persistentData.saveToStorage(key, value);
      definition.onupdate?.(value);
    }
  }
}

/**
 * Initialise the setting definitions. This calls the initialise method of each
 * setting
 * @param {SettingDefinitions} definitions - key, definitions pairs
 */
function initialiseSettingDefinitions(definitions) {
  for (const key in definitions) {
    definitions[key].initialise?.();
  }
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

/**
 * Set the definitions used to configure the UI controls. When set, the onupdate
 * function for each setting will be called, using the currently stored value.
 * Note that any dependents are updated, so `definitions` should be valid
 * before calling.
 * @param {SettingDefinitions} definitions - key, definitions pairs
 * @returns {Promise} Fulfills to undefined
 */
export function loadSettingDefinitions(definitions) {
  initialiseSettingDefinitions(definitions);
  setSettingDefinitions(definitions);
}

/**
 * Pop up a dialog allowing the current settings to be modified.
 * @returns {Promise} Fulfils to index of button pressed. This will be 0.
 * If -1 this indicates that a reload is required.
 */
export function showAllSettings() {
  if (manager) {
    return Promise.reject(
      new Error('Attempt made to show settings on top of another.')
    );
  }
  manager = new LabeledControlManager();
  const dialogContent = new ManagedElement('div');
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
      control = manager.createLabeledControl(key, setting, persistentData);
    }
    dialogContent.appendChild(control);
  }

  const settingsValueCache = new SettingsValueCache(settingDefinitions);

  return ModalDialog.showSettingsDialog(dialogContent)
    .then((value) => {
      if (value === ModalDialog.DialogIndex.SETTINGS_RESET) {
        return resetIfConfirmed();
      } else {
        return value;
      }
    })
    .then((value) => {
      manager.removeControls();
      manager = null;
      reloader.reloadIfRequired();
      return value;
    })
    .then((value) => {
      const changes = settingsValueCache.changes;
      if (changes !== '') {
        reloader.flagAsRequired(
          `${i18n`The following settings have changed:`} ${changes}.`
        );
        reloader.reloadIfRequired();
      }
      return value;
    });
}
