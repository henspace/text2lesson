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
  /**
   * If true, findBestFocus will aim for the stage and then the buttons.
   * @type {boolean}
   */
  #focusOnStage = false;

  /**
   * Construct
   */
  constructor() {
    window.addEventListener('focus', (event) => {
      console.debug(
        `Window has focus. Restore focus to active element. Active element ${document.activeElement.tagName} ${document.activeElement.className}`,
        document.activeElement,
        event.relatedTarget
      );
      if (document.activeElement !== document.body) {
        console.debug('Set focus to active element');
        document.activeElement.focus();
      } else {
        this.findBestFocus();
      }
    });
  }

  /**
   * Set focusOnStage. If true, the first attempt with findBestFocus is to
   * try the stage
   */
  set focusOnStage(value) {
    this.#focusOnStage = value;
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
    console.debug(
      `Couldn't find anything to focus on within ${element?.tagName}:${element?.className}`
    );
    return false;
  }

  /**
   * Focus within an array of elements.
   * @param {Element[]} elements
   * @returns {boolean} true if focus found.
   */
  focusWithinElements(elements) {
    for (const element of elements) {
      if (this.focusWithin(element)) {
        return true;
      }
    }
    return false;
  }

  /** Best effort to restore focus. This is either a popup or the button bar. */
  findBestFocus() {
    let element = document.querySelector('.selectable.always-on-top');
    if (element) {
      element.focus();
      return;
    }
    element = document.querySelector('.modal');
    if (element) {
      this.focusWithin(element);
    } else {
      const candidates = [];
      if (this.#focusOnStage) {
        candidates.push(document.getElementById('stage'));
      }
      candidates.push(document.getElementById('footer'));
      this.focusWithinElements(candidates);
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
