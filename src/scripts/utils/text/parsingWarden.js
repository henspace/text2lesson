/**
 * @file Simple protection from future parsing.
 *
 * @module utils/text/parsingWarden
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

import { stringToBase64 } from './base64.js';

/**
 * Class to protect values from future parsing.
 */
export class ParsingWarden {
  #wards = new Map();
  constructor() {}

  /** Clear all the entries */
  clear() {
    this.#wards.clear();
  }

  /**
   * Create a key code from the data.
   * @param {string} data
   * @returns {string} a unique key.
   */
  #createKeyCode(data) {
    return stringToBase64(data).replace(/=/g, ':'); // == is markdown
  }
  /**
   *
   * @param {string} data - the data to guard
   * @returns {string} the key. This can be used as the protected data. If data
   * is empty, it is returned untouched.
   */
  protect(data) {
    if (!data) {
      return data; // nothing to protect
    }
    const key = `???${this.#wards.size}${this.#createKeyCode(data)}???`;
    this.#wards.set(key, data);
    return key;
  }

  /**
   * Get the originally protected string. The protected value is removed.
   * @returns {string} the originally protected value. If not found, the key is returned.
   */
  retrieve(key) {
    const value = this.#wards.get(key);
    this.#wards.delete(key);
    if (!value) {
      console.error(`Could not find ${key} in protected data.`);
      return key;
    } else {
      return value;
    }
  }

  /**
   * Search for keys in the data and reinstate. Any retrieved values are removed.
   * @param {string} data
   * @returns {string}
   */
  reinstate(data) {
    return data.replace(/[?]{3}\d+[a-zA-Z0-9+/]+:{0,2}[?]{3}/g, (match) =>
      this.retrieve(match)
    );
  }
}
