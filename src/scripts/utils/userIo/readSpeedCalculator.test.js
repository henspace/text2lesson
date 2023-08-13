/**
 * @file Test for the read speed calculator
 *
 * @module utils/userIo/readSpeedCalculator.test
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

import { ReadSpeedCalculator } from './readSpeedCalculator.js';
import { test, expect } from '@jest/globals';

test('Word calculation for plain text done at default of 130 wpm', () => {
  const expectedWordsPerMinute = 130;
  const nWords = 260;
  const expectedDuration = (nWords * 60.0) / expectedWordsPerMinute;
  let data = '  random_word '.repeat(nWords);
  const calculator = new ReadSpeedCalculator();
  expect(calculator.getSecondsToRead(data)).toBeCloseTo(expectedDuration, 0);
});

test('Word calculation for html text done at default of 130 wpm', () => {
  const expectedWordsPerMinute = 130;
  const nWords = 260;
  const expectedDuration = (nWords * 60.0) / expectedWordsPerMinute;
  let data =
    `   <div class="this tag should be ignored">random_word </div> `.repeat(
      nWords
    );
  const calculator = new ReadSpeedCalculator();
  expect(calculator.getSecondsToRead(data)).toBeCloseTo(expectedDuration, 0);
});

test('Word calculation for plain text done at wpm passed in constructor', () => {
  const expectedWordsPerMinute = 70;
  const nWords = 260;
  const expectedDuration = (nWords * 60.0) / expectedWordsPerMinute;
  let data = '  random_word '.repeat(nWords);
  const calculator = new ReadSpeedCalculator(expectedWordsPerMinute);
  expect(calculator.getSecondsToRead(data)).toBeCloseTo(expectedDuration, 0);
});
