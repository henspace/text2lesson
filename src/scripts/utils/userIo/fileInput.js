/**
 * @file File input control
 *
 * @module utils/userIo/fileInput
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
import { icons } from './icons.js';

/**
 * File input button.
 * Users should listen for the 'dataAvailable' event.
 */
export class FileInputButton extends ManagedElement {
  static DATA_AVAILABLE_EVENT_NAME = 'dataAvailable';

  #input;
  /**
   * Create a file input button.
   * @param {?string} overrideText - text to override the default label
   */
  constructor(overrideText) {
    super('label', 'file-input-button');
    this.classList.add('selectable');
    this.#input = new ManagedElement('input');
    this.#input.setAttribute('type', 'file');
    icons.applyIconToElement(icons.import, this, {
      overrideText: overrideText,
    });
    this.#input.style.visibility = 'hidden';
    this.#input.style.height = '1em';
    this.appendChild(this.#input);
    this.listenToEventOn('change', this.#input);
  }

  /**
   * Handles changes to the file input control
   * If a file is selected, it is read and a custom event 'data-available' is
   * dispatched.
   * @param {Event} event
   * @param {string} eventIdIgnored
   */
  handleChangeEvent(eventIgnored, eventIdIgnored) {
    const file = this.#input.element.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    const control = this;
    reader.addEventListener('load', () => {
      reader.result;
      control.dispatchEvent(
        new CustomEvent(FileInputButton.DATA_AVAILABLE_EVENT_NAME, {
          detail: {
            file: file,
            content: reader.result,
          },
        })
      );
    });
    reader.readAsText(file);
  }
}
