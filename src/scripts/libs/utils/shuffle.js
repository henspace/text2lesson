/**
 * @file Array shuffling
 *
 * @module libs/utils/shuffle
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
 * Shuffle the Array
 * @param {*[]} data - the array to shuffle
 */
export function shuffle(data) {
  var count = data.length;
  // While there remain elements to shuffle…
  while (count) {
    const index = Math.floor(Math.random() * count--);
    [data[count], data[index]] = [data[index], data[count]];
  }
  return data;
}
