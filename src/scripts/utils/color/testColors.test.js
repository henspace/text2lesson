/**
 * @file Colors for use in color tests.
 *
 * @module utils/colors/testColors.test
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
/*global test, expect */

import { RGB, HSL } from './colorConversions.js';

/**
 * Array of test colors
 * @type {{name: string, rgb: RGB, hsl: HSL}[]}
 */
export const COLORS = [
  {
    name: 'White',
    rgb: new RGB(255, 255, 255),
    hsl: new HSL(0, 0, 100),
  },
  {
    name: 'Black',
    rgb: new RGB(0, 0, 0),
    hsl: new HSL(0, 0, 0),
  },
  {
    name: 'Red',
    rgb: new RGB(255, 0, 0),
    hsl: new HSL(0, 100, 50),
  },
  {
    name: 'Green',
    rgb: new RGB(0, 255, 0),
    hsl: new HSL(120, 100, 50),
  },
  {
    name: 'Blue',
    rgb: new RGB(0, 0, 255),
    hsl: new HSL(240, 100, 50),
  },
  {
    name: 'Yellow',
    rgb: new RGB(255, 255, 0),
    hsl: new HSL(60, 100, 50),
  },
  {
    name: 'Fuschia',
    rgb: new RGB(255, 0, 255),
    hsl: new HSL(300, 100, 50),
  },
  {
    name: 'Aqua',
    rgb: new RGB(0, 255, 255),
    hsl: new HSL(180, 100, 50),
  },
  {
    name: 'IndianRed',
    rgb: new RGB(205, 92, 92),
    hsl: new HSL(0, 53, 58),
  },
  {
    name: 'Crimson',
    rgb: new RGB(220, 20, 60),
    hsl: new HSL(348, 83, 47),
  },
  {
    name: 'Gold',
    rgb: new RGB(255, 215, 0),
    hsl: new HSL(51, 100, 50),
  },
  {
    name: 'Orchid',
    rgb: new RGB(218, 112, 214),
    hsl: new HSL(302, 59, 65),
  },
  {
    name: 'DarkViolet',
    rgb: new RGB(148, 0, 211),
    hsl: new HSL(282, 100, 41),
  },
  {
    name: 'MediumSlateBlue',
    rgb: new RGB(123, 104, 238),
    hsl: new HSL(249, 80, 67),
  },
  {
    name: 'GreenYellow',
    rgb: new RGB(173, 255, 47),
    hsl: new HSL(84, 100, 59),
  },
  {
    name: 'AquaMarine',
    rgb: new RGB(127, 255, 212),
    hsl: new HSL(160, 100, 75),
  },
  {
    name: 'SteelBlue',
    rgb: new RGB(70, 130, 180),
    hsl: new HSL(207, 44, 49),
  },
];

test('COLORS - test validity of COLORS', () => {
  for (const color of COLORS) {
    expect(color).toHaveProperty('name');
    expect(color).toHaveProperty('rgb');
    expect(color).toHaveProperty('hsl');
  }
});
