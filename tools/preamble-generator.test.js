/**
 * @jest-environment node
 */
/**
 * @file Tests for the preamble-generator
 * @module
 *
 * @license GPL-3.0-or-later
 * Lesson RunnerCreate quizzes and lessons from plain text files.
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

/*global test, expect */
import * as preambleGenerator from './preamble-generator';

test('createPreamble - check output', () => {
  const result = preambleGenerator.createCommentBlock(
    './licenses/bundle-preamble-gpl3.txt'
  );
  const lines = result.split('\n');

  expect(lines[0]).toBe('/**');
  expect(lines[1]).toMatch(/^ \* (.){2,} \d+\.\d+\.\d$/);
  expect(lines[2]).toMatch(/^ \* Lesson Runner.*$/);
  expect(lines[3]).toMatch(/^ \* Copyright \d{4} .*$/);
  expect(lines[6]).toMatch(/^ \* .*GNU General Public License.*$/);
  expect(lines[lines.length - 1]).toBe(' */');
});
