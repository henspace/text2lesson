/**
 * @file Display cards
 *
 * @module lessons/presenters/displayCards
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

import { ReadSpeedCalculator } from '../../utils/userIo/readSpeedCalculator.js';
/**
 * @typedef {Object} CardDetail
 * @property {string} html - the html content.
 * @property {number} readTimeSecs - how long it will normally take to read a card in seconds.
 */

export class DisplayCards {
  /**
   * Html broken down into blocks.
   * @type {string[]}
   */
  #blocks;

  /**
   * @type {number}
   */
  #index;

  /**
   * @type {ReadSpeedCalculator}
   */
  #readSpeedCalculator;
  /**
   * Create the set of cards.
   * @param {*} html
   */
  constructor(html) {
    this.#blocks = this.#splitHtml(html);
    this.#index = 0;
    this.#readSpeedCalculator = new ReadSpeedCalculator();
  }

  /**
   * Get the current progress from 0 to 1
   * @returns {number}
   */
  get progress() {
    if (this.#blocks.length === 0) {
      return 1;
    } else {
      return this.#index / this.#blocks.length;
    }
  }

  /**
   * Breaks down the html into blocks. This is done by splitting at paragraphs
   * divs and code blocks.
   * @param {string} html
   */
  #splitHtml(html) {
    const blocks = html.split(/(<\/(?:p|div|pre)>)/i);
    const result = [];
    const iterations = Math.ceil(blocks.length / 2);
    for (let index = 0; index < iterations; index++) {
      const tail = blocks[index * 2 + 1] ?? '';
      result.push(`${blocks[index * 2]}${tail}`.trim());
    }
    return result.filter(
      (e) => !!e.replace(/(<\/?[a-zA-Z]+>|\s+)/g, '') // strips all tags and whitespace
    );
  }

  /**
   * Gets the next block. The index is increment after providing the block.
   * @returns {CardDetail} the next block or null
   */
  getNext() {
    if (this.#index < this.#blocks.length) {
      const html = this.#blocks[this.#index++];
      return {
        html: html,
        readTimeSecs: this.#readSpeedCalculator.getSecondsToRead(html),
      };
    }
    return null;
  }

  /**
   * Test to see if there are any more blocks to get.
   * @returns {boolean} true if there are more.
   */
  get hasMore() {
    return this.#index < this.#blocks.length;
  }

  /**
   * Resets the index to 0.
   */
  reset() {
    this.#index = 0;
  }

  /**
   * Set the words per minute of the underlying calculator.
   * @param {number} wpm
   */
  setWordsPerMinute(wpm) {
    this.#readSpeedCalculator.setWordsPerMinute(wpm);
  }
}
