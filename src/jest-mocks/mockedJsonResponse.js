/**
 * @file mocks for fetch
 * @module jest-mocks/MockedJsonResponse
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
 * Mock response objects for json fetches.
 */
export class MockedJsonResponse {
  constructor(jsonData) {
    this.data = jsonData;
    this.ok = true;
    this.status = 200;
    this.statusText = 'OK';
  }

  /**
   * Parse the json data.
   * @returns parsed Json data as object
   */
  json() {
    return JSON.parse(this.data);
  }

  /**
   * Factory method to create a successful fetch of Json data.
   * @param {string} json
   * @returns {MockedJsonResponse}
   */
  static goodResponse(json) {
    return new MockedJsonResponse(json);
  }
  /**
   * Factory method to create an unsuccessful fetch of Json data.
   * @param {number} status
   * @param {string} statusText
   * @returns {MockedJsonResponse}
   */
  static badResponse(status, statusText) {
    const mockedResponse = new MockedJsonResponse(null);
    mockedResponse.ok = false;
    mockedResponse.status = status;
    mockedResponse.statusText = statusText;
    return mockedResponse;
  }
}
