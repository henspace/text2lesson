/**
 * @file Cached lesson
 *
 * @module lessons/cachedLesson
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

/**
 * @typedef {Object} CachedLesson - Retrieved lesson.
 * @property {module:lessons/lessonManager~LessonInfo} info
 * @property {string} content
 */

export class CachedLesson {
  #info;
  #content;
  /**
   * Create the cached lesson.
   * @param {module:lesson/lessonManager~LessonInfo} info - basic build information
   * @param {string} content - the lesson markdown content
   */
  constructor(info, content) {
    this.#info = info;
    this.#content = content;
  }

  /**
   * Set the lesson content.
   * @param {string} content - the markdown for the lesson.
   */
  set content(content) {
    this.#content = content;
  }

  /**
   * @returns {string} the content
   */
  get content() {
    return this.#content;
  }

  /**
   * @returns {module: lessons/lessonManager~LessonInfo} the info
   */
  get info() {
    return this.#info;
  }

  /**
   * Factory method to create `CachedLesson` by cloning.
   * @param {CachedLesson} other
   */
  static clone(other) {
    const cloned = new CachedLesson(null);
    cloned.#info = { ...other.info };
    cloned.#content = other.content;
    return cloned;
  }
}
