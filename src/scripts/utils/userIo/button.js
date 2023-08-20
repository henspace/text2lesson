/**
 * @file button classes
 *
 * @module utils/userIo/buttons
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
import { focusManager } from './focusManager.js';
/**
 * Managed button.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class BarButton extends ManagedElement {
  /**
   * Button
   * @param {string | module:utils/userIo/icons~IconDetails} IconDetail - if just a string
   * it is assumed to hold a string that is suitable for accessibility.
   * @param {string} detail.content the text to display. This can contain HTML and soe
   * @param {string} detail.accessibleName text for accessibility
   */
  constructor(detail) {
    super('button');
    if (detail.content) {
      icons.applyIconToElement(detail, this.element);
    } else {
      this.innerHTML = detail;
    }
  }
}

/**
 * Button bar. This is a managed element so when it is removed, its children
 * and any attached listeners are also removed.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class ButtonBar extends ManagedElement {
  constructor() {
    super('div', 'utils-button-bar');
  }
  /**
   * Add buttons to the button bar. If there are no buttons, an OK button is
   * automatically added.
   * @param {string[] | {content: string, accessibleName: string}} definition of buttons.
   * @returns {Promise} Fulfils to the index of the button that fulfils.
   */
  showButtons(buttons) {
    if (!buttons?.length) {
      buttons = [icons.ok];
    }
    this.resolutionFunction = null;
    const promise = new Promise((resolve) => {
      this.resolutionFunction = resolve;
    });

    buttons.forEach((value, index) => {
      const button = new BarButton(value);
      button.setAttribute('data-index', index);
      this.appendChild(button, index);
      this.listenToEventOn('click', button, index);
    });
    focusManager.findBestFocus();
    return promise;
  }

  /**
   * Handle the click event from the buttons.
   * @param {Event} eventIgnored - triggering event
   * @param {string} eventId - id of the event
   */
  handleClickEvent(eventIgnored, eventId) {
    const index = parseInt(eventId);
    this.resolutionFunction(index);
  }
}
