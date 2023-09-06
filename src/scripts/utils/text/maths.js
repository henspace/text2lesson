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

const CHAR_CODE_UC_A = 'A'.charCodeAt(0);
const CHAR_CODE_LC_A = 'a'.charCodeAt(0);
const CHAR_CODE_ZERO = '0'.charCodeAt(0);

const CHAR_CODE_MATHS_UC_A = 0x1d434;
const CHAR_CODE_MATHS_LC_A = 0x1d44e;
const CHAR_CODE_MATHS_ZERO = 0x1d7f6;

/**
 * Convert single character to an maths equivalent.
 * @param {string} chr
 * @returns {string} maths character or just chr if not A-Z or a-z
 */
function getMathsCharacter(chr) {
  let mathsChr;
  if (chr >= 'A' && chr <= 'Z') {
    mathsChr = String.fromCodePoint(
      CHAR_CODE_MATHS_UC_A + chr.charCodeAt(0) - CHAR_CODE_UC_A
    );
  } else if (chr >= 'a' && chr <= 'z') {
    mathsChr = String.fromCodePoint(
      CHAR_CODE_MATHS_LC_A + chr.charCodeAt(0) - CHAR_CODE_LC_A
    );
  } else if (chr >= '0' && chr <= '9') {
    mathsChr = String.fromCodePoint(
      CHAR_CODE_MATHS_ZERO + chr.charCodeAt(0) - CHAR_CODE_ZERO
    );
  } else {
    return chr;
  }
  return mathsChr;
}

/**
 * Replace the word with the entity. The word must be surrounded
 * by non alphabetic characters or be at the end of the string.
 * @param {string} target - the string to search
 * @param {string} word - the word to look for
 * @param {string} entity - the replacement.
 */
function replaceWordWithEntity(data, word, entity) {
  const re = new RegExp(`(^|[^a-zA-Z])${word}($|[^a-zA-Z])`, 'g');
  return data.replace(re, `$1${entity}$2`);
}

/**
 * Replaces all occurrences of the letter with its associated entity.
 * Upper and lower case variants are replaced.
 * @param {string} data
 * @returns {string}
 */
function replaceGreekLetters(data) {
  for (const letter in Entities.Greek) {
    data = replaceWordWithEntity(data, letter, Entities.Greek[letter].unicode);
  }
  return data;
}

/**
 * @typedef {Object} Replacement
 * @property {RegExp} re - the expression to match.
 * @property {string | function(match, ...captures): string} rep - replacement. If a function is
 * passed, it is provided with the string that matched followed by the captured
 * groups.
 */

/**
 * Regex replacements that only create HTML entities. They must not
 * include any HTML tags in the output.
 * @type {Replacement[]}
 */
const replacementEntities = [
  {
    re: /\s*[-]\s*/g,
    rep: ` ${Entities.Maths.MINUS.unicode} `,
  },
  {
    re: /\s*[*]\s*/g,
    rep: ` ${Entities.Maths.TIMES.unicode} `,
  },
  {
    re: /\s+ne(?= )/g,
    rep: ` ${Entities.Maths.NOT_EQUAL.unicode} `,
  },
  {
    re: /\s*(!=|\/=)\s*/g,
    rep: ` ${Entities.Maths.NOT_EQUAL.unicode} `,
  },

  {
    re: /\s*(<|&lt;)=/g,
    rep: ` ${Entities.Maths.LESS_THAN_OR_EQUAL.unicode} `,
  },

  {
    re: /\s*(>|&gt;)=/g,
    rep: ` ${Entities.Maths.GREATER_THAN_OR_EQUAL.unicode} `,
  },

  {
    re: /(^|[^a-zA-Z])sqrt(?=[^a-zA-Z])/gi,
    rep: `$1${Entities.Maths.SQRT.unicode}`,
  },
  {
    re: /(^|[^a-zA-Z])sum(?=[^a-zA-Z])/gi,
    rep: `$1${Entities.Maths.SUM.unicode}`,
  },
  {
    re: /(^|[^a-zA-Z])int(?=[^a-zA-Z])/gi,
    rep: `$1${Entities.Maths.INTEGRAL.unicode}`,
  },
  {
    re: /(^|\s*)d:/g,
    rep: ` ${Entities.Maths.PARTIAL.unicode}`,
  },
  {
    re: /([a-zA-Z0-9])\.(?=[a-zA-Z])/g,
    rep: `$1${Entities.Maths.CENTRE_DOT.unicode}`,
  },
];

