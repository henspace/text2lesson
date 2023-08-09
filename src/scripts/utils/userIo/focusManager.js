/**
 * @file Manage focusing of elements.
 *
 * @module utils/userIo/focusManager
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

class FocusManager {
  constructor() {
    window.addEventListener('focusin', (event) => {
      console.debug(
        `Window has focus. Restore focus to active element. Active element ${document.activeElement.tagName} ${document.activeElement.className}`,
        document.activeElement,
        event.relatedTarget
      );
      if (document.activeElement !== document.body) {
        document.activeElement.focus();
      } else {
        this.findBestFocus();
      }
    });
  }
  /**
   * Move the focus to the first possible element within the containingElement
   * @param {Element | module:utils/userIo/managedElement.ManagedElement} [containingElement=document.body] - where to look
   * @returns {boolean} true if success.
   */
  focusWithin(containingElement = document.body) {
    const element = containingElement.element ?? containingElement;
    const candidates = element.querySelectorAll(
      'button,select,input,.selectable'
    );
    for (const candidate of candidates.values()) {
      if (
        candidate.style.display !== 'none' &&
        candidate.style.visibility !== 'hidden'
      ) {
        candidate.focus();
        return true;
      }
    }
    console.error(
      `Failed to focus within ${element?.tagName}:${element?.className}`
    );
    return false;
  }

  /** Best effort to restore focus */
  findBestFocus() {
    console.debug('Finding best focus');
    let element = document.querySelector('.selectable.always-on-top');
    if (element) {
      console.debug(`Focus on ${element.tagName}: ${element.className}`);
      element.focus();
      return;
    }
    element = document.querySelector('.modal');
    if (element) {
      console.debug(`Focus within ${element.tagName}: ${element.className}`);
      this.focusWithin(element);
    } else {
      element = document.querySelector('#content');
      console.debug(`Focus within ${element.tagName}: ${element.className}`);
      this.focusWithin(element);
    }
  }

  /**
   * Sets focus to the element.
   * Unlike the standard Element focus method, this return whether or not
   * it succeeded.
   * @param {*} element
   * @returns {boolean} true if successfully moved focus to the element.
   */
  setFocus(element) {
    element.focus();
    return document.activeElement === element;
  }
}

export const focusManager = new FocusManager();
