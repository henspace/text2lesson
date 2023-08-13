/**
 * @file Manager for fetching the lesson plan
 * Lessons are structured as follows:
 * + this.#libraries {@link module:lessons/lessonManager~Library}: object
 * containing all available this.#libraries.
 * + Library {@link module:lessons/lessonManager~LibraryDetails}:
 * contains a number of different this.#libraries. These this.#libraries contain a
 * Catalogue.
 * + Catalogue {@link module:lessons/lessonManager~CatalogueDetails}: contains
 * an array of Books.
 * + Book {@link module:lessons/lessonManager~BookDetails}: contains and array
 * of Chapters.
 * + Chapter {@link module:lessons/lessonManager~ChapterDetails}: effectively
 * sections within a book containing a number of lessons.
 * + Lesson {@link module:lessons/lessonManager~LessonDetails}: this is the
 * final element of the book and contains the information that is actually run
 * by the application.
 *
 * @module lessons/lessonManager
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

import { fetchText, fetchJson } from '../utils/jsonUtils/json.js';
import { CachedLesson } from './cachedLesson.js';
import { LocalLibrary } from './localLibrary.js';

/**
 * @typedef {Map<string, LibraryInfo>} Libraries - object containing
 * all available this.#libraries accessible to the application. The keyword is used
 * as a unique identifier for the library.
 */

/**
 * @typedef {Object} LibraryInfo - Information about a library.
 * @property {string} title - title of the library
 * @property {string} file - file containing the books available in the library.
 * This file should contain a JSON representation of a {@link Library}
 * object.
 */

/**
 * @typedef {Map<string, Library>} this.#libraries - object containing
 * all available this.#libraries accessible to the application. The keyword is used
 * as a unique identifier for the library.
 */

/**
 * @typedef {Object} Library - the library as used by the application.
 * @property {string} title - title of the library
 * @property {string} file - file containing the books available in the library.
 * This file should contain a JSON representation of a {@link LibraryContent}
 * object.
 * @property {BookDetails[]} books - the books in the library
 */

/**
 * @typedef {Object} BookDetails
 * @property {string} title - title of the book
 * @property {string} location - the path to where the files in each lesson are
 * located. This should have a trailing forward slash.
 * @property {ChapterDetails[]} chapters - details of the chapters in the book.
 */

/**
 * @typedef {Object} ChapterDetails - details of a book chapter.
 * @property {string} title - title of the chapter.
 * @property {LessonDetails[]} lessons - lessons in the chapter.
 */

/**
 * @typedef {Object} LessonDetails - details of a lesson.
 * @property {string} title - title of the lesson.
 * @property {string} file - path to the actual lesson.
 */

/**
 * @typedef {Object} LessonInfo
 * @property {string} libraryKey - key for the library
 * @property {string} file - file without any path.
 * @property {string} url - the url of the lesson. This is used as its unique key.
 * @property {Object} indexes
 * @property {number} indexes.book - index of the book
 * @property {number} indexes.chapter - index of the chapter
 * @property {number} indexes.lesson - index of the lesson
 * @property {Object} titles
 * @property {string} titles.library - title of the library
 * @property {string} titles.book - title of the book
 * @property {string} titles.chapter - title of the chapter
 * @property {string} titles.lesson - title of the lesson
 */

class LessonManager {
  /**
   * @type {LocalLibrary}
   */
  #localLibrary = new LocalLibrary();
  /**
   * Available this.#libraries.
   * @type {Map.<string, Libraries>}
   */
  #libraries = new Map();
  #currentLibraryKey;
  #currentBookIndex = 0;
  #currentChapterIndex = 0;
  #currentLessonIndex = 0;
  /**
   * @type {CachedLesson}
   */
  #cachedLesson;

  constructor() {}

  /** Set the current library.
   * The library's catalog should have already been loaded.
   * If the key is invalid, the first entry in the this.#libraries is used.
   * @param {string} key the library key.
   */
  set libraryKey(key) {
    this.#currentLibraryKey = this.#libraries.has(key)
      ? key
      : this.#libraries.keys().next().value;
  }

  /**
   * Set the index of the book we are working on.
   * @param {number} index
   */
  set bookIndex(index) {
    const library = this.#libraries.get(this.#currentLibraryKey);
    if (!library) {
      this.#currentBookIndex = 0;
      return;
    }
    this.#currentBookIndex = this.#ensurePositiveInt(index);
  }

  /**
   * Set the index of the chapter we are working on.
   * @param {number} index
   */
  set chapterIndex(index) {
    this.#currentChapterIndex = this.#ensurePositiveInt(index);
  }

  /**
   * Set the index of the lesson we are working on.
   * @param {number} index
   */
  set lessonIndex(index) {
    this.#currentLessonIndex = this.#ensurePositiveInt(index);
  }

