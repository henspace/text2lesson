/**
 * @file Utilities for managing dynamic palettes.
 *
 * @module utils/color/colorConversions
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

/**
 * @class
 * Encapsulate an RGB color.
 * @param {number} red - the red color. 0 to 255.
 * @param {number} green - the green color. 0 to 255.
 * @param {number} blue - the blur color. 0 to 255.
 */
export function RGB(red, green, blue) {
  /**
   * Red setting
   * @type{number}
   */
  this.red = red;
  /**
   * Green setting
   * @type{number}
   */
  this.green = green;
  /**
   * Blue setting
   * @type{number}
   */
  this.blue = blue;
}

/**
 * @class
 * Encapsulate an HSL color.
 * @param {number} hue - hue value. 0 to 360.
 * @param {number} saturation - saturation value. 0 to 100.
 * @param {number} luminance - luminance value. 0 to 100.
 */
export function HSL(hue, saturation, luminance) {
  /**
   * Colour's hue.
   * @type{number}
   */
  this.hue = hue;
  /**
   * Colour's saturation.
   * @type{number}
   */
  this.saturation = saturation;
  /**
   * Colour's luminance.
   * @type{number}
   */
  this.luminance = luminance;
}

/**
 * Calculate the relativeLuminance using the
 * [WCAG 2.x relative luminance](https://www.w3.org/WAI/GL/wiki/Relative_luminance)
 * definition. Note that in this function, variables are named to match the
 * equations in the WCAG defintion, and break the normal JavaScript style
 * guides.
 *
 * @param {RGB} rgbColor - color to convert
 * @returns {number} relative luminance. 0 to 100%. Although the WCAG
 * calculation normally returns a value from 0 to 1, this function returns a
 * value as a percentage to match the requirements of CSS.
 */
export function relativeLuminance(rgbColor) {
  const RsRGB = rgbColor.red / 255.0;
  const GsRGB = rgbColor.green / 255.0;
  const BsRGB = rgbColor.blue / 255.0;

  const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : ((RsRGB + 0.055) / 1.055) ** 2.4;
  const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : ((GsRGB + 0.055) / 1.055) ** 2.4;
  const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : ((BsRGB + 0.055) / 1.055) ** 2.4;

  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return L * 100;
}

/**
 * Test if the colour should be treated as dark.
 * @param {module:utils/color/colorConversions.RGB} rgbColor
 * @returns true if relative luminance is less than 50%.
 */
export function isDark(rgbColor) {
  return relativeLuminance(rgbColor) < 50;
}

/**
 * Convert RGB values to HSL.
 * See [Math behind colorspace conversions](https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/)
 * @param {RGB} rgbValue - color to convert.
 * @returns {HSL} - HSL value.
 * Hue: 0 to 360; saturation: 0 to 100; luminance: 0 to 100. Values are rounded
 * to integers.
 */
export function rgbToHsl(rgbValue) {
  const RsRGB = rgbValue.red / 255.0;
  const GsRGB = rgbValue.green / 255.0;
  const BsRGB = rgbValue.blue / 255.0;

  const minChannelValue = Math.min(RsRGB, GsRGB, BsRGB);
  const maxChannelValue = Math.max(RsRGB, GsRGB, BsRGB);
  const channelRange = maxChannelValue - minChannelValue;

  const luminance = (minChannelValue + maxChannelValue) / 2.0;

  if (Math.abs(channelRange) < 0.001) {
    return {
      hue: 0,
      saturation: 0,
      luminance: Math.round(luminance * 100),
    };
  }

  let saturation = 0;
  if (luminance <= 0.5) {
    saturation = channelRange / (minChannelValue + maxChannelValue);
  } else {
    saturation = channelRange / (2.0 - maxChannelValue - minChannelValue);
  }

  let hue = 0;
  if (channelRange !== 0) {
    if (Math.abs(maxChannelValue - RsRGB) < 0.001) {
      hue = (GsRGB - BsRGB) / channelRange;
    } else if (Math.abs(maxChannelValue - GsRGB) < 0.001) {
      hue = 2.0 + (BsRGB - RsRGB) / channelRange;
    } else {
      hue = 4.0 + (RsRGB - GsRGB) / channelRange;
    }
  }
  hue *= 60.0;
  if (hue < 0) {
    hue += 360;
  }

  return {
    hue: Math.round(hue),
    saturation: Math.round(saturation * 100),
    luminance: Math.round(luminance * 100),
  };
}

