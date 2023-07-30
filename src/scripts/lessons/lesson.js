/**
 * @file Provides the `Lesson` class.
 *
 * @module lessons/lesson
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

/**
 * Encapsulation of a lesson.
 */
export class Lesson {
  /**
   * @type {Metadata}
   */
  #metadata;

  /**
   * @type {Problem[]}
   */
  #problems = [];

  /**
   * get the metadata
   * @returns {Metadata}
   */
  get metadata() {
    return this.#metadata;
  }

  /**
   * Set the metadata
   * @param {Metadata} value
   */
  set metadata(value) {
    this.#metadata = value;
  }

  /**
   * Add problem to the lesson.
   * @param {Problem} problem
   */
  addProblem(problem) {
    this.#problems.push(problem);
  }

  /**
   * Get the problems.
   * @returns {Problem[]}
   */
  get problems() {
    return this.#problems;
  }
}
