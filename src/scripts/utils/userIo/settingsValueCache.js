/**
 * @file Cache settings data
 *
 * @module utils/userIo/settingsValueCache
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

import { persistentData } from './storage.js';

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
          value: persistentData.getFromStorage(key),
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
      const newValue = persistentData.getFromStorage(key);
      if (newValue !== cachedValue.value) {
        labels.push(cachedValue.label);
      }
    });
    return labels.join(', ');
  }
}
