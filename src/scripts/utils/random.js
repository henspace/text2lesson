/**
 * @file Random number utilities
 *
 * @module utils/random
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
 * Get random number between min and max.
 * @param {number} min
 * @param {number} max
 * @return {number} min <= result < max
 */
function getRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Random number utilities
 */
export const Random = {
  /**
   * Get random number between min and max.
   * @param {number} min
   * @param {number} max
   * @return {number} min <= result < max
   */

  between: (min, max) => getRandomBetween(min, max),

  /**
   * Get random entry from an array between min and max.
   * @param {Array(*)} values
   * @return {number} min <= result < max
   */
  itemFrom: (values) => values[getRandomBetween(0, values.length)],
};
