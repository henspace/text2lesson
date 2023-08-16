/**
 * @file Labeled control. This is a special control for use on dialogs.
 *
 * @module utils/userIo/labeledControl
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
import { InputControl, RangeIndicator, SelectControl } from './controls.js';
import { escapeHtml } from '../text/textProcessing.js';

export class LabeledControlManager {
  /** @type {ManagedElement[]} */
  #managedControls = [];

  /**
   * Create a manager.
   */
  constructor() {}

  /**
   * Create a form control from a definition
   * @param {string} key - the key for the item. This is used for saving the value
   * to and from local storage.
   * @param {module:utils/userio/settings~SettingDefinition} definition
   * @param {module:utils/userIo/storage.DataStoreManager} storage - used to retrieve and save data
   * @returns {LabeledControl}
   */
  createLabeledControl(key, definition, storage) {
    const options = {
      storage: storage,
      manager: this,
    };
    const control = new LabeledControl(key, definition, options);
    this.#managedControls.push(control);
    return control;
  }

  /**
   * Remove all the managed controls.
   */
  removeControls() {
    this.#managedControls.forEach((control) => {
      control.remove();
    });
  }

  /**
   * Reload the options on any select control.
   * If keys refer to controls which are not {@link module:utils/userIo/controls~SelectControl}
   * instances are ignored.
   * @param {string[]} keys - keys for controls that need to be reloaded
   */
  reloadSelectOptions(keys) {
    keys?.forEach((value) => {
      const dependentControl = this.#managedControls.find(
        (control) => control.key === value
      );
      if (dependentControl) {
        if (dependentControl.control instanceof SelectControl) {
          dependentControl.control.reloadOptions();
        } else {
          console.log(
            `Ignoring dependent ${value} as it is not a select type.`
          );
        }
      }
    });
  }
}

/**
 * Class to manage inputs. The class comprise a `div` element with a `label`
 * element containing the `label` text and the input control. Another `div` is
 * positioned after the `label` to hold any validation error messages.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class LabeledControl extends ManagedElement {
  /** @type {module:utils/userIo/storage.DataStoreManager} */
  #storage;
  /** @type {LabeledControlManager} */
  #manager;
  /**
   * Create a form control from a definition. Although this can be created
   * independently, it should be constructed via a `LabeledControlManager` if
   * dependents are to be managed.
   * @param {string} key - the key for the item. This is used for saving the value
   * to and from local storage.
   * @param {module:utils/userio/settings~SettingDefinition} definition
   * @param {Object} options - additional options
   * @param {module:utils/userIo/storage.DataStoreManager} options.storage - used to retrieve and save data.
   * If not set, storage is not automatically updated.
   * @param {LabeledControlManager} options.manager Parent manager. If null, dependencies cannot be handled.
   */
  constructor(key, definition, options) {
    super('div');
    this.#storage = options?.storage;
    this.#manager = options?.manager;
    this.className = 'labeled-control-container';
    this.label = new ManagedElement('label');
    this.appendChild(this.label);
    this.key = key;
    this.definition = definition;
    this.label.innerHTML = `<span>${escapeHtml(definition.label)}</span>`;
    if (definition.type === 'select') {
      this.control = new SelectControl(key, definition);
    } else {
      this.control = new InputControl(key, definition);
    }

    this.control.setValue(
      this.#storage
        ? this.#storage.getFromStorage(key, definition.defaultValue)
        : definition.defaultValue
    );
    this.label.appendChild(this.control);

    this.error = this.appendChild(
      new ManagedElement('div', 'utils-input-error-message')
    );

    if (definition.type === 'range') {
      this.label.appendChild(new RangeIndicator(this.control));
    }
    this.listenToEventOn('input', this.control, '');
  }

  /**
   * Sets the control's value.
   * @param {*} value
   */
  setValue(value) {
    this.control?.setValue(value);
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
        this.error.textContent = validation.errorMessage;
        this.classList.add('utils-error');
        return;
      }
    }
    this.classList.remove('utils-error');

    this.#storage?.saveToStorage(this.key, value);

    if (this.definition.onupdate) {
      this.definition.onupdate(value);
      if (this.#manager) {
        this.#manager.reloadSelectOptions(this.definition.dependents);
      } else {
        console.warn(
          'LabeledControl has no manager, so unable to handle dependencies.'
        );
      }
    }
  }
}
