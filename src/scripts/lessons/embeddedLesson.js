/**
 * @file Handle lesson provided via embedded data in the file.
 *
 * @module lessons/embeddedLesson
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
import { base64ToString } from '../utils/text/base64.js';
import { UnmanagedLesson } from './unmanagedLesson.js';
import { LessonOrigin } from './lessonOrigins.js';

/** Class to handle lesson provided via the embedded data. */
class EmbeddedLesson extends UnmanagedLesson {
  /**
   * Create the session lesson
   */
  constructor() {
    super(
      EmbeddedLesson.#getEmbeddedItem(
        'Embedded title',
        window.text2LessonEmbeddedData?.title
      ),
      EmbeddedLesson.#getEmbeddedItem(
        'Embedded source',
        window.text2LessonEmbeddedData?.source
      ),
      LessonOrigin.EMBEDDED
    );
  }

  /** Get the embedded root url. It will have the trailing /.
   * This is where the lesson originated.
   * @returns {string}
   */
  get rootUrl() {
    return window.text2LessonEmbeddedData?.rootUrl;
  }

  /**
   * Get the embedded translations.
   * @returns {string}
   */
  get translations() {
    return window.text2LessonEmbeddedData?.translations;
  }

  /**
   * Gets the stored item. All items stored are expected to be in base64.
   * @param {string} name - just used for logging.
   * @param {string} data
   * @returns {string}
   */
  static #getEmbeddedItem(name, data) {
    if (data) {
      try {
        return base64ToString(data);
      } catch (error) {
        console.error(
          `Could not decoded embedded variable ${name}. Data: ${data} `
        );
      }
    }
    return null;
  }
}

export const embeddedLesson = new EmbeddedLesson();
