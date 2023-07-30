/**
 * @file Storage for settings values.
 *
 * @module libs/utils/userIo/settingsValueCache
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

import { getFromStorage } from './settings.js';

/**
 * @typedef {Object} CachedValue
 * @property {*} value
 * @property {string} label
 */
export class SettingsValueCache {
  /**
   * Stored values.
   * @type {Map(CachedValue)}
   */
  #storedValues = new Map();

  /**
   * Construct the SettingsValueCache. Only settings with reloadOnChanged set are saved.
   * @param {module:libs/utils/userIo/settings~SettingDefinitions} definitions
   */
  constructor(definitions) {
    for (const key in definitions) {
      if (definitions[key].reloadIfChanged) {
        const cachedValue = {
          value: getFromStorage(key),
          label: definitions[key].label,
        };
        this.#storedValues.set(key, cachedValue);
      }
    }
  }

  /**
   * @returns {string} comma separated list of all changed labels.
   * The string is empty if nothing.
   */
  get changes() {
    let labels = [];
    this.#storedValues.forEach((cachedValue, key) => {
      const newValue = getFromStorage(key);
      if (newValue !== cachedValue.value) {
        labels.push(cachedValue.label);
      }
    });
    return labels.join(', ');
  }
}
