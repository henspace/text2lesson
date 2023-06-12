/**
 * @file Test the lesson class
 *
 * @module lessons/lesson.test
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

import { Lesson } from './lesson.js';
import { Problem } from './problem.js';
import { test, expect } from '@jest/globals';

test('metadata set and get access metadata property', () => {
  const metadata = 'test string';
  const lesson = new Lesson();
  expect(lesson.metadata).toBeUndefined();
  lesson.metadata = metadata;
  expect(lesson.metadata).toBe(metadata);
});

test('addProblem add to array of problems.', () => {
  const lesson = new Lesson();
  for (let n = 0; n < 4; n++) {
    const problem = new Problem();
    problem.intro = `intro${n}`;
    lesson.addProblem(problem);
  }
  const problems = lesson.problems;
  expect(problems).toHaveLength(4);
  problems.forEach((value, index) => {
    expect(value.intro).toBe(`intro${index}`);
  });
});
