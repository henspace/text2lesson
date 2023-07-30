/**
 * @file Parse meta data which is information at the start of a file.
 *
 * @module lessons/metadata
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

import { escapeHtml } from '../libs/utils/text/textProcessing.js';
/**
 * Encapsulate the metadata
 */
export class Metadata {
  static #isConstructing = false;

  /**
   * Collection of meta data keys.
   * @type {Object<string, string>}
   */
  #map = new Map();

  constructor() {
    if (!Metadata.#isConstructing) {
      throw new Error('Private constructor. Use createMetaData');
    }
  }

  /**
   * Get the value associated with the key.
   * @param {string} key - key to lookup.
   * @param {string} defaultValue - returned if key not found.
   * @returns {string}
   */
  getValue(key, defaultValue) {
    const value = this.#map.get(key.toUpperCase());
    return value ?? defaultValue;
  }

  /**
   * Create the a `MetaData` object from the source. The format of meta data is
   * a number of lines comprising a key and value. The key cannot have any spaces
   * in its name and can only comprise the characters a to z, A to Z, 0 to 9 and
   * underscore; i.e. the regex `\w` characters. If a key is repeated, it is
   * overwritten. Additional lines are ignored.
   *
   * The key should be separated from its value by a colon, semi-colon, period,
   * or a semi-colon. Any of these can be immediately followed by a hyphen.
   * There can be any number of spaces surrounding the key, separator and values.
   *
   * Keywords are converted to uppercase.
   * @param {string} source
   */
  static createFromSource(source) {
    Metadata.#isConstructing = true;
    const metadata = new Metadata();
    Metadata.#isConstructing = false;
    const lines = source.split('\n');
    lines.forEach((element) => {
      const match = element.match(/^\s*(\w+)\s*[:;.]-?\s*(.*?)\s*$/);
      if (match) {
        metadata.#map.set(match[1].toUpperCase(), escapeHtml(match[2]));
      }
    });
    return metadata;
  }
}
