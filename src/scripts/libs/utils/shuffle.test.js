/**
 * @file Test shuffle routine
 *
 * @module libs\utils\shuffle.test
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
import { shuffle } from './shuffle.js';
import { test, expect } from '@jest/globals';

test('shuffle alters array', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8]; // this array needs to be in order.
  let copyOfData;
  [...copyOfData] = data;

  let shuffled = shuffle(copyOfData);
  let resultA;
  [...resultA] = shuffled;
  expect(shuffled).not.toStrictEqual(data);
  expect(shuffled.sort()).toStrictEqual(data);

  [...copyOfData] = data;
  shuffled = shuffle(copyOfData);
  expect(shuffled).not.toStrictEqual(resultA);
  expect(shuffled).not.toStrictEqual(data);
  expect(shuffled.sort()).toStrictEqual(data);
});
