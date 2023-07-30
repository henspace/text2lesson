/**
 * @file Test for CachedLesson
 *
 * @module lessons\cachedLesson.test
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

import { CachedLesson } from './cachedLesson.js';
import { test, expect } from '@jest/globals';

test('Constructor creates CachedLesson with info and content', () => {
  const info = {
    field1: 99,
    field2: 100,
  };
  const content = 'A test string';

  const lesson = new CachedLesson(info, content);
  expect(lesson.info).toStrictEqual(info);
  expect(lesson.content).toStrictEqual(content);
});

test('Clone creates new CachedLesson with copies of info and content', () => {
  const info = {
    field1: 99,
    field2: 100,
  };
  const content = 'A test string';

  const lesson = new CachedLesson(info, content);
  const clonedLesson = CachedLesson.clone(lesson);

  lesson.info.field1 = 1099;
  lesson.info.field2 = 10100;
  lesson.content = 'Modified test string';

  expect(lesson.info.field1).toBe(1099);
  expect(lesson.info.field2).toBe(10100);
  expect(lesson.content).toBe('Modified test string');

  expect(clonedLesson.info.field1).toBe(99);
  expect(clonedLesson.info.field2).toBe(100);
  expect(clonedLesson.content).toBe('A test string');
});
