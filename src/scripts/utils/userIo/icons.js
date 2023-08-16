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
import { ManagedElement } from './managedElement.js';

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
  #cache = new Map();

  /**
   * Get the icon key from css
   * @returns html for icon or !? if not found.
   */
  #getIconHtml(key) {
    if (!this.#cache.has(key)) {
      const cssValue = getComputedStyle(
        document.documentElement
      ).getPropertyValue(key);
      this.#cache.set(key, cssValue.substring(1, cssValue.length - 1));
    }
    return this.#cache.get(key) ?? '!?';
  }

  /** @returns {IconDetails} information for icon */
  get back() {
    return {
      content: this.#getIconHtml('--icon-back-nav-html'), // '<i class="fa-solid fa-left-long"></i>',
      accessibleName: i18n`Back`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get cancel() {
    return {
      content: this.#getIconHtml('--icon-cancel-html'),
      accessibleName: i18n`Cancel`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get closeEditor() {
    return {
      content: this.#getIconHtml('--icon-close-editor-html'),
      accessibleName: i18n`Close editor`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get closeMenu() {
    return {
      content: this.#getIconHtml('--icon-close-menu-html'),
      accessibleName: i18n`Close menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get edit() {
    return {
      content: this.#getIconHtml('--icon-edit-html'),
      accessibleName: i18n`Edit`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get error() {
    return {
      content: this.#getIconHtml('--icon-error-html'),
      accessibleName: i18n`Open menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get fatal() {
    return {
      content: this.#getIconHtml('--icon-fatal-html'),
      accessibleName: i18n`Open menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get flag() {
    return {
      content: this.#getIconHtml('--icon-flagged-html'),
      accessibleName: i18n`Flag`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get forward() {
    return {
      content: this.#getIconHtml('--icon-forward-nav-html'),
      accessibleName: i18n`Forward`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get help() {
    return {
      content: this.#getIconHtml('--icon-help-html'),
      accessibleName: i18n`Help`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get home() {
    return {
      content: this.#getIconHtml('--icon-home-html'),
      accessibleName: i18n`Home`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get info() {
    return {
      content: this.#getIconHtml('--icon-info-html'),
      accessibleName: i18n`Flag`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get load() {
    return {
      content: this.#getIconHtml('--icon-load-html'),
      accessibleName: i18n`Open file`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get nextProblem() {
    return {
      content: this.#getIconHtml('--icon-next-problem-html'),
      accessibleName: i18n`Continue`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get no() {
    return {
      content: this.#getIconHtml('--icon-no-html'),
      accessibleName: i18n`No`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get ok() {
    return {
      content: this.#getIconHtml('--icon-ok-html'),
      accessibleName: i18n`OK`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get pause() {
    return {
      content: this.#getIconHtml('--icon-pause-html'),
      accessibleName: i18n`Pause`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get play() {
    return {
      content: this.#getIconHtml('--icon-play-html'),
      accessibleName: i18n`Play`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get playLesson() {
    return {
      content: this.#getIconHtml('--icon-play-html'),
      accessibleName: i18n`Play lesson`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get privacy() {
    return {
      content: this.#getIconHtml('--icon-privacy-html'),
      accessibleName: i18n`Privacy`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get question() {
    return {
      content: this.#getIconHtml('--icon-question-html'),
      accessibleName: i18n`Flag`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get resetToFactory() {
    return {
      content: this.#getIconHtml('--icon-reset-to-factory-html'),
      accessibleName: i18n`Factory reset`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get save() {
    return {
      content: this.#getIconHtml('--icon-save-html'),
      accessibleName: i18n`Save file`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get settings() {
    return {
      content: this.#getIconHtml('--icon-settings-html'),
      accessibleName: i18n`Settings`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get skip() {
    return {
      content: this.#getIconHtml('--icon-skip-html'),
      accessibleName: i18n`Skip`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get submitAnswer() {
    return {
      content: this.#getIconHtml('--icon-submit-answer-html'),
      accessibleName: i18n`Check answer`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get openMenu() {
    return {
      content: this.#getIconHtml('--icon-open-menu-html'),
      accessibleName: i18n`Open menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get warning() {
    return {
      content: this.#getIconHtml('--icon-warning-html'),
      accessibleName: i18n`Open menu`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get yes() {
    return {
      content: this.#getIconHtml('--icon-yes-html'),
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
   * @param {Element | module:utils/userIo/managedElement.ManagedElement} item - element or ManagedElement to which the icon is added.
   * @param {Object} options
   * @param {boolean} options.hideText - if true, the text is hidden.
   * @param {string} [options.role] - the aria role.
   */
  applyIconToElement(icon, item, options = {}) {
    const element = ManagedElement.getElement(item);
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
