/**
 * @file Tests for problem source.
 *
 * @module lessons/problemSource.test
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

import { test, expect } from '@jest/globals';
import { ProblemSource } from './problemSource.js';

test('Getter and setter for metaSource match', () => {
  const block = new ProblemSource();
  const data = 'this is a test';
  block.metaSource = data;
  expect(block.metaSource).toBe(data);
});

test('Getter and setter for introSource match', () => {
  const block = new ProblemSource();
  const data = 'this is a test';
  block.introSource = data;
  expect(block.introSource).toBe(data);
});

test('Getter and setter for questionSource match', () => {
  const block = new ProblemSource();
  const data = 'this is a test';
  block.questionSource = data;
  expect(block.questionSource).toBe(data);
});

test('Getter and setter for explanationSource match', () => {
  const block = new ProblemSource();
  const data = 'this is a test';
  block.explanationSource = data;
  expect(block.explanationSource).toBe(data);
});

test('Append to rightAnswerSources correctly adds data', () => {
  const block = new ProblemSource();
  const data = ['test one', 'test 2', 'test 3'];
  data.forEach((value) => {
    block.addRightAnswerSource(value);
  });
  block.rightAnswerSources.forEach((value, index) => {
    expect(value).toBe(data[index]);
  });
});

test('Append to wrongAnswerSources correctly adds data', () => {
  const block = new ProblemSource();
  const data = ['test one', 'test 2', 'test 3'];
  data.forEach((value) => {
    block.addWrongAnswerSource(value);
  });
  block.wrongAnswerSources.forEach((value, index) => {
    expect(value).toBe(data[index]);
  });
});
