/**
 * @file Test for safeEncoder
 *
 * @module utils/safeEncoder.test
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

import './polyfills/string.js';
import { safeEncodeURIComponent } from './safeEncoder.js';

import { test, expect } from '@jest/globals';

test('Valid string encoded as expected.', () => {
  const testStr =
    '\x00¬`¬!"£$%^&*()_+={}[]:@;\'~#<,>.?/qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890|\t\f\n\\🍒🍇🍉👨‍👩‍👧\uD7FF\uE000';
  expect(safeEncodeURIComponent(testStr)).toBe(encodeURIComponent(testStr));
});

test('Invalid string encoded using toWellFormed.', () => {
  const testStr =
    '\x00¬`¬!"£$%^&*()_+={}[]:@;\'~#<,>.?/qwertyuiopasdfghjklzxcvbnm \uD900 QWERTYUIOPASDFGHJKLZXCVBNM1234567890|\t\f\n\\🍒🍇🍉👨‍👩‍👧\uD7FF\uE000';

  expect.assertions(2);
  try {
    encodeURIComponent(testStr);
  } catch (error) {
    expect(error).toBeInstanceOf(URIError);
  }
  expect(safeEncodeURIComponent(testStr)).toBe(
    encodeURIComponent(testStr.toWellFormed())
  );
});
