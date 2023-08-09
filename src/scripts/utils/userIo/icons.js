/**
 * @file Configuration data for icons
 *
 * @module utils/userIo/icons
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
 * HTML semantic roles for tagnames.
 * The key is the element's tagName and the string is the role in lower case.
 * @type{Object<string, string>}
 */
const HTML_SEMANTIC_ROLES = {
  A: 'link',
  BUTTON: 'button',
};

/**
 * @typedef {Object} IconDetails
 * @property {string} content - Html that will displays the icon
 * @property {string} accessibleName - accessible name
 */

/**
 * icons. Note that getter functions are used to prevent module imports
 * resolving i18n strings prior to the resolution of languages.
 */
class IconGenerator {
  /** @returns {IconDetails} information for icon */
  get back() {
    return {
      content: '<i class="fa-solid fa-left-long"></i>',
      accessibleName: i18n`Back`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get cancel() {
    return {
      content: '<i class="fa-solid fa-xmark"></i>',
      accessibleName: i18n`Cancel`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get closeMenu() {
    return {
      content: '<i class="fa-solid fa-circle-xmark"></i>',
      accessibleName: i18n`Close menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get forward() {
    return {
      content: '<i class="fa-solid fa-right-long"></i>',
      accessibleName: i18n`Forward`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get nextProblem() {
    return {
      content: '<i class="fa-solid fa-right-long"></i>',
      accessibleName: i18n`Continue`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get flag() {
    return {
      content: '<i class="fa-solid fa-flag"></i>',
      accessibleName: i18n`Flag`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get no() {
    return {
      content: '<i class="fa-solid fa-thumbs-down"></i>',
      accessibleName: i18n`No`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get ok() {
    return {
      content: '<i class="fa-solid fa-check"></i>',
      accessibleName: i18n`OK`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get pause() {
    return {
      content: '<i class="fa-solid fa-pause"></i>',
      accessibleName: i18n`Pause`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get play() {
    return {
      content: '<i class="fa-solid fa-play"></i>',
      accessibleName: i18n`Play`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get resetToFactory() {
    return {
      content:
        '<i class="fa-solid fa-right-long"></i> <i class="fa-solid fa-industry"/></i>',
      accessibleName: i18n`Factory reset`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get skip() {
    return {
      content: '<i class="fa-solid fa-forward-step"></i>',
      accessibleName: i18n`Skip`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get submitAnswer() {
    return {
      content:
        '<i class="fa-solid fa-right-long"></i> <i class="fa-solid fa-list-check"></i>',
      accessibleName: i18n`Check answer`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get openMenu() {
    return {
      content: '<i class="fa-solid fa-bars"></i>',
      accessibleName: i18n`Open menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get yes() {
    return {
      content: '<i class="fa-solid fa-thumbs-up"></i>',
      accessibleName: i18n`Yes`,
    };
  }

  /**
   *
   * @param {Element} element - the element to check
   * @param {string} role - the required role. If empty, null or undefine, any
   * element fulfils the role.
   * @returns true if the natural role for the Element's tagName addressesses the
   * required role.
   */
  semanticsAddressRole(element, role) {
    if (!role) {
      return true;
    }
    const htmlSemanticRole = HTML_SEMANTIC_ROLES[element.tagName];
    return htmlSemanticRole[element.tagName] == role;
  }

  /**
   * Apply the icon to an element.
   * If the element is a button or link, aria components are not added as HTML
   * semantics are regarded as sufficient. However, if the text is hidden, the
   * aria-label will still be added.
   * @param {IconDetails} icon
   * @param {Element} element
   * @param {Object} options
   * @param {boolean} options.hideText - if true, the text is hidden.
   * @param {string} [options.role] - the aria role.
   */
  applyIconToElement(icon, element, options = {}) {
    const role = options.role?.toLowerCase();
    element.innerHTML = icon.content;
    if (icon.accessibleName && !options.hideText) {
      element.innerHTML += ` ${icon.accessibleName}`;
    }

    if (this.semanticsAddressRole(element, role)) {
      // semantics match role but still add aria-label if text hidden.
      if (options.hideText) {
        element.setAttribute('aria-label', icon.accessibleName);
      }
      return; // semantics match role.
    }
    element.setAttribute('role', role);
    element.setAttribute('aria-label', icon.accessibleName);
  }
}

export const icons = new IconGenerator();
