/**
 * @file Test routines for colors module.
 *
 * @module libs/utils/color/colorConversions.test
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
import * as Conversions from './colorConversions.js';
import { COLORS } from './testColors.test.js';

test('isDark - test determination of darkness', () => {
  for (const color of COLORS) {
    const expectedResult = Conversions.relativeLuminance(color.rgb) < 50;
    expect(Conversions.isDark(color.rgb)).toBe(expectedResult);
  }
});

/**
 * Test luminance. Test values taken from
 * [Color Relative Luminance Calculator](https://contrastchecker.online/color-relative-luminance-calculator).
 */
test('relativeLuminance - check calculation', () => {
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0, 0, 0))
  ).toBeCloseTo(0.0, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0x0ff, 0x0ff, 0x0ff))
  ).toBeCloseTo(100.0, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0x0ff, 0, 0))
  ).toBeCloseTo(21.3, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0, 0x0ff, 0))
  ).toBeCloseTo(71.5, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0, 0, 0x0ff))
  ).toBeCloseTo(7.2, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0x0ff, 0x0ff, 0))
  ).toBeCloseTo(92.8, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0x0ff, 0, 0x0ff))
  ).toBeCloseTo(28.5, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0, 0x0ff, 0x0ff))
  ).toBeCloseTo(78.7, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0x0aa, 0x0aa, 0x0aa))
  ).toBeCloseTo(40.2, 1);
  expect(
    Conversions.relativeLuminance(new Conversions.RGB(0x012, 0x0a6, 0x073))
  ).toBeCloseTo(28.6, 1);
});

test('rgbToHsl - test conversion', () => {
  for (const color of COLORS) {
    console.log(`Test RGB to HSL for  ${color.name}`);
    const hsl = Conversions.rgbToHsl(color.rgb);
    expect(hsl.hue).toBeCloseTo(color.hsl.hue, 1);
    expect(hsl.saturation).toBeCloseTo(color.hsl.saturation, 1);
    expect(hsl.luminance).toBeCloseTo(color.hsl.luminance, 1);
  }
});

test('hslToRgb - test conversion', () => {
  for (const color of COLORS) {
    const rgb = Conversions.hslToRgb(color.hsl);
    console.log(
      `Test HSL to RGB for ${color.name}.` +
        ` HSL ${color.hsl.hue}:${color.hsl.saturation}:${color.hsl.luminance}` +
        ` RGB ${color.rgb.red}:${color.rgb.green}:${color.rgb.blue}`
    );
    expect(Math.abs(rgb.red - color.rgb.red) <= 2).toBe(true);
    expect(Math.abs(rgb.green - color.rgb.green) <= 2).toBe(true);
    expect(Math.abs(rgb.blue - color.rgb.blue) <= 2).toBe(true);
  }
});

test('getDarker - test creation of a darker color', () => {
  for (const color of COLORS) {
    const delta = 7;
    const darkerRgb = Conversions.getDarker(color.rgb, delta);
    const darkerHsl = Conversions.rgbToHsl(darkerRgb);
    const expectedLuminance = Math.max(color.hsl.luminance - delta, 0);

    expect(Math.abs(darkerHsl.hue - color.hsl.hue)).toBeLessThan(2);
    expect(Math.abs(darkerHsl.saturation - color.hsl.saturation)).toBeLessThan(
      2
    );
    expect(Math.abs(expectedLuminance - darkerHsl.luminance)).toBeLessThan(1);
  }
});

test('getLighter - test creation of a lighter color', () => {
  for (const color of COLORS) {
    const delta = 7;
    const lighterRgb = Conversions.getLighter(color.rgb, delta);
    const lighterHsl = Conversions.rgbToHsl(lighterRgb);
    const expectedLuminance = Math.min(color.hsl.luminance + delta, 100);
    expect(Math.abs(lighterHsl.hue - color.hsl.hue)).toBeLessThan(2);
    expect(Math.abs(lighterHsl.saturation - color.hsl.saturation)).toBeLessThan(
      2
    );
    expect(Math.abs(expectedLuminance - lighterHsl.luminance)).toBeLessThan(1);
  }
});

test('shiftHue - test adjustment of hue', () => {
  for (let degrees = 0; degrees < 360; degrees += 60) {
    for (const color of COLORS) {
      if (color.hsl.luminance > 0 && color.hsl.luminance < 100) {
        console.log(`Test shiftHue for ${color.name} by ${degrees} degrees.`);
        const shifted = Conversions.shiftHue(color.rgb, degrees);
        const hsl = Conversions.rgbToHsl(shifted);
        const startHue = color.hsl.hue;
        const endHue = hsl.hue;
        const delta =
          endHue < startHue ? 360 - (startHue - endHue) : endHue - startHue;
        expect(Math.abs(degrees - delta)).toBeLessThan(2);
      } else {
        console.log('Skip trying to shift hue of black or white.');
      }
    }
  }
});

test('rgbToCss - test conversion to string', () => {
  for (const color of COLORS) {
    expect(Conversions.rgbToCss(color.rgb)).toMatch(
      `rgb(${color.rgb.red}, ${color.rgb.green}, ${color.rgb.blue})`
    );
  }
});
