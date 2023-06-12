/**
 * @file Manager for fetching the lesson plan
 * Lessons are structured as follows:
 * + Libraries {@link module:lessons/lessonManager~Library}: object
 * containing all available libraries.
 * + Library {@link module:lessons/lessonManager~LibraryDetails}:
 * contains a number of different libraries. These libraries contain a
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

import { fetchText, fetchJson } from '../libs/utils/jsonUtils/json.js';
import { toast } from '../libs/utils/userIo/toast.js';

/**
 * @typedef {Object<string, LibraryDetails>} Libraries - object containing
 * all available libraries accessible to the application. The keyword is used
 * as a unique identifier for the library.
 */

/**
 * @typedef {Object} LibraryDetails - Details of a library.
 * @property {string} title - title of the library
 * @property {string} file - file containing the books available in the library.
 * This file should contain a JSON representation of a {@link CatalogueDetails}
 * object.
 */
/**
 * @typedef {BookDetails[]} CatalogueDetails
 * A catalogue of books which are available.
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
 * @typedef {Object} LessonDetails
 * @property {string} title - title of the lesson
 * @property {string} file - file without any path.
 */

/**
 * Available libraries.
 * @type {Libraries}
 */
let libraries = {};

/**
 * Catalogues available in the current library.
 * @type {Object<string, CatalogueDetails[]>}
 */
let catalogues = {};

let currentLibrary;
let currentBookIndex = 0;
let currentChapterIndex = 0;
let currentLessonIndex = 0;

/**
 * Form url to retrieve the lesson under book, chapter and section.
 * @param {number} bookIndex
 * @param {number} chapterIndex
 * @param {number} lessonIndex
 * @returns url
 */
export function formUrlForLessonIndex(bookIndex, chapterIndex, lessonIndex) {
  const catalogue = catalogues[currentLibrary];
  const fileLocation = catalogue[bookIndex].location;
  const fileName =
    catalogue[bookIndex].chapters[chapterIndex].lessons[lessonIndex].file;
  return `${fileLocation}${fileName}`;
}

/**
 * Load the current lesson.
 * @returns {Promise} Fulfils to undefined.
 */
export function loadCurrentLesson() {
  const url = formUrlForLessonIndex(
    currentBookIndex,
    currentChapterIndex,
    currentLessonIndex
  );
  return fetchText(url)
    .then((text) => {
      console.log('Loaded lesson: ', text);
    })
    .catch((error) => {
      toast(error.message);
    });
}

/**
 * Makes sure index is valid.
 * @param {string | number} index
 * @returns integer index or 0 if index is not valid
 */
function makeIndexSafe(index) {
  index = parseInt(index);
  return isNaN(index) || index < 0 ? 0 : index;
}

/**
 * Set the available libraries. The `librariesFile` should contain a JSON
 * representation of a Libraries object.
 * @param {string} librariesFileLocation
 * @returns {Promise} resolves to true.
 */
export function loadLibraries(librariesFileLocation) {
  return fetchJson(librariesFileLocation).then((value) => {
    libraries = value;
    console.log('Libraries', value);
  });
}

/** Set the current library.
 * The library's catalog is loaded if necessary.
 * @param {string} key the library key.
 * @returns {Promise} Fulfils to undefined.
 */
export function setCurrentLibrary(key) {
  currentLibrary = key;
  if (catalogues[key]) {
    return Promise.resolve();
  }
  const fileLocation = libraries[key].file;
  return fetchJson(fileLocation).then((value) => {
    catalogues[key] = value;
    return;
  });
}

/**
 * Set the index of the book we are working on.
 * @param {number} index
 */
export function setBookIndex(index) {
  currentBookIndex = makeIndexSafe(index);
  console.log(`Set book index ${index}`);
}

/**
 * Set the index of the chapter we are working on.
 * @param {number} index
 */
export function setChapterIndex(index) {
  currentChapterIndex = makeIndexSafe(index);
  console.log(`Set chapter index ${index}`);
}

/**
 * Set the index of the lesson we are working on.
 * @param {number} index
 */
export function setLessonIndex(index) {
  currentLessonIndex = makeIndexSafe(index);
  console.log(`Set lesson index ${index}`);
}

/**
 * Get the library options.
 * @returns {Object<key, value>}
 */
export function getLibraryOptions() {
  const options = {};
  for (const key in libraries) {
    options[key] = libraries[key].title;
  }
  return options;
}

/**
 * Get list of all the book titles.
 * @returns {string[]}
 */
export function getBookTitles() {
  const titles = [];
  catalogues[currentLibrary].forEach((value) => {
    titles.push(value.title);
  });
  return titles;
}

/**
 * Get list of all the chapter titles.
 * @returns {string[]}
 */
export function getChapterTitles() {
  const titles = [];
  catalogues[currentLibrary][currentBookIndex].chapters.forEach((value) => {
    titles.push(value.title);
  });
  return titles;
}

/**
 * Get list of all the lesson titles.
 * @returns {string[]}
 */
export function getLessonTitles() {
  const titles = [];
  catalogues[currentLibrary][currentBookIndex].chapters[
    currentChapterIndex
  ].lessons.forEach((value) => {
    titles.push(value.title);
  });
  return titles;
}
