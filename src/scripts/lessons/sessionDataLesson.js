/**
 * @file Handle lesson provided via session data.
 *
 * @module lessons/sessionDataLesson
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
import { LessonSource } from './lessonSource.js';
import { lessonManager } from './lessonManager.js';
import { escapeHtml } from '../utils/text/textProcessing.js';

/** Class to handle lesson provided via the session storage. */
class SessionLesson {
  /**
   * @type {string}
   * @const
   */
  static DATA_KEY = 'data';
  static TITLE_KEY = 'title';

  /**
   * @type {string}
   */
  #data;

  /**
   * @type {string}
   */
  #title;

  /**
   * @type {module:lessons/lesson.Lesson}
   */
  #lesson;

  /**
   * Create the session lesson
   */
  constructor() {
    this.#title = this.#getSessionItem(SessionLesson.TITLE_KEY);
    const data = this.#getSessionItem(SessionLesson.DATA_KEY);
    if (data) {
      this.#lesson = this.#convertDataToLesson(data);
    }
  }

  /**
   * Convert the lesson data into a lesson.
   * @param {string} data
   * @returns {module:lessons/lesson.Lesson}
   */
  #convertDataToLesson(data) {
    const lessonSource = LessonSource.createFromSource(data);
    return lessonSource.convertToLesson();
  }
  /**
   * @returns {boolean} true if there is lesson data.
   */
  get hasLesson() {
    return !!this.#lesson;
  }

  /**
   * @returns {module:lessons/lesson.Lesson}
   */
  get lesson() {
    return this.#lesson;
  }

  /**
   * Get the lesson info
   */
  get lessonInfo() {
    return lessonManager.getUnmanagedLessonInfo(escapeHtml(this.#title));
  }

  /**
   * Gets the stored item. All items stored are expected to be in base64.
   * @param {string} key
   * @returns {string}
   */
  #getSessionItem(key) {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      return base64ToString(storedValue);
    } else {
      return storedValue;
    }
  }
}

export const sessionLesson = new SessionLesson();
