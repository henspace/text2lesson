/**
 * @file Utility to handle reloading after setting changes.
 *
 * @module utils/userIo/reloader
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

import { i18n } from '../i18n/i18n.js';
import { ModalDialog } from './modalDialog.js';

/**
 * Singleton class to manage reloading the application.
 */
class Reloader {
  #reloadRequired = false;
  #reason = '';
  constructor() {}

  /**
   * Flag that a reload is required. This is used by reloadIfRequired to decide
   * if the application should be reloaded.
   * @param {string} reason
   */
  flagAsRequired(reason) {
    this.#reason = reason;
    this.#reloadRequired = true;
  }

  /**
   * If `this.markRequired` has been called, shows a warning dialog and then reloads
   * the application.
   * @returns {Promise} fulfils to undefined
   */
  reloadIfRequired() {
    if (this.#reloadRequired) {
      const warning = i18n`The application needs to reload.`;
      return ModalDialog.showWarning(
        `<p>${warning}</p><p>${this.#reason}</p>`
      ).then(() => {
        window.location.reload();
      });
    } else {
      return Promise.resolve();
    }
  }
}

export const reloader = new Reloader();
