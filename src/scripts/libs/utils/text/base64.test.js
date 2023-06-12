/**
 * @file Test base64 utils
 *
 * @module libs/utils/text/base64.test
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

import * as base64 from './base64.js';
import { test, expect } from '@jest/globals';

/**
 * Test strings converted to base64 for testing using https://base64.guru/converter/encode/text
 */
test('Base64 encoding of simple text is correct', () => {
  expect(
    base64.stringToBase64(
      'abcdefghijklmnopqrstuvwxwzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    )
  ).toBe(
    'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4d3pBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODk='
  );
});

test('Base64 decoding of simple text is correct', () => {
  expect(
    base64.base64ToString(
      'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4d3pBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODk='
    )
  ).toBe('abcdefghijklmnopqrstuvwxwzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
});

test('Base64 encoding of UTF-16 text is correct', () => {
  expect(base64.stringToBase64('abc \x1234ABC ABC')).toBe(
    'YWJjJTIwJTEyMzRBQkMlMjBBQkM='
  );
});

test('Base64 decoding of UTF-16 text is correct', () => {
  expect(base64.base64ToString('YWJjJTIwJTEyMzRBQkMlMjBBQkM=')).toBe(
    'abc \x1234ABC ABC'
  );
});

test('Base64 encoding of URL special characters is correct', () => {
  expect(base64.stringToBase64(' $&+,/:;=?@"<>#%{}|\\^[]`')).toBe(
    'JTIwJTI0JTI2JTJCJTJDJTJGJTNBJTNCJTNEJTNGJTQwJTIyJTNDJTNFJTIzJTI1JTdCJTdEJTdDJTVDJTVFJTVCJTVEJTYw'
  );
});

test('Base64 decoding of URL special characters is correct', () => {
  expect(
    base64.base64ToString(
      'JTIwJTI0JTI2JTJCJTJDJTJGJTNBJTNCJTNEJTNGJTQwJTIyJTNDJTNFJTIzJTI1JTdCJTdEJTdDJTVDJTVFJTVCJTVEJTYw'
    )
  ).toBe(' $&+,/:;=?@"<>#%{}|\\^[]`');
});
