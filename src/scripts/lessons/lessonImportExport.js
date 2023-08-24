/**
 * @file Importers and Exporters for lesson data.
 *
 * @module lessons/lessonImportExport
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

import { base64ToString, stringToBase64 } from '../utils/text/base64.js';
import { getAutorunHtml } from '../data/templates/autorunHtml.js';
import { ModalDialog } from '../utils/userIo/modalDialog.js';
import { icons } from '../utils/userIo/icons.js';
import { i18n } from '../utils/i18n/i18n.js';

/**
 * @typedef {Object} LessonImportExportSummary
 * @property {string} title - the lesson's title
 * @property {string} content - the source text for the lesson
 */
/**
 * Class to handle exporting of a lesson.
 */
export class LessonExporter {
  /**
   * @type {string}
   */
  #title;

  /**
   * @type {string}
   */
  #content;

  /**
   * Constuctor
   * @param {string} title - lesson title
   * @param {string} content - lesson source
   */
  constructor(title, content) {
    this.#title = title;
    this.#content = content;
  }

  /**
   * Get a uri for the data.
   * @param {string} data
   */
  #getDataUri(data) {
    return `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
  }

  /**
   * Get a string version of the lesson.
   * @returns {string}
   */
  get #lessonAsString() {
    return JSON.stringify({
      title: this.#title,
      content: this.#content,
    });
  }

  /**
   * Get a safe filename based on the title.
   * @param {string} extension - do not include the leading period.
   * @return {string}
   */
  #getFilename(extension) {
    const safename = this.#title
      .replace(/[^A-Za-z0-9_-]/g, '_')
      .substring(0, 32);
    return `${safename}.${extension}`;
  }

  /**
   * Export the lesson by creating a temporary anchor and clicking it.
   * @returns {Promise} fulfils to undefined
   */
  exportLesson() {
    return ModalDialog.showDialog(
      i18n`Select type of export`,
      i18n`Select the type of export required. AutoRun files provide an easy way for users to run a lesson.`,
      {
        dialogType: ModalDialog.DialogType.QUESTION,
        buttons: [icons.export, icons.exportAutoRun],
      }
    ).then((index) => {
      if (index === 0) {
        return this.exportBase64Lesson();
      } else {
        return this.exportAutorunLesson();
      }
    });
  }

  /**
   * Export the lesson by creating a temporary anchor and clicking it.
   */
  exportBase64Lesson() {
    this.saveDataToFile(stringToBase64(this.#lessonAsString), 'txt');
  }

  /**
   * Export an autorun lesson.
   */
  exportAutorunLesson() {
    const b64Title = stringToBase64(this.#title);
    const b64Data = stringToBase64(this.#content);
    const html = getAutorunHtml(b64Title, b64Data);
    this.saveDataToFile(html, 'html');
  }

  /**
   * Save the data to file.
   * @param {string} data
   * @param {string} extension - without the leading period.
   */
  saveDataToFile(data, extension) {
    const tempA = document.createElement('a');
    tempA.setAttribute('href', this.#getDataUri(data));
    tempA.setAttribute('download', this.#getFilename(extension));
    tempA.addEventListener('click', () => {
      document.body.removeChild(tempA);
    });
    document.body.appendChild(tempA);
    tempA.click();
  }
}

export class LessonImporter {
  /**
   * Create the importer.
   */
  constructor() {}

  /**
   * Convert data previously saved by a call to exportPlainData or plain text.
   * @param {string} exportedData
   * @returns {LessonImportExportSummary} null if fails.
   */
  convert(exportedData) {
    let result = this.#getSummaryFromBase64File(exportedData);
    if (result) {
      return result;
    }

    result = this.#getSummaryFromAutorunFile(exportedData);
    if (result) {
      return result;
    }
    return this.#getSummaryFromPlainTextFile(exportedData);
  }

  /**
   * Try to decode data using base64.
   * @param {string} data
   * @returns {LessonImportExportSummary} null if not decoded.
   */
  #getSummaryFromBase64File(data) {
    const match = data.match(/^[a-zA-Z0-9+/=]+$/);
    if (match) {
      try {
        return JSON.parse(base64ToString(data));
      } catch (error) {
        console.error(error);
      }
    }
    return null;
  }

  /**
   * Try to decode data assuming its an autorun file.
   * @param {string} data
   * @returns {LessonImportExportSummary} null if not decoded.
   */
  #getSummaryFromAutorunFile(data) {
    const match = data.match(
      /const LESSON_TITLE_B64\s*=\s*['"]([a-zA-Z0-9+/=]+)['"];\s*const LESSON_SOURCE_B64\s*=\s*['"]([a-zA-Z0-9+/=]+)['"];/
    );
    if (match) {
      try {
        return {
          title: base64ToString(match[1]),
          content: base64ToString(match[2]),
        };
      } catch (error) {
        console.error(error);
      }
    }
    return null;
  }

  /**
   * Simple check to see if the data is plain text.
   * Looks for a question or introduction line.
   * @param {string} data
   * @returns {boolean} true if plain text file.
   */
  #getSummaryFromPlainTextFile(data) {
    if (data.match(/^ {0,3}(?:\(*([i?])\1*[) ]+)(.*)$/m)) {
      return {
        title: '',
        content: data,
      };
    } else {
      return null;
    }
  }
}
