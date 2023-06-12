/**
 * @file Source describing a problem
 *
 * @module lessons/problem-source
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

export class ProblemSource {
  /**
   * @type {string}
   */
  #introSource;
  /**
   * @type {string}
   */
  #questionSource;
  /**
   * @type {string[]}
   */
  #rightAnswerSources;
  /**
   * @type {string[]}
   */
  #wrongAnswerSources;
  /**
   * @type {string}
   */
  #explanationSource;

  constructor() {
    this.#introSource = '';
    this.#questionSource = '';
    this.#rightAnswerSources = [];
    this.#wrongAnswerSources = [];
    this.#explanationSource = '';
  }

  /**
   * Get the introduction data;
   */
  get introSource() {
    return this.#introSource;
  }
  /**
   * Set the introduction data;
   */
  set introSource(data) {
    this.#introSource = data;
  }

  /**
   * Get the question data;
   */
  get questionSource() {
    return this.#questionSource;
  }
  /**
   * Set the question data;
   */
  set questionSource(data) {
    this.#questionSource = data;
  }
  /**
   * Get the explanation data;
   */
  get explanationSource() {
    return this.#explanationSource;
  }
  /**
   * Set the explanation data;
   */
  set explanationSource(data) {
    this.#explanationSource = data;
  }

  /**
   * Get the right answers;
   */
  get rightAnswerSources() {
    return this.#rightAnswerSources;
  }

  /**
   * Get the wrong answers;
   */
  get wrongAnswerSources() {
    return this.#wrongAnswerSources;
  }

  /**
   * Add a new right answer
   * @param(string) data
   */
  addRightAnswerSource(data) {
    this.#rightAnswerSources.push(data);
  }

  /**
   * Add a new right answer
   * @param(string) data
   */
  addWrongAnswerSource(data) {
    this.#wrongAnswerSources.push(data);
  }
}
