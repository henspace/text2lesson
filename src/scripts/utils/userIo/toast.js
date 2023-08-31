/**
 * @file Popup message.
 *
 * @module utils/dialog/toast
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

import { ManagedElement } from './managedElement.js';
import { icons } from './icons.js';
import { focusManager } from './focusManager.js';

/**
 * Popup message.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
class Toast extends ManagedElement {
  /**
   *
   * @param {string} message - message to display. This can contain HTML and as
   * such is vulnerable to code injection.  As such the user should sanitise the
   * data.
   * @param {boolean} rawHtml - if true, raw HTML can be provided.
   */
  constructor(message, rawHtml) {
    super('div', 'utils-toast');
    this.classList.add('selectable', 'always-on-top');
    this.setAttributes({
      'aria-role': 'alert',
      tabindex: '0',
    });
    const content = new ManagedElement('div', 'container');
    const icon = new ManagedElement('div');
    icons.applyIconToElement(icons.closeMenu, icon.element, { hideText: true });
    this.appendChild(content);
    this.appendChild(icon);

    if (rawHtml) {
      content.innerHTML = message;
    } else {
      content.textContent = message;
    }

    this.listenToOwnEvent('click', '');
    this.listenToOwnEvent('keydown', '');
  }

  /**
   * Get rid of the toast message.
   */
  #dismiss() {
    this.style.opacity = 0;
    this.remove();
    focusManager.findBestFocus();
  }
  /**
   * Handle the toast click event.
   * Remove the toast.
   * @param {Event} event - triggering event
   * @param {string} eventId - event id. Currently unused.
   */
  handleClickEvent(eventIgnored) {
    this.#dismiss();
  }

  /**
   * Handle the keydown event.
   * Remove the toast if Escape, Space or Enter pressed.
   * @param {Event} event - triggering event
   * @param {string} eventId - event id. Currently unused.
   */
  handleKeydownEvent(event) {
    console.debug(`Key ${event.key}`);
    if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
      this.#dismiss();
    }
  }
}

/**
 * Pop up a message.
 * @param {string} message.
 * @param {boolean} rawHtml True if raw html can be provided.
 */
export function toast(message) {
  const toast = new Toast(message, true);
  document.body.appendChild(toast.element);
  setTimeout(() => {
    toast.style.top = '50vh';
    toast.focus();
  });
}
