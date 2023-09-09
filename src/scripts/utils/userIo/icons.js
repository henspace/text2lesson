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
 * @typedef {Object} IconConfig
 * @property {boolean} hideText - if true, the text is hidden. If not set, the system setting is used.
 * @property {string} overrideText - if set, this overrides the button's normal label*
 * @property {string} role - the aria role.
 */

/**
 * icons. Note that getter functions are used to prevent module imports
 * resolving i18n strings prior to the resolution of languages.
 */
class IconGenerator {
  #cache = new Map();
  #hideText;

  /**
   * Get whether text should be hidden
   * @returns {boolean}
   */
  get hideText() {
    return this.#hideText;
  }

  /**
   * Set whether text should be hidden
   * @param {boolean} value
   */
  set hideText(value) {
    this.#hideText = value;
  }

  /**
   * Get the icon key from css
   * @returns html for icon or !? if not found.
   */
  #getIconHtml(key) {
    if (!this.#cache.has(key)) {
      let cssValue = getComputedStyle(
        document.documentElement
      ).getPropertyValue(key);
      cssValue = cssValue.trim(); //iPhone includes leading whitespace
      this.#cache.set(
        key,
        cssValue.substring(1, cssValue.length - 1).replace(/\\"/g, `"`)
      );
    }
    return this.#cache.get(key) ?? '!?';
  }
  /** @returns {IconDetails} information for icon */
  get addLesson() {
    return {
      content: this.#getIconHtml('--icon-add-lesson-html'),
      accessibleName: i18n`Add lesson`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get back() {
    return {
      content: this.#getIconHtml('--icon-back-nav-html'),
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
  get delete() {
    return {
      content: this.#getIconHtml('--icon-delete-html'),
      accessibleName: i18n`Delete`,
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
  get email() {
    return {
      content: this.#getIconHtml('--icon-email-html'),
      accessibleName: i18n`Email`,
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
  get exit() {
    return {
      content: this.#getIconHtml('--icon-exit-html'),
      accessibleName: i18n`Exit to main site`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get export() {
    return {
      content: this.#getIconHtml('--icon-export-html'),
      accessibleName: i18n`Export lesson`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get exportAutoRun() {
    return {
      content: this.#getIconHtml('--icon-export-autorun-html'),
      accessibleName: i18n`Export autorun`,
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
  get image() {
    return {
      content: this.#getIconHtml('--icon-image-html'),
      accessibleName: i18n`Image`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get hourglass() {
    return {
      content: this.#getIconHtml('--icon-hourglass-html'),
      accessibleName: i18n`Hourglass`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get openFolder() {
    return {
      content: this.#getIconHtml('--icon-open-folder-html'),
      accessibleName: i18n`Open folder`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get fontSize() {
    return {
      content: this.#getIconHtml('--icon-font-size-html'),
      accessibleName: i18n`Font size`,
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
  get import() {
    return {
      content: this.#getIconHtml('--icon-import-html'),
      accessibleName: i18n`Import file`,
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
  get selectLesson() {
    return {
      content: this.#getIconHtml('--icon-lesson-html'),
      accessibleName: i18n`Select lesson`,
    };
  }
  /** @returns {IconDetails} information for icon */
  get library() {
    return {
      content: this.#getIconHtml('--icon-library-html'),
      accessibleName: i18n`Open library`,
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
  get print() {
    return {
      content: this.#getIconHtml('--icon-print-html'),
      accessibleName: i18n`Print`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get printPreview() {
    return {
      content: this.#getIconHtml('--icon-print-preview-html'),
      accessibleName: i18n`Print preview`,
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
  get repeatLesson() {
    return {
      content: this.#getIconHtml('--icon-repeat-lesson-html'),
      accessibleName: i18n`Repeat lesson`,
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
      accessibleName: i18n`Save`,
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
  get vimeo() {
    return {
      content: this.#getIconHtml('--icon-vimeo-html'),
      accessibleName: i18n`Play Vimeo video`,
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
  get webshare() {
    return {
      content: this.#getIconHtml('--icon-webshare-html'),
      accessibleName: i18n`Share`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get webshareCertificate() {
    return {
      content: this.#getIconHtml('--icon-webshare-certificate-html'),
      accessibleName: i18n`Share certificate`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get webshareAutorun() {
    return {
      content: this.#getIconHtml('--icon-webshare-autorun-html'),
      accessibleName: i18n`Share autorun lesson`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get yes() {
    return {
      content: this.#getIconHtml('--icon-yes-html'),
      accessibleName: i18n`Yes`,
    };
  }

  /** @returns {IconDetails} information for icon */
  get youtube() {
    return {
      content: this.#getIconHtml('--icon-youtube-html'),
      accessibleName: i18n`Play Youtube video`,
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
   * @param {IconConfig} options

   */
  applyIconToElement(icon, item, options = {}) {
    const hideText = options.hideText ?? this.#hideText;
    const label = options.overrideText ?? icon.accessibleName;
    const element = ManagedElement.getElement(item);
    const role = options.role?.toLowerCase();
    element.innerHTML = icon.content;
    if (icon.accessibleName && !hideText) {
      element.innerHTML += `&nbsp;${label}`;
    } else {
      element.title = label;
    }
    if (this.semanticsAddressRole(element, role)) {
      // semantics match role but still add aria-label if text hidden.
      if (options.hideText) {
        element.setAttribute('aria-label', label);
      }
      return; // semantics match role.
    }
    element.setAttribute('role', role);
    element.setAttribute('aria-label', label);
  }
}

export const icons = new IconGenerator();
