/**
 * @file HTML to embed icons
 *
 * @module data/icons
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

import { i18n } from '../i18n/i18n.js';
/**
 * @typedef {Object} IconDetails
 * @property {string} content - content that displays the icon
 * @property {string} accessibleName - accessible name
 */

/**
 * @type {<string, IconDetails>} keys for different icons.
 */
export const ICON_HTML = {
  BACK: {
    content: '<i class="fa-solid fa-arrow-left"></i>',
    accessibleName: i18n`Back`,
  },
  CANCEL: {
    content: '<i class="fa-solid fa-xmark"></i>',
    accessibleName: i18n`Cancel`,
  },
  FORWARD: {
    content: '<i class="fa-solid fa-arrow-right"></i>',
    accessibleName: i18n`Forward`,
  },
  NEXT_PROBLEM: {
    content: '<i class="fa-solid fa-forward"></i>',
    accessibleName: i18n`Continue`,
  },
  NO: {
    content: '<i class="fa-solid fa-thumbs-down"></i>',
    accessibleName: i18n`No`,
  },
  OK: {
    content: '<i class="fa-solid fa-check"></i>',
    accessibleName: i18n`OK`,
  },
  RESET_TO_FACTORY: {
    content:
      '<i class="fa-solid fa-caret-right"></i> <i class="fa-solid fa-industry"/></i>',
    accessibleName: i18n`Factory reset`,
  },
  SUBMIT_ANSWER: {
    content:
      '<i class="fa-solid fa-circle-right"></i><i class="fa-solid fa-highlighter"></i>',
    accessibleName: i18n`Check answer`,
  },
  YES: {
    content: '<i class="fa-solid fa-thumbs-up"></i>',
    accessibleName: i18n`Yes`,
  },
};

/**
 * Apply the icon to an element.
 * If the element is a button, aria components are not added.
 * @param {IconDetails} icon
 * @param {Element} element
 * @param {string} [role='button'] - the aria role. This is only added if the element
 * does not have that role natively.
 */
export function applyIconToElement(icon, element, role = 'button') {
  role = role.toLowerCase();
  element.innerHTML = icon.content;
  if (icon.accessibleName) {
    element.innerHTML += ` ${icon.accessibleName}`;
  }
  if (element.tagName !== 'BUTTON' && role === 'button') {
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', icon.accessibleName);
  } else if (element.tagName !== 'A' && role === 'link') {
    element.setAttribute('role', 'link');
    element.setAttribute('aria-label', icon.accessibleName);
  }
}
