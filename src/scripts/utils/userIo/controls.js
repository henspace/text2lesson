/**
 * @file Controls
 *
 * @module utils/userIo/controls
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
 *
 */

import { ManagedElement } from './managedElement.js';
import { escapeHtml } from '../text/textProcessing.js';

/**
 * Class to encapsulate a range indicator. The control tracks the input
 * control.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class RangeIndicator extends ManagedElement {
  /**
   * Construct the indicator.
   * @param {module:utils/userIo/managedElement.ManagedElement} control - input control of type range.
   */
  constructor(control) {
    super('div', 'utils-range-value');
    this.classList.add('on-top');
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
    this.textContent = event.target.value;
    this.style.opacity = 100;
    const top = controlEl.offsetTop - this.offsetHeight;
    let left =
      controlEl.offsetLeft +
      controlEl.offsetWidth * proportion -
      this.offsetWidth / 2;
    left = Math.max(controlEl.offsetLeft, left);
    left = Math.min(
      controlEl.offsetLeft + controlEl.offsetWidth - this.offsetWidth,
      left
    );
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
    this.show();
  }

  /**
   * Hide the indicator.
   */
  hide() {
    this.style.opacity = 0;
    this.style.visibility = 'hidden';
  }

  /**
   * Show the indicator.
   */
  show() {
    this.style.visibility = 'visible';
    this.style.opacity = 100;
  }
}

/**
 * Separator control class.
 * This is typically used in menus
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class SeparatorControl extends ManagedElement {
  constructor(key, definition) {
    super('div', 'utils-separator');
    this.innerHTML =
      '<span class="utils-hr"><hr></span>' +
      `<span> ${escapeHtml(definition.label)} </span>` +
      '<span class="utils-hr"><hr></span>';
  }
}

/**
 * Input control class.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class InputControl extends ManagedElement {
  /**
   * Construct an range control.
   * @param {string} key - the key for the item. This is used for saving the value
   * to and from local storage.
   * @param {SettingDefinition} definition
   */
  constructor(key, definition) {
    super('input');
    this.type = definition.type;
    this.setAttribute('type', definition.type);
    this.setAttribute('min', definition.min);
    this.setAttribute('max', definition.max);
    this.className = definition.type;
  }

  /**
   * Set the element's value.
   * @param {*} value
   */
  setValue(value) {
    switch (this.type) {
      case 'checkbox':
        this.checked = value;
        return;
      default:
        this.value = value;
        return;
    }
  }

  /**
   * Get the element's value.
   * @returns {*} value
   */
  getValue() {
    switch (this.type) {
      case 'checkbox':
        return this.checked;
      case 'range':
        return parseFloat(this.value);
      default:
        return this.value;
    }
  }
}

/**
 * Input control class.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class SelectControl extends ManagedElement {
  /**
   * Construct an range control.
   * @param {string} key - the key for the item. This is used for saving the value
   * to and from local storage.
   * @param {SettingDefinition} definition
   */
  constructor(key, definition) {
    super('select');
    this.definition = definition;
    if (definition.type) {
      this.className = definition.type;
    }
    this.#addOptions();
  }

  /**
   * Set the element's value.
   * @param {*} value
   */
  setValue(value) {
    console.log(value);
    const options = [...this.$.options];
    const index = options.findIndex((option) => option.value === value);
    if (index >= 0) {
      this.$.selectedIndex = index;
    } else {
      console.warn(`Could not set select control to value of ${value}`);
    }
  }

  /**
   * Get the element's value.
   * @returns {*} value
   */
  getValue() {
    return this.$.selectedOptions[0].value;
  }

  /**
   * Get the element's text.
   * @returns {string} text
   */
  getText() {
    return this.$.selectedOptions[0].text;
  }

  /**
   * Add options
   */
  #addOptions() {
    this.options = this.definition.options;
    if (typeof this.options === 'function') {
      this.options = this.options.call(this);
    }
    if (typeof this.options === 'function') {
      this.options = this.options.call(this);
    }

    this.options?.forEach((value, key) => {
      const option = new Option(value, key);
      this.$.add(option);
    });
  }

  /**
   * Reload the options. This only has an affect if the options are generated by
   * a function in the definition.
   */
  reloadOptions() {
    this.options = this.definition.options;
    if (typeof this.definition.options === 'function') {
      let n = this.$.length;
      while (n-- > 0) {
        this.$.remove(0);
      }
    }
    this.#addOptions();
  }
}
