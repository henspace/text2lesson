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
import { ItemMarker } from './itemMarker.js';

/**
 * Encapsulation of a lesson.
 */
export class Lesson {
  /**
   * The raw data that formed the lesson.
   * @type {string}
   */
  #rawSource;

  /**
   * @type {Metadata}
   */
  #metadata;

  /**
   * @type {Problem[]}
   */
  #problems = [];

  /**
   * @type {number}
   */
  #problemIndex = 0;

  /**
   * Marker to keep track of scores
   * @type {Marker}
   */
  #marker = new ItemMarker();

  /**
   * Create the lesson with scores initialised to zero.
   * @param {string} rawSource
   */
  constructor(rawSource) {
    this.#rawSource = rawSource;
    this.#marker.reset();
  }

  /**
   * Get the original text from which the lesson was created.
   */
  get rawSource() {
    return this.#rawSource;
  }

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
   * Get the problems.
   * @returns {Problem[]}
   */
  get problems() {
    return this.#problems;
  }

  /**
   * Get the marks
   * @return {module:lessons/itemMarker~Marks}
   */
  get marks() {
    return this.#marker.marks;
  }

  /**
   * Get the time the marks were last updated.
   * @returns {Date}
   */
  get lastUpdated() {
    return this.#marker.lastUpdated;
  }

  /**
   * Get the progress from 0 to 1.
   * @returns {number}
   */
  get progress() {
    if (this.#problems.length === 0) {
      return 1;
    } else {
      return this.#problemIndex / this.#problems.length;
    }
  }
  /**
   * Add problem to the lesson.
   * @param {Problem} problem
   */
  addProblem(problem) {
    this.#problems.push(problem);
  }

  /**
   * Reset the problem index and marker.
   */
  restart() {
    this.#marker.reset();
    this.#problemIndex = 0;
  }

  /**
   * Check if there are more problems.
   * @returns {boolean} true if more questions remain to be answered.
   */
  get hasMoreProblems() {
    return this.#problemIndex < this.#problems.length;
  }

  /**
   * Check to see if the lesson is empty. This is not just a case of counting
   * the problems, as there can be one problem with no content, depending on how
   * the Markdown was parsed.
   */
  get isEmpty() {
    if (this.#problems.length === 0) {
      return true;
    } else {
      return !(
        this.#problems[0].intro?.html || this.#problems[0].question?.html
      );
    }
  }

  /**
   * Get next problem.
   * This advances the internal index.
   * If there aren't any more, it returns null;
   * @returns {Problem | null}
   */
  getNextProblem() {
    return this.#problemIndex < this.#problems.length
      ? this.#problems[this.#problemIndex++]
      : null;
  }

  /**
   * Gets the next problem but without advancing the internal index.
   * If there aren't any more, it returns null;
   * @returns {Problem | null}
   */
  peekAtNextProblem() {
    return this.#problemIndex < this.#problems.length
      ? this.#problems[this.#problemIndex]
      : null;
  }

  /**
   *
   * @param {Problem} problem
   * @param {module:lessons/marker.MarkStates} state
   */
  markProblem(problem, state) {
    this.#marker.markItem(problem, state);
  }
}
