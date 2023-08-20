/**
 * @file Base 64 functions
 *
 * @module utils/text/base64
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
 * Converts string to base64 represention. Note that the string is first encoded
 * so the base64 result represents the encoded version and not the original string.
 * @param {string} str - string to encode.
 * @returns {string}
 */
export function stringToBase64(str) {
  return window.btoa(encodeURIComponent(str));
}

/**
 * converts base64 string to a string.
 * It is assumed that the original string used to create the base64 version
 * was first encoded using encodeURIComponent.
 * As such the resulting base64 conversion is decoded using
 * decodeURIComponent before returning.
 * @param {string} base64
 * @returns {string}
 */
export function base64ToString(base64) {
  return decodeURIComponent(window.atob(base64));
}
