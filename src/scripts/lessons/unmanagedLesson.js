/**
 * @file Class to handle unmanaged lessons
 *
 * @module lessons/unmanagedLesson
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

import { LessonSource } from './lessonSource.js';
import { escapeHtml } from '../utils/text/textProcessing.js';

/** Class to handle lesson provided via the a system outside of the normal
 * lesson manager approach. */
export class UnmanagedLesson {
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
   * @type {module:lessons/lessonManager.LessonOrigin}
   */
  #origin;

  /**
   * Create the unmanaged lesson
   * @param {string} title - the title of the lesson.
   * @param {string} data - the raw text for the lesson.
   * @param {module:lessons/lessonManager.LessonOrigin} origin - origin of the lesson
   */
  constructor(title, data, origin) {
    this.#title = title;
    if (data) {
      this.#lesson = this.#convertDataToLesson(data);
    }
    this.#origin = origin;
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
    return this.#getUnmanagedLessonInfo(escapeHtml(this.#title), this.#origin);
  }

  /**
   * Get unmanaged lesson information.
   * The lesson info is undefined except for the managed flag which is false and
   * the lesson title.
   * @param {string} lessonTitle
   * @param {LessonOrigin} origin - this should be EMBEDDED or FILE_SYSTEM if unmanaged
   * @returns {LessonInfo}
   */
  #getUnmanagedLessonInfo(lessonTitle, origin) {
    return {
      origin: origin,
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
}
