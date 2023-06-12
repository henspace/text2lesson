/**
 * @file Test file for json.js
 *
 * @module libs/utils/jsonUtils/json.test
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

import * as json from './json.js';
import { MockedJsonResponse } from '../../../../jest-mocks/mockedJsonResponse.js';
import { jest, test, expect } from '@jest/globals';

/**
 * Jest mock function.
 * @type {jest.fn}
 */
window.fetch = jest.fn((url) => {
  console.log(`In mocked fetch for url ${url}`);
  return Promise.resolve(
    MockedJsonResponse.badResponse(
      404,
      'Page not found. Mock the implementation.'
    )
  );
});

test('fetchJson should reject on 404 error', () => {
  return json
    .fetchJson('somepath')
    .then((value) => {
      expect(false).toBe(true); // shouldn't reach here.
      return value;
    })
    .catch((error) => {
      expect(error.message).toMatch(/404: Page not found/);
      return error;
    })
    .then(() => {
      expect.assertions(1);
    });
});

test('fetchJson should return decoded json object value on 404 error', () => {
  const data = {
    vara: 'one',
    varb: 'two',
    varc: 'three',
  };
  const jsonData = JSON.stringify(data);
  window.fetch.mockResolvedValueOnce(MockedJsonResponse.goodResponse(jsonData));
  return json.fetchJson('somepath', 'MyDefault').then((value) => {
    expect(value).toEqual(data);
    return value;
  });
});
