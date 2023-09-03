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

const CHAR_CODE_UC_A = 'A'.charCodeAt(0);
const CHAR_CODE_LC_A = 'a'.charCodeAt(0);
const CHAR_CODE_ZERO = '0'.charCodeAt(0);

const CHAR_CODE_MATHS_UC_A = 0x1d434;
const CHAR_CODE_MATHS_LC_A = 0x1d44e;
const CHAR_CODE_MATHS_ZERO = 0x1d7f6;
/**
 * Names of Greek letters. First letter must be capitalised with others
 * in lower case.
 */
const GREEK_LETTERS = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'Iota',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
  'Xi',
  'Omicron',
  'Pi',
  'Rho',
  'Sigma',
  'Tau',
  'Upsilon',
  'Phi',
  'Chi',
  'Psi',
  'Omega',
];

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
 * Replaces all occurences of the letter with its associated entity.
 * Upper and lower case variants are replaced.
 * @param {string} data
 * @returns {string}
 */
function replaceGreekLetters(data) {
  for (let letter of GREEK_LETTERS) {
    data = replaceWordWithEntity(data, letter, `&${letter};`);
    letter = letter.toLowerCase();
    data = replaceWordWithEntity(data, letter, `&${letter};`);
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
    rep: ' &minus; ',
  },
  {
    re: /\s*[*]\s*/g,
    rep: ' &times; ',
  },
  {
    re: /\s+ne(?= )/g,
    rep: ' &ne; ',
  },
  {
    re: /\s*(!=|\/=)\s*/g,
    rep: ' &ne; ',
  },

  {
    re: /\s*(<|&lt;)=/g,
    rep: ' &le; ',
  },

  {
    re: /\s*(>|&gt;)=/g,
    rep: ' &ge; ',
  },

  {
    re: /(^|[^a-zA-Z])sqrt(?=[^a-zA-Z])/gi,
    rep: '$1&radic;',
  },
  {
    re: /(^|[^a-zA-Z])sum(?=[^a-zA-Z])/gi,
    rep: '$1&sum;',
  },
  {
    re: /(^|[^a-zA-Z])int(?=[^a-zA-Z])/gi,
    rep: '$1&int;',
  },
  {
    re: /(^|\s*)d:/g,
    rep: ' &part;',
  },
  {
    re: /([a-zA-Z0-9])\.(?=[a-zA-Z])/g,
    rep: '$1&sdot;',
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
 * Regex replacements that include HTML tags in the output.
 * @type {Replacement[]}
 */
const replacementsWithTags = [
  {
    re: /((?:\(.*?\))|[^\s]+)\s*\/\s*((?:\(.*?\))|[^\s]+)/g,
    rep: '<table><tr><td>$1</td></tr><tr><td>$2</td></tr></table>',
  },

  {
    re: /\s*\^\s*((?:\(.*?\))|[^\s)]+)/g,
    rep: '<sup>$1</sup>',
  },
  {
    re: /\s*_\s*((?:\(.*?\))|[^\s)]+)/g,
    rep: '<sub>$1</sub>',
  },

  {
    re: /;:/g,
    rep: ';',
  },
  {
    re: / +/g,
    rep: '&nbsp;',
  },
  {
    re: /(&int;)/g,
    rep: '<span class="high-symbol">$1</span>',
  },
  {
    re: /&radic;\[([^\]]*?)\]/g,
    rep: '<span class="radic">&radic;</span><span class="sqrt">$1</span>',
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
  data = implementReplacements(data, replacementsWithTags);
  return ` <${tag} class="maths">${data}</${tag}> `;
}
