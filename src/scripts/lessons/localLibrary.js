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
import { persistentData } from '../utils/userIo/storage.js';
import { i18n } from '../utils/i18n/i18n.js';
import { Urls } from '../data/urls.js';

/**
 * @type {Map.<string, lessons/lessonManager~LibraryInfo>}
 * @typedef {} LibraryInfo - Information about a library.
 * @property {string} title - title of the library
 * @property {string} file - file containing the books available in the library.
 * This file should contain a JSON representation of a {@link Library}
 * object.
 */

/**
 * @typedef {Object} LocalLesson
 * @property {string} title - title of the lesson
 * @property {string} content - the text that defines the lesson
 */

/**
 * Class to present local storage as a library.
 */
export class LocalLibrary {
  /**
   * @type {string}
   * @const
   */
  static LOCAL_LIBRARY_KEY = 'LOCAL_LIBRARY';
  /**
   * @type {number}
   * @const
   */
  static NUMBER_OF_LESSONS = 4;
  /**
   * @type {string}
   */
  #key;
  /**
   * @type {string}
   */
  #title;

  /**
   * @type {function():module:lessons/lessonManager~Library}
   */
  #contentLoader;

  /**
   * Construct the local library.
   */
  constructor() {
    this.#key = LocalLibrary.LOCAL_LIBRARY_KEY;
    this.#title = i18n`Local library`;
    this.#contentLoader = () => this.#getLibraryContent();
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
      contentLoader: this.#contentLoader,
    };
  }

  /**
   * Gets an object representing the local library content.
   * @returns {module:lessons/lessonManager~LibraryContent}
   */
  #getLibraryContent() {
    const book = {
      title: i18n`My personal lesson book`,
      location: '',
      chapters: [{ title: i18n`Chapter 1`, lessons: [] }],
    };
    for (let index = 0; index < LocalLibrary.NUMBER_OF_LESSONS; index++) {
      const localLesson = this.#loadLocalLesson(index);
      book.chapters[0].lessons.push({
        title: localLesson.title,
        contentLoader: () => localLesson.content,
      });
    }
    return [book];
  }

  /**
   * Get the storage key for a particular index.
   */
  #getStorageKeyForIndex(index) {
    return `LocalLesson_${index}`;
  }
  /**
   * Load a local lesson from storage.
   * @param {number} index
   * @returns {LocalLesson}
   */
  #loadLocalLesson(index) {
    const lessonHelpLink = `[How to write lessons](${Urls.MARKDOWN_HELP})`;
    const defaultLesson = {
      title: i18n`Lesson ${index}`,
      content: i18n`(i)This is a lesson which you need to create. See ${lessonHelpLink}`,
    };
    return persistentData.getFromStorage(
      this.#getStorageKeyForIndex(index),
      defaultLesson
    );
  }

  /**
   * Save the local lesson.
   * @param {number} index
   * @param {LocalLesson} localLesson
   */
  saveLocalLesson(index, localLesson) {
    persistentData.saveToStorage(
      this.#getStorageKeyForIndex(index),
      localLesson
    );
  }
}
