/**
 * @file Imlementation of local libraries.
 *
 * @module lessons/localLibrary
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
import { i18n } from '../utils/i18n/i18n.js';

/**
 * @type {Map.<string, lessons/lessonManager~LibraryInfo>}
 * @typedef {} LibraryInfo - Information about a library.
 * @property {string} title - title of the library
 * @property {string} file - file containing the books available in the library.
 * This file should contain a JSON representation of a {@link Library}
 * object.
 */

/**
 * @type{string}
 */
const LOCAL_LIBRARY_KEY = 'LOCAL_LIBRARY';

/**
 * Class to present local storage as a library.
 */
export class LocalLibrary {
  /**
   * @type {string}
   */
  #key;
  /**
   * @type {string}
   */
  #title;

  #file;

  /**
   * Construct the local library.
   */
  constructor() {
    this.#key = LOCAL_LIBRARY_KEY;
    this.#title = i18n`Local library`;
    this.#file = '@ToDo';
  }

  /**
   * Get the local library key.
   * @returns {string}
   */
  get key() {
    return this.#key;
  }

  /**
   * Get the library info.
   * @returns {module:lessons/lessonManager~LibraryInfo}
   */
  get info() {
    return {
      title: this.#title,
      file: this.#file,
    };
  }
}
