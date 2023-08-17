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
import { escapeHtml } from '../utils/text/textProcessing.js';

/**
 * @typedef {Map<string, LibraryInfo>} Libraries - object containing
 * all available this.#libraries accessible to the application. The keyword is used
 * as a unique identifier for the library.
 */

/**
 * @typedef {Object} LibraryInfo - Information about a library.
 * @property {string} title - title of the library
 * @property {string | function():LibraryContent} url - the url name which
 * provides the path to a JSON representation of a {@link LibraryContent}
 * object.
 * @property {function():LibraryContent} contentLoader - loader for the content as an alternative
 * to provided the {@link LibraryContent}. This takes precedence over the url.
 *
 * {@link LibraryContent} object directly.
 */

/**
 * @typedef {Map<string, Library>} this.#libraries - object containing
 * all available this.#libraries accessible to the application. The keyword is used
 * as a unique identifier for the library.
 */

/**
 * @typedef {BookDetails[]} LibraryContent
 */
/**
 * @typedef {Object} Library - the library as used by the application.
 * @property {string} title - title of the library
 * @property {string} file - file containing the books available in the library.
 * This file should contain a JSON representation of a {@link LibraryContent}
 * object.
 * @property {LibraryContent} books - the books in the library
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
 * @property {string} file - path to the actual lesson if it needs to be loaded.
 * @property {function():string} contentLoader - loader for the content as an alternative
 * to provided the file. This takes precedence.
 */

