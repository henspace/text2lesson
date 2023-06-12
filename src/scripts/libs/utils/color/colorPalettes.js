/**
 * @file Tools to assist with creation of color palettes.
 *
 * @module libs/utils/color/colorPalettes
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

import * as Conversions from './colorConversions.js';
import * as cssVariables from './cssVariables.js';

/**
 * PaletteEntry details
 * @class
 * @param {RGB} base - the base color.
 * @param {RGB} contrast - the contrast color for items on the base.
 * @param {RBG} highlight - a 10% lighter or darker color.
 */
function PaletteEntry(base, contrast, highlight) {
  this.base = base;
  this.contrast = contrast;
  this.highlight = highlight;
}

/**
 * Palette details
 * @class
 * @param {object} config - configuration of the Palette
 * @param {PaletteEntry} config.primary - main color for elements
 * @param {PaletteEntry} config.secondary - secondary color for contrast
 * @param {PaletteEntry} config.tertiary - tertiary color. Rarely used.
 * @param {PaletteEntry} config.background - background for user entry and
 *    scrollable elements.
 * @param {PaletteEntry} config.window - for the main window;
 * @param {PaletteEntry} config.error - for error panels
 */
function Palette(config) {
  this.primary = config.primary;
  this.secondary = config.secondary;
  this.tertiary = config.tertiary;
  this.background = config.background;
  this.window = config.window;
  this.error = config.error;
}

/**
 * Get a contrasting colour of either white or black based on whether the
 * colour is regarded as dark. @See isDark.
 * @param {*} rgbColor
 * @returns {module:utils/color/colorConversions.RGB} white or black.
 */
export function getContrast(rgbColor) {
  if (Conversions.isDark(rgbColor)) {
    return { red: 255, green: 255, blue: 255 };
  } else {
    return { red: 0, green: 0, blue: 0 };
  }
}

/** Create a palette entry for the color.
 * @param {RGB} the main color for the entry.
 * @returns {PaletteEntry}
 */
export function getPaletteEntry(rgbColor) {
  const tintShadeAdjustment = 10;
  let highlight;
  if (Conversions.isDark(rgbColor)) {
    highlight = Conversions.getLighter(rgbColor, tintShadeAdjustment);
  } else {
    highlight = Conversions.getDarker(rgbColor, tintShadeAdjustment);
  }
  const contrastColor = getContrast(rgbColor);
  rgbColor = Conversions.ensureContrast(rgbColor, contrastColor, 7.5);
  return new PaletteEntry(rgbColor, contrastColor, highlight);
}

/**
 * @typedef {object}  Palette
 * @property {PaletteEntry} primary
 * @property {PaletteEntry} secondary
 * @property {PaletteEntry} tertiary
 */

/**
 * @typedef {Object} PaletteSettings
 * @property {number} hue 0 to 360
 * @property {number} saturation  - 0 to 100
 * @property {number} spread - 0 to 180. The separation between the primary color
 * and the secondary and tertiary colors.
 * @property {boolean} dark - true if dark palette required.
 */
/**
 * Create a palette based on the primary color.
 * @param {PaletteSettings} - settings used to configure the paletted.
 * @return {Palette}
 */
export function createPalette(settings) {
  const primaryHsl = new Conversions.HSL(
    settings.hue,
    settings.saturation,
    settings.dark ? 70 : 30
  );
  const primaryRgb = Conversions.hslToRgb(primaryHsl);
  const colors = [primaryRgb];
  let complementA = Conversions.shiftHue(primaryRgb, settings.spread);
  let complementB = Conversions.shiftHue(primaryRgb, -settings.spread);

  colors.push(complementA, complementB);
  colors.sort((a, b) => {
    const relLuminanceA = Conversions.relativeLuminance(a);
    const relLuminanceB = Conversions.relativeLuminance(b);
    if (relLuminanceA > relLuminanceB) {
      return 1;
    } else if (relLuminanceA < relLuminanceB) {
      return -1;
    }
    return 0;
  });
  // by sorting colors by lightest to darkest we can ensure our luminance shift
  // increases contrast rather than decreasing it.
  colors[0] = Conversions.getDarker(colors[0], 5);
  colors[2] = Conversions.getLighter(colors[0], 5);

  const errorHsl = new Conversions.HSL(0, settings.saturation, 50);
  const backgroundHsl = new Conversions.HSL(
    settings.hue,
    0,
    settings.dark ? 5 : 95
  );
  const windowHsl = new Conversions.HSL(
    settings.hue,
    0,
    settings.dark ? 0 : 100
  );

  return new Palette({
    primary: getPaletteEntry(primaryRgb),
    secondary: getPaletteEntry(complementA),
    tertiary: getPaletteEntry(complementB),
    background: getPaletteEntry(Conversions.hslToRgb(backgroundHsl)),
    window: getPaletteEntry(Conversions.hslToRgb(windowHsl)),
    error: getPaletteEntry(Conversions.hslToRgb(errorHsl)),
  });
}

/**
 * Set a CSS value
 * @param {string} key - property name
 * @param {PaletteEntry} paletteEntry - details fo the entry
 */
export function setCssFromPaletteEntry(key, paletteEntry) {
  for (const subkey in paletteEntry) {
    let contrast =
      (Conversions.relativeLuminance(paletteEntry.base) + 0.05) /
      (Conversions.relativeLuminance(paletteEntry.contrast) + 0.05);
    contrast = contrast < 1 ? 1 / contrast : contrast;

    cssVariables.setProperty(
      `--${key}-${subkey}`,
      Conversions.rgbToCss(paletteEntry[subkey])
    );
  }
}

/**
 * Set the CSS variables to the palette settings.
 * @param {Palette} palette
 */
export function setCssFromPalette(palette) {
  for (const entryKey in palette) {
    setCssFromPaletteEntry(entryKey, palette[entryKey]);
  }
}
