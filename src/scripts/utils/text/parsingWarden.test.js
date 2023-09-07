/**
 * @file Test parsing warden
 *
 * @module utils/text/parsingWarden.test
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

import { test, expect } from '@jest/globals';
import { ParsingWarden } from './parsingWarden.js';

test('Values can be protected and retrieved', () => {
  const data = [
    'This is a test string',
    'string 2',
    'string 3',
    'repeated',
    'repeated',
  ];
  const warden = new ParsingWarden();
  const keys = [];
  data.forEach((value) => {
    const key = warden.protect(value);
    expect(keys.indexOf(key)).toBe(-1); // unique if if value repeated
    expect(key).toMatch(/^[?]{3}\d+[a-zA-Z0-9+/]+:{0,2}[?]{3}$/);
    keys.push(key);
  });
  keys.forEach((key, index) => {
    const retrievedValue = warden.retrieve(key);
    expect(retrievedValue).toBe(data[index]);
    expect(warden.retrieve(key)).toBe(key); // no longer guarded.
  });
});

test('Clear removes data', () => {
  const data = [
    'This is a test string',
    'string 2',
    'string 3',
    'repeated',
    'repeated',
  ];
  const warden = new ParsingWarden();
  const keys = [];
  data.forEach((value) => {
    const key = warden.protect(value);
    expect(keys.indexOf(key)).toBe(-1); // unique if if value repeated
    expect(key).toMatch(/^[?]{3}\d+[a-zA-Z0-9+/]+:{0,2}[?]{3}$/);
    keys.push(key);
  });
  warden.clear();
  keys.forEach((key) => {
    expect(warden.retrieve(key)).toBe(key); // no longer guarded.
  });
});

test('Reinstate retrieves data', () => {
  const data = [
    'This is a test string',
    'string 2',
    'string 3',
    'repeated',
    'repeated',
  ];
  const warden = new ParsingWarden();
  const keys = [];
  data.forEach((value) => {
    const key = warden.protect(value);
    expect(keys.indexOf(key)).toBe(-1); // unique if if value repeated
    expect(key).toMatch(/^[?]{3}\d+[a-zA-Z0-9+/]+:{0,2}[?]{3}$/);
    keys.push(key);
  });

  const protectedString = keys.join('.join.');
  const retrieveString = warden.reinstate(protectedString);
  const expectedString = data.join('.join.');
  expect(retrieveString).toBe(expectedString);
});
