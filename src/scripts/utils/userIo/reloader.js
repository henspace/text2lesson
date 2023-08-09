/**
 * @file Singleton that manages a request for a reload.
 *
 * @module utils/userIo/reloader
 *
 * @license Apache-2.0
 * Copyright 2023 Steve Butler (henspace.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
