/**
 * @file Simple maths processing
 *
 * @module utils/text/maths
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

import { Entities } from './entities.js';

/**
 * This is a reversal of the parseMaths.
 * Most maths is done by using unicode characters but superscript, subscript
 * and block divisions use html tags.
 */
export function mathsToPlainText(data) {
  data = data.replace(
    /<table><tr><td>([^<]*)<\/td><\/tr><tr><td>([^<]*)<\/td><\/tr><\/table>/g,
    `$1 ${Entities.Maths.DIVIDE.unicode} $2`
  );
  data = data.replace('<sup>', '^');
  data = data.replace('</sup>', '');
  data = data.replace('<sub>', '_');
  data = data.replace('</sub>', '');
  return data;
}