/**
 * Regex replacements that only replace characters. They must not
 * include any HTML tags in the output.
 * @type {Replacement[]}
 */
const replacementCharacters = [
  {
    re: /((?:^|[^&a-zA-Z])[a-zA-Z]+)/g,
    rep: (match, data) => {
      console.log(`parse maths ${data}`);
      let str = '';
      for (let chr of data) {
        str += getMathsCharacter(chr);
      }
      return str;
    },
  },
];

/**
 * Regex replacements that only replace digits. They must not
 * include any HTML tags in the output.
 * @type {Replacement[]}
 */
const replacementDigits = [
  {
    re: /([0-9]+)/g,
    rep: (match, data) => {
      console.log(`parse maths ${data}`);
      let str = '';
      for (let chr of data) {
        str += getMathsCharacter(chr);
      }
      return str;
    },
  },
];

/**
 * Regex replacements that include HTML tags in the output and which are only
 * valid in blocks.
 * @type {Replacement[]}
 */
const replacementsWithTagsBlockOnly = [
  {
    re: /((?:\(.*?\))|[^\s]+)\s*\/\s*((?:\(.*?\))|[^\s]+)/g,
    rep: '<table><tr><td>$1</td></tr><tr><td>$2</td></tr></table>',
  },
];

/**
 * Regex replacements that include HTML tags in the output and which are only
 * valid inline. The replacements don't necessarily have to contain tags, but
 * they can do.
 * @type {Replacement[]}
 */
const replacementsWithTagsInlineOnly = [
  {
    re: /\//g,
    rep: `${Entities.Maths.DIVIDE.unicode}`,
  },
];

/**
 * Regex replacements that include HTML tags in the output.
 * @type {Replacement[]}
 */
const replacementsWithTags = [
  {
    re: /\s*\^\s*((?:\(.*?\))|[^\s)]+)/g,
    rep: '<sup>$1</sup>',
  },
  {
    re: /\s*_\s*((?:\(.*?\))|[^\s)]+)/g,
    rep: '<sub>$1</sub>',
  },

  {
    re: /:/g,
    rep: '',
  },
  {
    re: / +/g,
    rep: '&nbsp;',
  },
  {
    re: new RegExp(`${Entities.Maths.INTEGRAL.unicode}`, 'gu'),
    rep: `<span class="high-symbol">${Entities.Maths.INTEGRAL.unicode}</span>`,
  },
  {
    re: new RegExp(`${Entities.Maths.SQRT.unicode}\\[([^\\]]*?)\\]`, 'gu'),
    rep: `<span class="radic">${Entities.Maths.SQRT.unicode}</span><span class="sqrt">$1</span>`,
  },
];

/**
 * Implement the replacements.
 * @param {string} target - that string that will have items replaced.
 * @param {Replacement} - the replacements
 * @returns {string} the resulting string.
 */
function implementReplacements(target, replacements) {
  for (const sub of replacements) {
    target = target.replace(sub.re, sub.rep);
  }
  return target;
}

/**
 * Simple parsing of maths data.
 * @param {string} data
 * @param {boolean} inline - true for a span, otherwise a div.
 * @returns {string}
 */
export function parseMaths(data, inline) {
  const tag = inline ? 'span' : 'div';
  data = replaceGreekLetters(data);
  data = implementReplacements(data, replacementEntities);
  data = implementReplacements(data, replacementDigits);
  data = implementReplacements(data, replacementCharacters);

  if (inline) {
    data = implementReplacements(data, replacementsWithTagsInlineOnly);
  } else {
    data = implementReplacements(data, replacementsWithTagsBlockOnly);
  }
  data = implementReplacements(data, replacementsWithTags);
  return ` <${tag} class="maths">${data}</${tag}> `;
}

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
