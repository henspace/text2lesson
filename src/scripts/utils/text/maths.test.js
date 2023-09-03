/**
 * @file Test the maths parser
 *
 * @module utils/text/maths.test
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

import { test, expect } from '@jest/globals';
import { parseMaths } from './maths.js';

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

function strToMath(str) {
  let result = '';
  for (const chr of str) {
    if (chr >= 'A' && chr <= 'Z') {
      result += String.fromCodePoint(
        0x1d434 + chr.charCodeAt(0) - 'A'.charCodeAt(0)
      );
    } else if (chr >= 'a' && chr <= 'z') {
      result += String.fromCodePoint(
        0x1d44e + chr.charCodeAt(0) - 'a'.charCodeAt(0)
      );
    } else if (chr >= '0' && chr <= '9') {
      result += String.fromCodePoint(
        0x1d7f6 + chr.charCodeAt(0) - '0'.charCodeAt(0)
      );
    } else {
      result += chr;
    }
  }
  return result;
}

test('maths wrapped in maths div', () => {
  expect(parseMaths('1 + 2')).toMatch(/<div class="maths">.*<\/div>/);
});

test('characters converted to maths characters', () => {
  expect(parseMaths('xy')).toMatch(strToMath('xy'));
  expect(parseMaths('XY')).toMatch(strToMath('XY'));
});

test('minus character becomes minus entity', () => {
  expect(parseMaths('32 - 42')).toMatch('&minus;');
  expect(parseMaths('32-42')).toMatch('&minus;');
  expect(parseMaths('-32')).toMatch('&minus;');
  expect(parseMaths('- -')).toMatch(/&minus;.*&minus;/);
});

test('* character becomes times entity', () => {
  expect(parseMaths('32 * 42')).toMatch('&times;');
  expect(parseMaths('32*42')).toMatch('&times;');
  expect(parseMaths('*32')).toMatch('&times;');
  expect(parseMaths('* *')).toMatch(/&times;.*&times;/);
});

test('ne surrounded by spaces  becomes ne entity', () => {
  expect(parseMaths('32 ne 42')).toMatch('&ne;');
  expect(parseMaths('done')).toMatch(strToMath('done'));
  expect(parseMaths(' ne ne ')).toMatch(/&ne;.*&ne;/);
});

test('/=  becomes ne entity', () => {
  expect(parseMaths('32 /= 42')).toMatch('&ne;');
  expect(parseMaths('32/=42')).toMatch('&ne;');
  expect(parseMaths(' /= /= ')).toMatch(/&ne;.*&ne;/);
});

test('!=  becomes ne entity', () => {
  expect(parseMaths('32 != 42')).toMatch('&ne;');
  expect(parseMaths('32!=42')).toMatch('&ne;');
  expect(parseMaths(' != != ')).toMatch(/&ne;.*&ne;/);
});

test('<=  becomes le entity', () => {
  expect(parseMaths('32 <= 42')).toMatch('&le;');
  expect(parseMaths('32<=42')).toMatch('&le;');
  expect(parseMaths('32 &lt;= 42')).toMatch('&le;');
  expect(parseMaths('32&lt;=42')).toMatch('&le;');
  expect(parseMaths(' <= <= ')).toMatch(/&le;.*&le;/);
});

test('>=  becomes ge entity', () => {
  expect(parseMaths('32 >= 42')).toMatch('&ge;');
  expect(parseMaths('32>=42')).toMatch('&ge;');
  expect(parseMaths('32 &gt;= 42')).toMatch('&ge;');
  expect(parseMaths('32&gt;=42')).toMatch('&ge;');
  expect(parseMaths(' >= >= ')).toMatch(/&ge;.*&ge;/);
});

test('sqrt  becomes radic entity', () => {
  expect(parseMaths('32 sqrt 42')).toMatch('&radic;');
  expect(parseMaths('sqrt 32')).toMatch('&radic;');
  expect(parseMaths('32sqrt42')).toMatch('&radic;');
  expect(parseMaths('asqrt')).toMatch(strToMath('asqrt'));
  expect(parseMaths('sqrta')).toMatch(strToMath('sqrta'));
  expect(parseMaths(' sqrt sqrt ')).toMatch(/&radic;.*radic;/);
});

test('[] following sqrt become span for styling', () => {
  const sqrtText = ' sqrt[1 + 7]';
  const sqrtResult = `<span class="radic">&radic;</span><span class="sqrt">${strToMath(
    '1'
  )}&nbsp;+&nbsp;${strToMath('7')}</span>`;
  const testStr = ` ${sqrtText}  ${sqrtText}`;
  const expected = `${sqrtResult}&nbsp;${sqrtResult}`;
  expect(parseMaths(testStr)).toMatch(expected);
});

test('sum  becomes sum entity', () => {
  expect(parseMaths('32 sum 42')).toMatch('&sum;');
  expect(parseMaths('sum 32')).toMatch('&sum;');
  expect(parseMaths('32sum42')).toMatch('&sum;');
  expect(parseMaths('asum')).toMatch(strToMath('asum'));
  expect(parseMaths('suma')).toMatch(strToMath('suma'));
  expect(parseMaths(' sum sum ')).toMatch(/&sum;.*&sum;/);
});

test('int  becomes int entity', () => {
  expect(parseMaths('32 int 42')).toMatch('&int;');
  expect(parseMaths('int 32')).toMatch('&int;');
  expect(parseMaths('32int42')).toMatch('&int;');
  expect(parseMaths('aint')).toMatch(strToMath('aint'));
  expect(parseMaths('inta')).toMatch(strToMath('inta'));
  expect(parseMaths(' int int ')).toMatch(/&int;.*&int;/);
});

test('dot between characters becomes centre dot', () => {
  const chrA = 'a';
  const chrB = 'b';
  const chrC = 'c';
  const mathsChrA = strToMath(chrA);
  const mathsChrB = strToMath(chrB);
  const mathsChrC = strToMath(chrC);
  expect(parseMaths(`${chrA}.${chrB}.${chrC}`)).toMatch(
    `${mathsChrA}&sdot;${mathsChrB}&sdot;${mathsChrC}`
  );
  expect(parseMaths(`${chrA} .${chrB}`)).toMatch(
    `${mathsChrA}&nbsp;.${mathsChrB}`
  );
  expect(parseMaths(`${chrA}. ${chrB}`)).toMatch(
    `${mathsChrA}.&nbsp;${mathsChrB}`
  );
  expect(parseMaths(`3.5`)).toMatch(strToMath(`3.5`));
});

test('dot between digit and character becomes centre dot', () => {
  const chrA = '6';
  const chrB = 'b';
  const chrC = 'c';
  const mathsChrA = strToMath(chrA);
  const mathsChrB = strToMath(chrB);
  const mathsChrC = strToMath(chrC);
  expect(parseMaths(`${chrA}.${chrB}.${chrC}`)).toMatch(
    `${mathsChrA}&sdot;${mathsChrB}&sdot;${mathsChrC}`
  );
  expect(parseMaths(`${chrA} .${chrB}`)).toMatch(
    `${mathsChrA}&nbsp;.${mathsChrB}`
  );
  expect(parseMaths(`${chrA}. ${chrB}`)).toMatch(
    `${mathsChrA}.&nbsp;${mathsChrB}`
  );
});

test('Greek letters substituted', () => {
  for (let letter of GREEK_LETTERS) {
    expect(parseMaths(`${letter} + ${letter}`)).toMatch(
      new RegExp(`&${letter};.*&${letter};`)
    );
    letter = letter.toLowerCase();
    expect(parseMaths(`${letter} + ${letter}`)).toMatch(
      new RegExp(`&${letter};.*&${letter};`)
    );
  }
});

test('Fractions supported', () => {
  let numerator = '3';
  let denominator = '6';
  let str = ` ${numerator}/${denominator}`;
  let result = parseMaths(str);
  expect(result).toMatch(
    `<table><tr><td>${strToMath(numerator)}</td></tr><tr><td>${strToMath(
      denominator
    )}</td></tr></table>`
  );
});

test('Fractions supported with space around operator', () => {
  let numerator = '3';
  let denominator = '6';
  let str = ` ${numerator} / ${denominator}`;
  let result = parseMaths(str);
  expect(result).toMatch(
    `<table><tr><td>${strToMath(numerator)}</td></tr><tr><td>${strToMath(
      denominator
    )}</td></tr></table>`
  );
});

test('Fractions supported with brackets', () => {
  let numerator = '(3 + 7)';
  let denominator = '(6 + 8)';
  let str = ` ${numerator} / ${denominator}`;
  let result = parseMaths(str);
  numerator = strToMath(numerator).replace(/ /g, '&nbsp;');
  denominator = strToMath(denominator).replace(/ /g, '&nbsp;');
  expect(result).toMatch(
    `<table><tr><td>${numerator}</td></tr><tr><td>${denominator}</td></tr></table>`
  );
});

test('Superscript supported', () => {
  let str = '3^2 + 8';
  let result = parseMaths(str);
  expect(result).toMatch(`${strToMath('3')}<sup>${strToMath('2')}</sup>`);
});

test('Superscript with spaces supported', () => {
  let str = '3 ^ 2 + 8';
  let result = parseMaths(str);
  expect(result).toMatch(`${strToMath('3')}<sup>${strToMath('2')}</sup>`);
});

test('Superscript with brackets supported', () => {
  let str = '3 ^ (2 + 7) + 8';
  let result = parseMaths(str);
  expect(result).toMatch(
    `${strToMath('3')}<sup>(${strToMath('2')}&nbsp;+&nbsp;${strToMath(
      '7'
    )})</sup>`
  );
});

test('Subscript supported', () => {
  let str = '3_2 + 8';
  let result = parseMaths(str);
  expect(result).toMatch(`${strToMath('3')}<sub>${strToMath('2')}</sub>`);
});

test('Subscript with spaces supported', () => {
  let str = '3 _ 2 + 8';
  let result = parseMaths(str);
  expect(result).toMatch(`${strToMath('3')}<sub>${strToMath('2')}</sub>`);
});

test('Subscript with brackets supported', () => {
  let str = '3 _ (2 + 7) + 8';
  let result = parseMaths(str);
  expect(result).toMatch(
    `${strToMath('3')}<sub>(${strToMath('2')}&nbsp;+&nbsp;${strToMath(
      '7'
    )})</sub>`
  );
});

test('Multiple spaces collapse into one nonbreaking space', () => {
  expect(parseMaths('3     *     6')).toMatch(
    `${strToMath('3')}&nbsp;&times;&nbsp;${strToMath('6')}`
  );
});

test('d: become part entity', () => {
  expect(parseMaths('d: d:')).toMatch('&part;&nbsp;&part;');
  expect(parseMaths(' d: d:')).toMatch('&part;&nbsp;&part;');
});

test('Colon can be used to separate greek letter from another letter, with the colon being dropped', () => {
  expect(parseMaths('  delta:t  ')).toMatch(`&delta;${strToMath('t')}`);
});

test('Integral given span with class of high-symbol', () => {
  const str = '  int  int ';
  const expectedResult =
    '<span class="high-symbol">&int;</span>' +
    '&nbsp;' +
    '<span class="high-symbol">&int;</span>';
  expect(parseMaths(str)).toMatch(expectedResult);
});
