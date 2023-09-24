/**
 * @file Json utilities
 *
 * @module utils/jsonUtils/json
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

/**
 * Fetch json file.
 * @param {string} url path to the json file.
 * @returns {Promise} Fulfills to JavaScript object as a result of parsing the
 * file. On error, rejects with Error.
 */
export function fetchJson(url) {
  return fetchFile(url, 'json');
}

/**
 * Fetch text file.
 * @param {string} url path to the json file.
 * @returns {Promise} Fulfills to text. On error, rejects with Error.
 */
export function fetchText(url) {
  return fetchFile(url, 'text');
}

/**
 * Fetch file.
 * @param {string} url path to the json file.
 * @param {string} responseType - text or json.
 * @returns {Promise} Fulfills to text or JavaScript object as a result of
 * parsing the file. On error, rejects with Error.
 */
function fetchFile(url, responseType) {
  console.debug(`Fetch ${url}`);
  return fetch(url).then((response) => {
    if (!response.ok) {
      return Promise.reject(
        new Error(`${response.status}: ${response.statusText}; ${url}`)
      );
    }
    if (responseType.toLocaleLowerCase() === 'json') {
      return response.json();
    }
    return response.text();
  });
}
