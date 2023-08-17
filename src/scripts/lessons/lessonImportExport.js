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

import { stringToBase64 } from '../utils/text/base64.js';
import { getAutoRunHtml } from '../data/templates/autorunHtml.js';
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
  getDataUri(data) {
    return `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
  }

  /**
   * Get a string version of the lesson.
   * @returns {string}
   */
  get lessonAsString() {
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
  getFilename(extension) {
    const safename = this.#title
      .replace(/[^A-Za-z0-9_-]/g, '_')
      .substring(0, 32);
    return `${safename}.${extension}`;
  }

  /**
   * Export the lesson by creating a temporary anchor and clicking it.
   */
  exportLesson() {
    this.saveDataToFile(stringToBase64(this.lessonAsString), 'txt');
  }

  /**
   * Export an autorun lesson.
   */
  exportAutoRunLesson() {
    const b64Title = stringToBase64(this.#title);
    const b64Data = stringToBase64(this.#content);
    const html = getAutoRunHtml(b64Title, b64Data);
    this.saveDataToFile(html, 'html');
  }

  /**
   * Save the data to file.
   * @param {string} data
   * @param {string} extension - without the leading period.
   */
  saveDataToFile(data, extension) {
    const tempA = document.createElement('a');
    tempA.setAttribute('href', this.getDataUri(data));
    tempA.setAttribute('download', this.getFilename(extension));
    tempA.addEventListener('click', () => {
      document.body.removeChild(tempA);
    });
    document.body.appendChild(tempA);
    tempA.click();
  }
}