  /**
   * Get the library titles.
   * @returns {Map<string, string>}
   */
  get libraryTitles() {
    const options = new Map();
    this.#libraries.forEach((value, key) => {
      options.set(key, value.title);
    });
    return options;
  }

  /**
   * Get list of all the book titles.
   * @returns {string[]}
   */
  get bookTitles() {
    const titles = [];
    this.#libraries.get(this.#currentLibraryKey)?.books.forEach((value) => {
      titles.push(value.title);
    });
    return titles;
  }

  /**
   * Get list of all the chapter titles.
   * @returns {string[]}
   */
  get chapterTitles() {
    const titles = [];
    this.#getCurrentBook().chapters.forEach((value) => {
      titles.push(value.title);
    });
    return titles;
  }

  /**
   * Get list of all the lesson titles.
   * @returns {string[]}
   */
  get lessonTitles() {
    const titles = [];
    this.#getCurrentBook().chapters[this.#currentChapterIndex].lessons.forEach(
      (value) => {
        titles.push(value.title);
      }
    );
    return titles;
  }

  /**
   * @typedef {Object} LessonDetails
   * @property {string} libraryTitle
   * @property {string} bookTitle
   * @property {string} chapterTitle
   * @property {string} lessonTitle
   * @property {string} lessonFile
   */

  /**
   * Get the current lesson information.
   * @returns {LessonInfo}
   */
  get currentLessonInfo() {
    return this.#buildCurrentLessonInfo();
  }

  /**
   * Build the current lesson information.
   * @param {string} url - the url for the lesson. This is used as its unique key.
   * @returns {LessonInfo}
   */
  #buildCurrentLessonInfo(url) {
    this.#ensureIndexesValid();
    const book = this.#getCurrentBook();
    return {
      libraryKey: this.#currentLibraryKey,
      file: book?.chapters[this.#currentChapterIndex]?.lessons[
        this.#currentLessonIndex
      ]?.file,
      url: url,
      indexes: {
        book: this.#currentBookIndex,
        chapter: this.#currentChapterIndex,
        lesson: this.#currentLessonIndex,
      },
      titles: {
        library: this.#libraries.get(this.#currentLibraryKey)?.title,
        book: book?.title,
        chapter: book?.chapters[this.#currentChapterIndex]?.title,
        lesson:
          book?.chapters[this.#currentChapterIndex]?.lessons[
            this.#currentLessonIndex
          ]?.title,
      },
    };
  }

  /**
   * Form url to retrieve the lesson under book, chapter and sections.
   * The current settings for the library key and indexes are used.
   * @returns url
   */
  formUrlForLesson() {
    this.#ensureIndexesValid();
    const books = this.#libraries.get(this.#currentLibraryKey).books;
    const fileLocation = books[this.#currentBookIndex].location;
    const fileName =
      books[this.#currentBookIndex].chapters[this.#currentChapterIndex].lessons[
        this.#currentLessonIndex
      ].file;
    return `${fileLocation}${fileName}`;
  }

  /**
   * Makes sure index is a positive integer.
   * @param {string | number} index
   * @returns integer index or 0 if index is not valid
   */
  #ensurePositiveInt(index) {
    index = parseInt(index);
    return isNaN(index) || index < 0 ? 0 : index;
  }

  /**
   * Ensure all indexes are within the bounds of the library's contents.
   * Any invalid index is set to 0.
   * If library.books is not set, not indexes are adjusted.
   */
  #ensureIndexesValid() {
    const library = this.#libraries.get(this.#currentLibraryKey);

    if (this.#indexInvalid(this.#currentBookIndex, library?.books)) {
      this.#currentBookIndex = 0;
    }
    const book = library?.books[this.#currentBookIndex];
    if (this.#indexInvalid(this.#currentChapterIndex, book?.chapters)) {
      this.#currentChapterIndex = 0;
    }
    const chapter = book?.chapters[this.#currentChapterIndex];
    if (this.#indexInvalid(this.#currentLessonIndex, chapter?.lessons.length)) {
      this.#currentLessonIndex = 0;
    }
  }

  /** Check if index is invalid.
   * It is regarded as invalid if it is out of the bounds of the array.
   * If the array is null or undefined, then then index is _NOT_ regarded as
   * invalid.
   * @returns {boolean}
   */
  #indexInvalid(index, arrayData) {
    if (arrayData === null || arrayData === undefined) {
      return false;
    }
    return isNaN(index) || index < 0 || index >= arrayData.length;
  }

  /**
   * Utility function to simplify code.
   * @returns {BookDetails}
   */
  #getCurrentBook() {
    return this.#libraries.get(this.#currentLibraryKey).books[
      this.#currentBookIndex
    ];
  }

  /**
   * Set the available libraries. The `librariesFileLocation` should be the path
   * to a JSON representation of a `libraries` object.
   * @param {string} librariesFileLocation
   * @returns {Promise} fufils to number of libraries.
   */
  loadLibraries(librariesFileLocation) {
    this.#libraries = new Map();
    return fetchJson(librariesFileLocation).then((entries) => {
      for (const key in entries) {
        this.#libraries.set(key, entries[key]);
        this.#libraries.get(key).books = [];
      }
      return this.#libraries.size;
    });
  }

  /**
   * Load the library associated with the `#currentLibraryKey`. If the key is invalid,
   * it is altered to the first key of the #libraries.
   * Indexes are set to zero if found to be invalid.
   * @param {string} key - the library key
   * @returns {Promise} fulfils to undefined.
   */
  loadCurrentLibrary() {
    const library = this.#libraries.get(this.#currentLibraryKey);

    if (library.books.length > 0) {
      return Promise.resolve();
    }
    const fileLocation = library.file;
    return fetchJson(fileLocation).then((value) => {
      library.books = value;
      this.#ensureIndexesValid();
      return;
    });
  }

  /**
   * Load the current lesson.
   * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
   */
  loadCurrentLesson() {
    const url = this.formUrlForLesson();
    if (this.#cachedLesson?.info.url === url) {
      console.info(`Using cached version of lesson: ${url}`);
      return Promise.resolve(CachedLesson.clone(this.#cachedLesson));
    }
    this.#cachedLesson = new CachedLesson(this.#buildCurrentLessonInfo(url));

    return fetchText(url).then((text) => {
      console.info(`Loaded lesson: ${url}`);
      this.#cachedLesson.content = text;
      return CachedLesson.clone(this.#cachedLesson);
    });
  }
}

export const lessonManager = new LessonManager();
