/**
 * @file Tests for i18FileResolver
 *
 * @module utils/i18n/i18FileResolver.test
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

import { MockedJsonResponse } from '../../../jest-mocks/mockedJsonResponse.js';
import * as resolver from './i18FileResolver.js';
import { i18n, setActiveTranslations } from './i18n.js';
import { jest, beforeEach, test, expect } from '@jest/globals';

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

const LANGUAGE_LISTING_URL = 'languages.json';
const JSON_LOCATION = 'assets/test/';
const LANGUAGE_LISTING_JSON = `
{
  "meta": { 
    "master": "en.json"
  },
  "location": ${JSON.stringify(JSON_LOCATION)},
  "files": ["en-gb.json", "en-us.json", "en.json"]
}
`;

const EN_JSON = `{
  "key1": "First text in EN.",
  "key2": "Second text in EN.",
  "key3": "Third text in EN."
}`;

const EN_US_JSON = `{
  "key1": "First text in EN_US.",
  "key3": "Third text in EN_US."
}`;

let languagesGetter;

beforeEach(() => {
  setActiveTranslations({});
  setActiveTranslations({});
  jest.restoreAllMocks();
  languagesGetter = jest.spyOn(window.navigator, 'languages', 'get');
  languagesGetter.mockReturnValue(['en-us', 'en-gb', 'en']);
});

test('resolve should load EN-US with EN fall back', () => {
  // window.location.href = 'https://some-domain';
  console.log(`window location ${window.location.href}`);
  window.fetch
    .mockResolvedValueOnce(
      MockedJsonResponse.goodResponse(LANGUAGE_LISTING_JSON)
    )
    .mockResolvedValueOnce(MockedJsonResponse.goodResponse(EN_JSON))
    .mockResolvedValueOnce(MockedJsonResponse.goodResponse(EN_US_JSON));
  return resolver
    .resolveLanguages(LANGUAGE_LISTING_URL)
    .then((fetchSummary) => {
      expect(fetchSummary).toHaveLength(2);
      expect(fetchSummary[0].url.href).toBe(
        `${window.location.href}${JSON_LOCATION}en.json`
      );
      expect(fetchSummary[0].read).toBe(true);
      expect(fetchSummary[1].url.href).toBe(
        `${window.location.href}${JSON_LOCATION}en-us.json`
      );
      expect(fetchSummary[1].read).toBe(true);
      expect(window.fetch).toHaveBeenCalledTimes(3);
      expect(window.fetch.mock.calls[0][0]).toBe(LANGUAGE_LISTING_URL);
      expect(window.fetch.mock.calls[1][0]).toBe(
        `${window.location.href}${JSON_LOCATION}en.json`
      );
      expect(window.fetch.mock.calls[2][0]).toBe(
        `${window.location.href}${JSON_LOCATION}en-us.json`
      );
      expect(i18n`key1::`).toBe('First text in EN_US.');
      expect(i18n`key2::`).toBe('Second text in EN.');
    });
});

test('resolve should call reject with summary if first file not fetched', () => {
  // window.location.href = 'https://some-domain';
  console.log(`window location ${window.location.href}`);
  window.fetch.mockResolvedValueOnce(
    MockedJsonResponse.badResponse(404, 'Page not found')
  );
  return resolver.resolveLanguages(LANGUAGE_LISTING_URL).catch((error) => {
    const fetchSummary = error.fetchSummary;
    expect(fetchSummary).toHaveLength(0);
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch.mock.calls[0][0]).toBe(LANGUAGE_LISTING_URL);
    expect(error.message).toMatch(/404.*Page not found/);
    expect(i18n`key1::`).toBe('');
    expect(i18n`key2::`).toBe('');
  });
});

test('resolve should call reject with summary if second file not fetched', () => {
  // window.location.href = 'https://some-domain';
  console.log(`window location ${window.location.href}`);
  window.fetch
    .mockResolvedValueOnce(
      MockedJsonResponse.goodResponse(LANGUAGE_LISTING_JSON)
    )
    .mockResolvedValueOnce(
      MockedJsonResponse.badResponse(404, 'Page not found')
    );
  return resolver.resolveLanguages(LANGUAGE_LISTING_URL).catch((error) => {
    const fetchSummary = error.fetchSummary;
    expect(fetchSummary).toHaveLength(1);
    expect(fetchSummary[0].url.href).toBe(
      `${window.location.href}${JSON_LOCATION}en.json`
    );
    expect(fetchSummary[0].read).toBe(false);
    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(window.fetch.mock.calls[0][0]).toBe(LANGUAGE_LISTING_URL);
    expect(window.fetch.mock.calls[1][0]).toBe(
      `${window.location.href}${JSON_LOCATION}en.json`
    );
    expect(error.message).toMatch(/404.*Page not found/);
    expect(i18n`key1::`).toBe('');
    expect(i18n`key2::`).toBe('');
  });
});

test('resolve should call reject with summary if last file not fetched', () => {
  // window.location.href = 'https://some-domain';
  console.log(`window location ${window.location.href}`);
  window.fetch
    .mockResolvedValueOnce(
      MockedJsonResponse.goodResponse(LANGUAGE_LISTING_JSON)
    )
    .mockResolvedValueOnce(MockedJsonResponse.goodResponse(EN_JSON))
    .mockResolvedValueOnce(
      MockedJsonResponse.badResponse(404, 'Page not found')
    );
  return resolver.resolveLanguages(LANGUAGE_LISTING_URL).catch((error) => {
    const fetchSummary = error.fetchSummary;
    expect(fetchSummary).toHaveLength(2);
    expect(fetchSummary[0].url.href).toBe(
      `${window.location.href}${JSON_LOCATION}en.json`
    );
    expect(fetchSummary[0].read).toBe(true);
    expect(fetchSummary[1].url.href).toBe(
      `${window.location.href}${JSON_LOCATION}en-us.json`
    );
    expect(fetchSummary[1].read).toBe(false);
    expect(window.fetch).toHaveBeenCalledTimes(3);
    expect(window.fetch.mock.calls[0][0]).toBe(LANGUAGE_LISTING_URL);
    expect(window.fetch.mock.calls[1][0]).toBe(
      `${window.location.href}${JSON_LOCATION}en.json`
    );
    expect(window.fetch.mock.calls[2][0]).toBe(
      `${window.location.href}${JSON_LOCATION}en-us.json`
    );
    expect(error.message).toMatch(/404.*Page not found/);
    expect(i18n`key1::`).toBe('First text in EN.');
    expect(i18n`key2::`).toBe('Second text in EN.');
  });
});

test('resolve should call resolve with one file in summary if second file not required', () => {
  const MASTER_IS_PREF_JSON = `
  {
    "meta": { 
      "master": "en-us.json"
    },
    "location": ${JSON.stringify(JSON_LOCATION)},
    "files": ["en-gb.json", "en-us.json", "en.json"]
  }
  `;
  window.fetch
    .mockResolvedValueOnce(MockedJsonResponse.goodResponse(MASTER_IS_PREF_JSON))
    .mockResolvedValueOnce(MockedJsonResponse.goodResponse(EN_US_JSON));
  return resolver
    .resolveLanguages(LANGUAGE_LISTING_URL)
    .then((fetchSummary) => {
      expect(fetchSummary).toHaveLength(1);
      expect(fetchSummary[0].url.href).toBe(
        `${window.location.href}${JSON_LOCATION}en-us.json`
      );
      expect(fetchSummary[0].read).toBe(true);
      expect(window.fetch).toHaveBeenCalledTimes(2);
      expect(window.fetch.mock.calls[0][0]).toBe(LANGUAGE_LISTING_URL);
      expect(window.fetch.mock.calls[1][0]).toBe(
        `${window.location.href}${JSON_LOCATION}en-us.json`
      );
      expect(i18n`key1::`).toBe('First text in EN_US.');
      expect(i18n`key2::`).toBe('');
      expect(i18n`key3::`).toBe('Third text in EN_US.');
    });
});
