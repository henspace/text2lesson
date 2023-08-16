/**
 * @file modal mask
 *
 * @module utils/userIo/modalMask
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

/**
 * @type {Element}
 */
const mask = document.getElementById('modal-mask');

/**
 * @type {string[]}
 */
const standardSelectionIds = ['title-bar', 'content', 'footer'];

/**
 * @type {number}
 */
let referenceCount = 0;

/**
 * @typedef {Object} MaskedItems
 * @property {Element} element - the element that has been masked
 * @property {boolean} ariaHidden - the state of the aria-hidden attribute before masking
 * @property {boolean} disabled - the state of the disable property before masking.
 */

/**
 * @type {MaskedItems[]}
 */
let itemsToRestore = [];

/**
 * Mask the element. This prevents it being click or tabbed to.
 * @param {Element} element
 */
function deactivateElement(element) {
  console.debug(`Deactivating ${element.tagName}: ${element.className}`);
  const elementDetails = {
    element: element,
    'aria-hidden': element.getAttribute('aria-hidden'),
    disabled: element.disabled,
    tabIndex: element.tabIndex,
  };
  itemsToRestore.push(elementDetails);
  element.setAttribute('aria-hidden', true);
  if (element.disabled !== undefined) {
    element.disabled = true;
  }
  element.tabIndex = -1;
}

/**
 * Restore deactivated items.
 */
function reactivateItems() {
  itemsToRestore.forEach((item) => {
    if (!item.ariaHidden) {
      item.element.removeAttribute('aria-hidden');
    } else {
      item.element.setAttribute('aria-hidden', item.ariaHidden);
    }
    if (item.disabled !== undefined) {
      item.element.disabled = item.disabled;
    }
    if (item.tabIndex !== undefined) {
      item.element.tabIndex = item.tabIndex;
    }
  });
  itemsToRestore = [];
}
/**
 * Mask all the items in the `containersToMask` array.
 * The items are disabled and the `aria-hidden` attribute set to true.
 */
function deactivateItems() {
  standardSelectionIds.forEach((id) => {
    document
      .getElementById(id)
      .querySelectorAll('button,.selectable,input,textarea')
      .forEach((element) => {
        deactivateElement(element);
      });
  });
}

/**
 * Show the modal mask
 */
export function showMask() {
  mask.style.visibility = 'visible';
  if (referenceCount === 0) {
    deactivateItems();
  } else {
    console.debug(
      `Reference count ${referenceCount} is > 0 so mask already in place.`
    );
  }
  referenceCount++;
}

/**
 * Hide the modal mask
 */
export function hideMask() {
  if (--referenceCount > 0) {
    console.debug(
      `Reference count ${referenceCount} is > 0 so leave mask in place.`
    );
    return;
  }
  reactivateItems();
  mask.style.visibility = 'hidden';
}