/**
 * @typedef {Object} LessonInfo
 * @property {boolean} managed - flag whether the lesson is managed by the manager. If this is false, all other fields are unmanaged.
 * @property {boolean} usingLocalLibrary - flag whether the lesson manager is using local lessons.
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
   * @type {boolean}
   */
  #usingLocalLibrary = false;

  /**
   * Available this.#libraries.
   * @type {Map.<string, Libraries>}
   */
  #libraries = new Map();
  #remoteLibraryKey;
  #currentLibraryKey;
  #currentBookIndex = 0;
  #currentChapterIndex = 0;
  #currentLessonIndex = 0;
  /**
   * @type {CachedLesson}
   */
  #cachedLesson;

  constructor() {}

  /** Set the current remote library key.
   * The library's catalog should have already been loaded.
   * If the key is invalid, the first entry in the this.#libraries is used and storage
   * is switched to the local library
   * @param {string} key the library key.
   */
  set remoteLibraryKey(key) {
    if (!this.#libraries.has(key)) {
      console.error(
        `Ignored attempt to set remote invalid remote library key ${key}.`
      );
      this.#usingLocalLibrary = true;
      return;
    }
    this.#remoteLibraryKey = key;
    if (!this.#usingLocalLibrary) {
      this.#currentLibraryKey = this.#remoteLibraryKey;
    }
  }

  /**
   * Switch which library is in use.
   * @param {boolean} value - true to switch to local library.
   */
  set usingLocalLibrary(value) {
    this.#usingLocalLibrary = value;
    this.#currentLibraryKey = this.#usingLocalLibrary
      ? LocalLibrary.LOCAL_LIBRARY_KEY
      : this.#remoteLibraryKey;
  }

  /**
   *  Get which library is in use.
   *  @returns {boolean} true if using local library.
   */
  get usingLocalLibrary() {
    return this.#usingLocalLibrary;
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
   * Get the current library title. If key is not valid, returns an empty string.
   * @returns {string}
   */
  get libraryTitle() {
    const title = this.#libraries.get(this.#currentLibraryKey)?.title;
    return title ?? '';
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
   * Get the remote library titles.
   * This ignores local storage.
   * @returns {Map<string, string>}
   */
  get remoteLibraryTitles() {
    const options = new Map();
    this.#libraries.forEach((value, key) => {
      if (key !== LocalLibrary.LOCAL_LIBRARY_KEY) {
        options.set(key, value.title);
      }
    });
    return options;
  }

  /**
   * Get the book chapter title. If index is not valid, returns an empty string.
   * @returns {string}
   */
  get bookTitle() {
    const title = this.#getCurrentBook()?.title;
    return title ?? '';
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
   * Get the current chapter title. If index is not valid, returns an empty string.
   * @returns {string}
   */
  get chapterTitle() {
    const title =
      this.#getCurrentBook()?.chapters[this.#currentChapterIndex]?.title;
    return title ?? '';
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
   * Get the current lesson title. If index is not valid, returns an empty string.
   * @returns {string}
   */
  get lessonTitle() {
    const title =
      this.#getCurrentBook()?.chapters[this.#currentChapterIndex]?.lessons[
        this.#currentLessonIndex
      ]?.title;
    return title ?? '';
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
   * Get unmanaged lesson information.
   * The lesson info is undefined except for the managed flag which is false and
   * the lesson title.
   * @param {string} lessonTitle
   * @returns {LessonInfo}
   */

  getUnmanagedLessonInfo(lessonTitle) {
    return {
      managed: false,
      usingLocalLibrary: false,
      libraryKey: undefined,
      file: undefined,
      url: undefined,
      indexes: {
        book: 0,
        chapter: 0,
        lesson: 0,
      },
      titles: {
        library: '',
        book: '',
        chapter: '',
        lesson: lessonTitle,
      },
    };
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
      managed: true,
      usingLocalLibrary: this.#usingLocalLibrary,
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
   * @returns {string} the url for the lesson content.
   */
  formUrlForLesson() {
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
   * Note that all titles are escaped.
   * @param {string} librariesFileLocation
   * @returns {Promise} fufils to number of libraries.
   */
  loadAllLibraries(librariesFileLocation) {
    this.#libraries = new Map();
    const localLibrary = new LocalLibrary();
    this.#libraries.set(localLibrary.key, localLibrary.info);
    return fetchJson(librariesFileLocation).then((entries) => {
      for (const key in entries) {
        const entry = entries[key];
        entry.title = escapeHtml(entry.title);
        this.#libraries.set(key, entries[key]);
        this.#libraries.get(key).books = [];
      }
      return this.#libraries.size;
    });
  }

  /**
   * Load the current libraries. This is the local storage library and the
   * current remote library.
   * @returns {Promise} fulfils to undefined.
   */
  loadAllLibraryContent() {
    return this.#loadLibraryContent(LocalLibrary.LOCAL_LIBRARY_KEY).then(() =>
      this.#loadLibraryContent(this.#remoteLibraryKey)
    );
  }

  /**
   * Load the library associated with the key. If the key is invalid,
   * it is altered to the first key of the #libraries.
   * Indexes are set to zero if found to be invalid.
   * @param {string} key - the library key
   * @param {boolean} [force] - if true, the content will be reloaded even if it exists.
   * @returns {Promise} fulfils to undefined.
   */
  #loadLibraryContent(key, force) {
    const library = this.#libraries.get(key);

    if (library.books?.length > 0 && !force) {
      return Promise.resolve();
    }
    if (library.contentLoader) {
      library.books = library.contentLoader();
      this.#escapeAllTitles(library.books);
      this.#ensureIndexesValid();
      return Promise.resolve();
    }
    return fetchJson(library.url).then((value) => {
      library.books = value;
      this.#escapeAllTitles(library.books);
      this.#ensureIndexesValid();
      return;
    });
  }

  /**
   * Escape all the titles in the books
   * @param {BookDetails}
   */
  #escapeAllTitles(books) {
    books.forEach((book) => {
      book.title = escapeHtml(book.title);
      book.chapters.forEach((chapter) => {
        chapter.title = escapeHtml(chapter.title);
        chapter.lessons.forEach((lesson) => {
          lesson.title = escapeHtml(lesson.title);
        });
      });
    });
  }

  /**
   * Load the current lesson.
   * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
   */
  loadCurrentLesson() {
    this.#ensureIndexesValid();
    const contentLoader =
      this.#getCurrentBook().chapters[this.#currentChapterIndex].lessons[
        this.#currentLessonIndex
      ].contentLoader;

    if (contentLoader) {
      return this.#loadLessonUsingContentLoader(contentLoader);
    } else {
      return this.#loadRemoteLesson();
    }
  }

  /**
   * Load the current lesson from local storage.
   * @param {function():string} contentLoader - function that directly loads the
   * content.
   * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
   */
  #loadLessonUsingContentLoader(contentLoader) {
    return Promise.resolve(
      new CachedLesson(this.#buildCurrentLessonInfo(''), contentLoader())
    );
  }
  /**
   * Load the current lesson from remote storage.
   * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
   */
  #loadRemoteLesson() {
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

  /**
   * Updates the lesson content.
   * This can only be called if using a local library.
   * @param {string} title - lesson title.
   * @param {string} content - lesson content.
   * @throws {Error} thrown if trying to update a remote lesson.
   * @returns {Promise} fulfils to undefined.
   */
  updateCurrentLessonContent(title, content) {
    if (!this.#usingLocalLibrary) {
      throw new Error('Attempt made to update a remote library.');
    }
    new LocalLibrary().saveLocalLesson(this.#currentLessonIndex, {
      title: title,
      content: content,
    });
    return this.#loadLibraryContent(LocalLibrary.LOCAL_LIBRARY_KEY, true);
  }
}

export const lessonManager = new LessonManager();
