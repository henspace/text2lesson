/**
 * @file Utilities for handling errors.
 *
 * @module libs/utils/errorHandling/errors
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

import * as base64 from '../text/base64.js';

/**
 * Escape content so that it is safe to include in an attribute.
 * This is primarily to prevent translations corrupting the HTML.
 * @param {string} content
 * @returns {string}
 */
export function escapeAttribute(content) {
  return base64.stringToBase64(content);
}

/**
 * Unescape attribute previously escaped.
 * @param {string} escapedContent
 * @returns {string}
 */
export function unescapeAttribute(escapedContent) {
  return base64.base64ToString(escapedContent);
}

/**
 * Get string for `data-error` attribute suitable for inserting into an HTML tag.
 * The return is `data-error="escapedMessage"`
 * @param {string} message
 * @returns {string}
 */
export function getErrorAttributeHtml(message) {
  return `data-error="${escapeAttribute(message)}"`;
}
