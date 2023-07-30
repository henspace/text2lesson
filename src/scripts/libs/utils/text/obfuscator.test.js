/**
 * @file Test objuscation
 *
 * @module libs/utils/text/obfuscator.test
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

import * as obfuscator from './obfuscator.js';
import { test, expect } from '@jest/globals';

/**
 * Test strings converted to base64 for testing using https://base64.guru/converter/encode/text
 */

test('Obfuscation is reversed form of base64', () => {
  expect(obfuscator.obfuscate('abc123XYZ')).toBe('YWJjMTIzWFla');
});

test('Deobfuscation is reversed form of base64', () => {
  expect(obfuscator.deobfuscate('YWJjMTIzWFla')).toBe('abc123XYZ');
});

test('Deobfuscation of obfuscation agree', () => {
  let str = '';
  for (let n = 0; n < 1024; n++) {
    str += String.fromCharCode(n);
    const encoded = obfuscator.obfuscate(str);
    const decoded = obfuscator.deobfuscate(encoded);
    expect(encoded).not.toEqual(str);
    expect(encoded).not.toEqual(decoded);
    expect(decoded).toEqual(str);
  }
});
