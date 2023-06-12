/**
 * @file Convert strings to colored versions
 * @module
 *
 * @license GPL-3.0-or-later
 * Lesson RunnerCreate quizzes and lessons from plain text files.
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

const BLACK = 30;
const RED = 31;
//const GREEN = 32;
const YELLOW = 33;
//const BLUE = 34;
//const MAGENTA = 35;
const CYAN = 36;
const WHITE = 37;

//const BG_BLACK = 40;
const BG_RED = 41;
//const BG_GREEN = 42;
const BG_YELLOW = 43;
const BG_BLUE = 44;
//const BG_MAGENTA = 45;
//const BG_CYAN = 46;
//const BG_WHITE = 47;

function toAnsiString(data, color, background) {
  const backgroundCode = background ? `\x1b[${background}m` : '';
  return `\x1b[${color}m${backgroundCode}${data}\x1b[0m`;
}

/**
 * Create heading data
 * @param {string} data
 * @returns Ansi formatted string
 */
function toHeading(data) {
  return toAnsiString(data, CYAN);
}

/**
 * Create big heading data
 * @param {string} data
 * @returns Ansi formatted string
 */
function toBigHeading(data) {
  return toAnsiString(data, WHITE, BG_BLUE);
}

/**
 * Create warning data
 * @param {string} data
 * @returns Ansi formatted string
 */
function toWarning(data) {
  return toAnsiString(data, YELLOW);
}

/**
 * Create big warning data
 * @param {string} data
 * @returns Ansi formatted string
 */
function toBigWarning(data) {
  return toAnsiString(data, BLACK, BG_YELLOW);
}

/**
 * Create error data
 * @param {string} data
 * @returns Ansi formatted string
 */
function toError(data) {
  return toAnsiString(data, RED);
}

/**
 * Create big error data
 * @param {string} data
 * @returns Ansi formatted string
 */
function toBigError(data) {
  return toAnsiString(data, WHITE, BG_RED);
}

export {
  toHeading,
  toBigHeading,
  toWarning,
  toBigWarning,
  toError,
  toBigError,
};
