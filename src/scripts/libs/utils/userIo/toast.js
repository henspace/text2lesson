/**
 * @file Popup message.
 *
 * @module libs/utils/dialog/toast
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

import { ManagedElement } from '../dom/managedElement.js';

/**
 * @param {string} message - accepts html.
 */

class Toast extends ManagedElement {
  constructor(message) {
    super('div');
    this.element.className = 'utils-toast';
    this.element.style.top = '100vh';
    this.element.innerHTML = message;
    this.listenToOwnEvent('click', '');
  }

  /**
   * Handle the toast click event.
   * Remove the toast.
   * @param {Event} event - triggering event
   * @param {string} eventId - event id. Currently unused.
   */
  handleClickEvent(event) {
    event.target.style.opacity = 0;
    setTimeout(() => {
      this.remove();
    }, 2000);
  }
}

/**
 * Pop up a message.
 * @param {string} message - can include HTML.
 */
export function toast(message) {
  const toast = new Toast(message);
  document.body.appendChild(toast.element);
  setTimeout(() => {
    toast.element.style.top = '45vh';
  });
}
