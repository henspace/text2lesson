/**
 * @file Calculate time needed to read text.
 *
 * @module utils/userIo/readSpeedCalculator
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

import { getPlainTextFromHtml } from '../text/textProcessing.js';

const AVERAGE_WORDS_PER_MINUTE = 130;

/**
 * Calculator for reading speeds.
 */
export class ReadSpeedCalculator {
  static MIN_WPM = 80;
  static MAX_WPM = 1000;
  /**
   * @type {number}
   */
  #secondsPerWord;

  /**
   * Construct the calculator
   * @param {number} [wordsPerMinute = AVERAGE_WORDS_PER_MINUTE]
   */
  constructor(wordsPerMinute = AVERAGE_WORDS_PER_MINUTE) {
    this.setWordsPerMinute(wordsPerMinute);
  }

  /**
   * Set the words per minute. This is clipped at ReadSpeedCalulator.MIN_WPM and ReadSpeedCalulator.MAX_WPM;
   * @param {number} wordsPerMinute
   */
  setWordsPerMinute(wordsPerMinute) {
    let wpm = parseInt(wordsPerMinute);
    if (isNaN(wpm)) {
      console.error(
        `Attempt made to set words per minute to non-numeric value of ${wordsPerMinute}`
      );
      return;
    }
    wpm = Math.max(wordsPerMinute, ReadSpeedCalculator.MIN_WPM);
    wpm = Math.min(wpm, ReadSpeedCalculator.MAX_WPM);
    this.#secondsPerWord = 60.0 / wpm;
  }

  /**
   * Calculate the read time for the data.
   * @param {string} data - this can be plain text or html
   */
  getSecondsToRead(data) {
    const plainText = getPlainTextFromHtml(data);
    const words = plainText.trim().split(/\s+/);
    return words.length * this.#secondsPerWord;
  }
}
