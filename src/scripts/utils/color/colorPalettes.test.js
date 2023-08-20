/**
 * @file Tests for the color palettes
 *
 * @module utils/color/colorPalettes.test
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

/*global test, expect */

import { COLORS } from './testColors.test.js';
import * as Conversions from './colorConversions.js';
import * as Palettes from './colorPalettes.js';

test('getContrast - test the return of a contrasting color.', () => {
  for (const color of COLORS) {
    const contrast = Palettes.getContrast(color.rgb);
    if (Conversions.relativeLuminance(color.rgb) < 50) {
      expect(contrast.red).toBe(255);
      expect(contrast.green).toBe(255);
      expect(contrast.blue).toBe(255);
    } else {
      expect(contrast.red).toBe(0);
      expect(contrast.green).toBe(0);
      expect(contrast.blue).toBe(0);
    }
  }
});

test('getPaletteEntry - test creations of palette entries', () => {
  for (const color of COLORS) {
    const paletteEntry = Palettes.getPaletteEntry(color.rgb);
    const hslEntryBase = Conversions.rgbToHsl(paletteEntry.base);
    expect(hslEntryBase.hue).toEqual(color.hsl.hue);
    expect(paletteEntry.contrast).toEqual(Palettes.getContrast(color.rgb));
    if (Conversions.isDark(color.rgb)) {
      expect(paletteEntry.highlight).toEqual(
        Conversions.getLighter(color.rgb, 10)
      );
    } else {
      expect(paletteEntry.highlight).toEqual(
        Conversions.getDarker(color.rgb, 10)
      );
    }
  }
});

test('createPalette - test pallete creation', () => {
  for (const color of COLORS) {
    const palette = Palettes.createPalette(color.hsl.hue, color.hsl.saturation);
    expect(palette).toHaveProperty('primary');
    expect(palette).toHaveProperty('primary.base');
    expect(palette).toHaveProperty('primary.contrast');
    expect(palette).toHaveProperty('primary.highlight');

    expect(palette).toHaveProperty('secondary');
    expect(palette).toHaveProperty('secondary.base');
    expect(palette).toHaveProperty('secondary.contrast');
    expect(palette).toHaveProperty('primary.highlight');

    expect(palette).toHaveProperty('tertiary');
    expect(palette).toHaveProperty('tertiary.base');
    expect(palette).toHaveProperty('tertiary.contrast');
    expect(palette).toHaveProperty('primary.highlight');

    expect(palette).toHaveProperty('background');
    expect(palette).toHaveProperty('background.base');
    expect(palette).toHaveProperty('background.contrast');
    expect(palette).toHaveProperty('primary.highlight');

    expect(palette).toHaveProperty('window');
    expect(palette).toHaveProperty('window.base');
    expect(palette).toHaveProperty('window.contrast');
    expect(palette).toHaveProperty('primary.highlight');

    expect(palette).toHaveProperty('error');
    expect(palette).toHaveProperty('error.base');
    expect(palette).toHaveProperty('error.contrast');
    expect(palette).toHaveProperty('primary.highlight');
  }
});
