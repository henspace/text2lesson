/**
 * @file Simple obfusctation for text.
 *
 * @module utils/text/obfuscator
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
 * Obfuscate the data.
 * The resulting obfucated string is safe for urls. Note that the obfuscation
 * is not in anyway secure; it is just intended to prevent casual browsing of the
 * source to reveal answers.
 *
 */
import * as base64 from './base64.js';

/**
 * Obfuscate the data. This is merely a base64 encoding.
 * @param {string} str
 * @returns {string}
 */
export function obfuscate(str) {
  return base64.stringToBase64(str);
}

/**
 * Deobfuscate the data. The obfuscation should have been performed by a previous
 * call to obfuscate.
 * @param {string} str
 * @returns {string}
 */
export function deobfuscate(str) {
  return base64.base64ToString(str);
}
