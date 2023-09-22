/**
 * @file Safe versions of encode functions
 *
 * @module utils/safeEncoder
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

/**
 * Encode the uri. This just calls encodeURIComponent. If it fails, the string
 * will be converted using `toWellFormed()` to remove any lone surrogates.
 * The function `toWellFormed` is not called by default as it is expensive and
 * lone surrogates are unlikely to be encountered.
 * @param {string} uri
 * @returns {string}
 * @throws {URIError}
 */
export function safeEncodeURIComponent(uri) {
  try {
    return encodeURIComponent(uri);
  } catch (error) {
    console.error(error);
    return encodeURIComponent(uri.toWellFormed());
  }
}
