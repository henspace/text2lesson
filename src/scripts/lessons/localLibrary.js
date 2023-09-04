/**
 * @file Implementation of local libraries.
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
   * @type {string}
   * @const
   */
  static LOCAL_LIBRARY_INDEX_KEY = 'LOCAL_LIBRARY_INDEX';

  /**
   * @type {string}
   * @const
   */
  static LOCAL_LESSON_KEY_PREFIX = 'LocalLesson_';

  /**
   * @type {number}
   * @const
   */
  static NUMBER_OF_INITIAL_LESSONS = 4;
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
   * Get if it is okay to delete a slot
   */
  get okayToDeleteSlot() {
    const keys = this.#getLessonKeys();
    return keys.length > LocalLibrary.NUMBER_OF_INITIAL_LESSONS;
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
   * Get the default lesson keys
   * @returns {number[]}
   */
  #getDefaultLessonKeys() {
    const indexes = [];
    for (
      let index = 0;
      index < LocalLibrary.NUMBER_OF_INITIAL_LESSONS;
      index++
    ) {
      indexes.push(index);
    }
    return indexes;
  }

  /**
   * Get the current local library lesson keys. These are all the books stored
   * in local storage.
   * @returns {numbers[]}
   */
  #getLessonKeys() {
    return persistentData.getFromStorage(
      LocalLibrary.LOCAL_LIBRARY_INDEX_KEY,
      this.#getDefaultLessonKeys()
    );
  }

  /**
   * Save the local library lesson keys. These are all the lessons stored
   * in local storage.
   * @param {number[]} keys
   */
  #saveLessonKeys(keys) {
    persistentData.saveToStorage(LocalLibrary.LOCAL_LIBRARY_INDEX_KEY, keys);
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

    const lessonKeys = this.#getLessonKeys();
    lessonKeys.forEach((key) => {
      const localLesson = this.#loadLocalLesson(key);
      book.chapters[0].lessons.push({
        title: localLesson.title,
        contentLoader: () => localLesson.content,
      });
    });
    return [book];
  }

  /**
   * Get the storage key for a particular book's key.
   * @param {number} key
   */
  #getStorageKeyForLessonKey(key) {
    return `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${key}`;
  }

  /**
   * Load a local lesson from storage.
   * @param {number} key
   * @returns {LocalLesson}
   */
  #loadLocalLesson(key) {
    const defaultLesson = {
      title: i18n`Empty: edit to add your lesson`,
      content: ``,
    };
    return persistentData.getFromStorage(
      this.#getStorageKeyForLessonKey(key),
      defaultLesson
    );
  }

  /**
   * Save the local lesson.
   * @param {number} index
   * @param {LocalLesson} localLesson
   */
  saveLocalLessonAtIndex(index, localLesson) {
    const keys = this.#getLessonKeys();
    if (index < 0 || index >= keys.length) {
      console.error(`Attempt to store to index ${index} ignored.`);
      return;
    }
    const key = keys[index];
    persistentData.saveToStorage(
      this.#getStorageKeyForLessonKey(key),
      localLesson
    );
  }

  /**
   * Get a free key. Searches through all the indexes to find any gaps.
   * @returns {number}
   */
  #getFreeKey() {
    const indexes = this.#getLessonKeys();
    indexes.sort((a, b) => a - b);
    for (let n = 0; n < indexes.length - 1; n++) {
      if (indexes[n + 1] - indexes[n] > 1) {
        return indexes[n] + 1;
      }
    }
    return indexes[indexes.length - 1] + 1;
  }

  /**
   * Add a new lesson slot.
   */
  addNewLessonSlot() {
    const key = this.#getFreeKey();
    const keys = this.#getLessonKeys();
    keys.push(key);
    this.#saveLessonKeys(keys);
  }

  /**
   * Delete a lesson slot. If implementation would reduce the number of lessons
   * below the intial level, it is ignored.
   */
  deleteLessonAtIndex(index) {
    const keys = this.#getLessonKeys();
    if (!this.okayToDeleteSlot) {
      console.error(
        `Attempt made to reduce number of local lessons to below ${LocalLibrary.NUMBER_OF_INITIAL_LESSONS}. Ignored.`
      );
      return;
    }
    const key = keys[index];
    if (key != undefined) {
      console.debug(`Removing lesson storage index: ${index}; key:${key}`);
      persistentData.removeFromStorage(this.#getStorageKeyForLessonKey(key));
      keys.splice(index, 1);
      this.#saveLessonKeys(keys);
    }
  }
}
