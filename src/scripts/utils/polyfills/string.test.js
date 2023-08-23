/**
 * @file TEst the string polyfills
 *
 * @module utils/polyfills/string.test
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
import { beforeAll, test, expect } from '@jest/globals';

const testData = [
  {
    str: 'This is a test',
    pattern: 'is',
    replacement: 'was',
    expected: undefined,
  },
  {
    str: 'abc abc 123 123 abc abc',
    pattern: 'abc',
    replacement: 'XXX',
    expected: undefined,
  },
  {
    str: 'abc abc a2c 123 abc abc',
    pattern: /a.c/g,
    replacement: 'A?C',
    expected: undefined,
  },
];

beforeAll(async () => {
  testData.forEach((data) => {
    data.expected = data.str.replaceAll(data.pattern, data.replacement);
  });
  String.prototype.replaceAll = undefined;
  await import('./string.js');
});

test('polyfill the same as standard method', () => {
  testData.forEach((data) => {
    expect(data.str.replaceAll(data.pattern, data.replacement)).toBe(
      data.expected
    );
  });
});

test('Exception thrown if non-global regex used.', () => {
  expect.assertions(1);
  try {
    'test string'.replaceAll(/test/, 'TEST');
  } catch (error) {
    expect(error.name).toBe('TypeError');
  }
});
