/**
 * @file Polyfills and shims for String
 *
 * @module utils/polyfills/string
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
 * Implement replaceAll function if not already implemented.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll}
 *
 * @param {string} str - the source string
 * @param {string | RegExp} pattern - the pattern to look for in the source string
 * @param {string} replacement - the replacement
 */

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function stringReplaceAll(
    pattern,
    replacement
  ) {
    if (pattern instanceof RegExp) {
      if (pattern.flags.indexOf('g') < 0) {
        throw new TypeError(
          'String.prototype.replaceAll called with a non-global RegExp argument'
        );
      }
      return this.replace(pattern, replacement);
    } else {
      return this.replace(new RegExp(pattern, 'g'), replacement);
    }
  };
}

function isLeadingSurrogate(codePoint) {
  return codePoint >= 0xd800 && codePoint <= 0xdbff;
}

function isTrailingSurrogate(codePoint) {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff;
}

const UNICODE_REPLACEMENT = '\uFFFD';

/**
 * Replace lone surrogates with UNICODE_REPLACEMENT
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toWellFormed}
 * @param {string} str
 * @returns {string}
 */
export function toWellFormed(str) {
  if (!str) {
    return str;
  }
  let result = '';
  for (const chr of str) {
    const codePoint = chr.codePointAt(0);
    if (isLeadingSurrogate(codePoint) || isTrailingSurrogate(codePoint)) {
      result += UNICODE_REPLACEMENT; // next character is not a trailing surrogate
    } else {
      result += chr;
    }
  }
  return result;
}

/**
 * Shim toWellFormed
 */
if (!String.prototype.toWellFormed) {
  String.prototype.toWellFormed = function toWellFormed() {
    const str = this;
    if (!str) {
      return str;
    }
    let result = '';
    for (const chr of str) {
      const codePoint = chr.codePointAt(0);
      if (isLeadingSurrogate(codePoint) || isTrailingSurrogate(codePoint)) {
        result += UNICODE_REPLACEMENT; // next character is not a trailing surrogate
      } else {
        result += chr;
      }
    }
    return result;
  };
}
