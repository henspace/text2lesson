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
import { UnmanagedLesson } from './unmanagedLesson.js';
import { LessonOrigin } from './lessonManager.js';

/** Class to handle lesson provided via the session storage. */
class SessionLesson extends UnmanagedLesson {
  /**
   * @type {string}
   * @const
   */
  static DATA_KEY = 'data';
  static TITLE_KEY = 'title';

  /**
   * Create the session lesson
   */
  constructor() {
    super(
      SessionLesson.#getSessionItem(SessionLesson.TITLE_KEY),
      SessionLesson.#getSessionItem(SessionLesson.DATA_KEY),
      LessonOrigin.SESSION
    );
  }

  /**
   * Gets the stored item. All items stored are expected to be in base64.
   * @param {string} key
   * @returns {string}
   */
  static #getSessionItem(key) {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      return base64ToString(storedValue);
    } else {
      return storedValue;
    }
  }
}

export const sessionLesson = new SessionLesson();