/**
 * Conversion of HSL value to RGB. Conversion from
 * [Wikipedia HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV).
 * Variable names are chosen to follow as closely as possible the equations
 * on WikiPedia rather than conforming to JavaScript style conventions. For
 * example `Htick` is equivalent to `H'`.
 * @param {HSL} hslValue - HSL value to convert
 * @param {*} saturation - 0 to 100
 * @param {*} luminance  - 0 to 100
 * @returns {RGB} RGB value.
 */
export function hslToRgb(hslValue) {
  const S = hslValue.saturation / 100.0;
  const L = hslValue.luminance / 100.0;

  const C = (1 - Math.abs(2.0 * L - 1.0)) * S;
  const Htick = hslValue.hue / 60.0;
  const X = C * (1 - Math.abs((Htick % 2) - 1));
  let RGBtick = {};
  if (0 <= Htick && Htick < 1) {
    RGBtick = { red: C, green: X, blue: 0 };
  } else if (Htick < 2) {
    RGBtick = { red: X, green: C, blue: 0 };
  } else if (Htick < 3) {
    RGBtick = { red: 0, green: C, blue: X };
  } else if (Htick < 4) {
    RGBtick = { red: 0, green: X, blue: C };
  } else if (Htick < 5) {
    RGBtick = { red: X, green: 0, blue: C };
  } else {
    RGBtick = { red: C, green: 0, blue: X };
  }

  const m = L - C / 2.0;
  return new RGB(
    Math.round(255.0 * (RGBtick.red + m)),
    Math.round(255.0 * (RGBtick.green + m)),
    Math.round(255.0 * (RGBtick.blue + m))
  );
}

/**
 * Get a darker version of a color.
 * @param {RGB} rgbColor - the RGB color
 * @param {number} delta - the amount by which to shift the luminance.
 * @returns {RGB}
 */
export function getDarker(rgbColor, delta) {
  const hslColor = rgbToHsl(rgbColor);
  hslColor.luminance -= delta;
  hslColor.luminance = Math.max(hslColor.luminance, 0);
  return hslToRgb(hslColor);
}

/**
 * Get a lighter version of a color.
 * @param {RGB} rgbColor - the RGB color
 * @param {number} delta - the amount by which to shift the luminance.
 * @returns {RGB}
 */
export function getLighter(rgbColor, delta) {
  const hslColor = rgbToHsl(rgbColor);
  hslColor.luminance += delta;
  hslColor.luminance = Math.min(hslColor.luminance, 100);
  return hslToRgb(hslColor);
}

/**
 * Get the contrast between color A and B. The contrast is alway >= 1.
 * @param {RGB} rgbColorA
 * @param {RGB} rgbColorB
 * @returns {number} contrast
 */
export function getContrast(rgbColorA, rgbColorB) {
  const relLuminanceA = relativeLuminance(rgbColorA) / 100.0;
  const relLuminanceB = relativeLuminance(rgbColorB) / 100.0;
  const contrast = (relLuminanceA + 0.05) / (relLuminanceB + 0.05);
  return contrast < 1 ? 1.0 / contrast : contrast;
}

/**
 * Adjust rgbColor to ensure minimum contrast
 * @param {*} rgbColor - color to adjust
 * @param {*} rgbColorReference - color against which contrast is required.
 * @param {*} minContrast - minimum constrast
 */
export function ensureContrast(rgbColor, rgbColorReference, minContrast) {
  const refIsDark = isDark(rgbColorReference);
  const deltaL = 5;
  let loopLimit = Math.floor(100 / deltaL);
  while (
    loopLimit-- &&
    getContrast(rgbColor, rgbColorReference) < minContrast
  ) {
    rgbColor = refIsDark
      ? getLighter(rgbColor, deltaL)
      : getDarker(rgbColor, deltaL);
  }
  return rgbColor;
}

/**
 * Rotate hue around the color wheel.
 * @param {RGB} rgbValue color
 * @param {number} degrees - rotation.
 * @returns {RGB} adjusted color.
 */
export function shiftHue(rgbValue, degrees) {
  const hsl = rgbToHsl(rgbValue);
  const originalHue = hsl.hue;
  hsl.hue += degrees;
  hsl.hue %= 360;
  if (hsl.hue < 0) {
    hsl.hue += 360;
  }
  return hslToRgb(hsl);
}

/**
 * Convert a color to a CSS string representation.
 * @param {RGB} rgbColor color to convert
 * @returns {string}
 */
export function rgbToCss(rgbColor) {
  return `rgb(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue})`;
}
