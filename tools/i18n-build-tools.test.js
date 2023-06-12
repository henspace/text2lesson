/**
 * @jest-environment node
 */
/**
 * @file Test routines for i18n-build-tools.
 * @module
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

import { Buffer } from 'node:buffer';
import * as nodePath from 'node:path';
import { jest } from '@jest/globals';

/**
 * German translations.
 * * missing: none
 * * unused: none
 * Note there is no expected validation report for German as nothing is missing.
 */
const DE_JSON = `{
  "one": "EINS",
  "two": "ZWEI",
  "three": "DREI",
  "four": "VIER"
}`;

/**
 * English translations to use as the master.
 * Note there is no expected validation report for English as this is the
 * master.
 */
const EN_JSON = `{
  "one": "ONE",
  "two": "TWO",
  "three": "THREE",
  "four": "FOUR"
}`;

/**
 * Spanish translations.
 * * "missing": "four"
 * * unused: none.
 */
const ES_JSON = `{
  "one": "UNO",
  "two": "DOS",
  "three": "TRES"
}`;

/**
 * Expected validation report
 */
const ES_REPORT_JSON = `{
  "master": "en-gb.json",
  "missing": {
    "four": "FOUR"
  },
  "unused": {
  }
}`;

/**
 * French translations.
 * * "missing": "two" and 'four'
 * * "unused": "five" and 'six'.
 */
const FR_JSON = `{
  "one": "UN",
  "three": "TROIS",
  "five": "CINQ",
  "six": "SEIZE"
}`;

/**
 * Expected validation report
 */
const FR_REPORT_JSON = `{
  "master": "en-gb.json",
  "missing": {
    "two": "TWO",
    "four": "FOUR"
  },
  "unused": {
    "five": "CINQ",
    "six": "SEIZE"
  }
}`;

/**
 * Italian translations.
 * * missing: none.
 * * "unused": "five"
 */
const IT_JSON = `{
  "one": "UNO",
  "two": "DUE",
  "three": "TRE",
  "four": "QUATTRO",
  "five": "CINQUE"
}`;

/**
 * Expected validation report
 */
const IT_REPORT_JSON = `{
  "master": "en-gb.json",
  "missing": {
  },
  "unused": {
    "five": "CINQUE"
  }
}`;

jest.unstable_mockModule('node:fs/promises', () => ({
  mkdir: jest.fn(() => Promise.resolve(undefined)),
  readdir: jest.fn(() => Promise.reject('Implement data handling per test.')),
  readFile: jest.fn((filePath) => {
    const filename = nodePath.basename(filePath);
    switch (filename) {
      case 'de.json':
        return Promise.resolve(DE_JSON);
      case 'en-gb.json':
        return Promise.resolve(EN_JSON);
      case 'es.json':
        return Promise.resolve(ES_JSON);
      case 'fr.json':
        return Promise.resolve(FR_JSON);
      case 'it.json':
        return Promise.resolve(IT_JSON);
    }
    return Promise.reject(`File ${filename} not found.`);
  }),
  rm: jest.fn(() => Promise.resolve(undefined)),
  writeFile: jest.fn(() => Promise.resolve(undefined)),
}));

const { mkdir, readdir, readFile, rm, writeFile } = await import(
  'node:fs/promises'
);

const i18n = await import('./i18n-build-tools.js');

/** Custom matcher for paths. As file-utils could be using relative or
 * absolute paths, this checks that the paths resolve to the same location.
 * The expected path can take more than one compenent which will be joined to
 * create the expectedPath.
 * @param {string} actualPath
 * @param {string} expectedPathsToJoin
 *
 * @returns {{message:function, pass: boolean}}
 */
function toMatchPath(actualPath, ...expectedPathsToJoin) {
  const expectedPath = nodePath.join(...expectedPathsToJoin);
  const pass = nodePath.relative(actualPath, expectedPath).length === 0;
  const message = () =>
    `expected ${this.utils.printReceived(actualPath)} ` +
    `to match ${this.utils.printReceived(expectedPath)}`;
  return {
    message: message,
    pass: pass,
  };
}

expect.extend({
  toMatchPath,
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('extractPlaceHolders should return string with only placeholders left', () => {
  expect(i18n.extractPlaceholders('testing ${one} and ${two} text')).toBe(
    '${one}${two}'
  );
  expect(i18n.extractPlaceholders('${one} and ${two}')).toBe('${one}${two}');
  expect(i18n.extractPlaceholders('testing ${one}${two}')).toBe('${one}${two}');
  expect(i18n.extractPlaceholders('testing and text')).toBe('');
  expect(
    i18n.extractPlaceholders("testing ${one} and ${()=>return('x')} text")
  ).toBe('${one}${*}');
  expect(
    i18n.extractPlaceholders("testing ${()=>{return('x');}} and ${two} text")
  ).toBe('${*}${two}');
});

test('I18nTransformer should transform text to keyword version', () => {
  const results = {};
  const transformer = new i18n.I18nTransformer(results);
  const input =
    'This is a test\n' +
    'Literal to translate i18n`Var zero ${var0}, var one ${var1}`\n' +
    'Literal to leave as-is `Do not touch`' +
    'Literal to leave as-is i18n`1234::Do not touch`';

  const buffer = Buffer.from(input, 'utf-8');
  const transformation = transformer.transform(buffer, 'JS').toString();
  expect(transformation).not.toMatch('i18n`Var zero ${var0}, var one ${var1}`');
  expect(transformation).toMatch(/i18n`\w+::\${var0}\${var1}`/);
  expect(transformation).toMatch('`Do not touch`');
  expect(transformation).toMatch('i18n`1234::Do not touch`');
});

describe('validateTranslation', () => {
  test('should identify no missing or unused tranlations', () => {
    const result = i18n.validateTranslation(
      'en.json',
      JSON.parse(EN_JSON),
      JSON.parse(DE_JSON)
    );
    expect(Object.keys(result)).toHaveLength(3);
    expect(result.master).toBe('en.json');
    expect(Object.keys(result.missing)).toHaveLength(0);
    expect(Object.keys(result.unused)).toHaveLength(0);
  });

  test('should identify missing and unused tranlations', () => {
    const result = i18n.validateTranslation(
      'en.json',
      JSON.parse(EN_JSON),
      JSON.parse(FR_JSON)
    );
    expect(Object.keys(result)).toHaveLength(3);
    expect(result.master).toBe('en.json');
    expect(Object.keys(result.missing)).toHaveLength(2);
    expect(result.missing.two).toBe('TWO');
    expect(result.missing.four).toBe('FOUR');
    expect(Object.keys(result.unused)).toHaveLength(2);
    expect(result.unused.five).toBe('CINQ');
    expect(result.unused.six).toBe('SEIZE');
  });

  test('should identify missing tranlations', () => {
    const result = i18n.validateTranslation(
      'en.json',
      JSON.parse(EN_JSON),
      JSON.parse(ES_JSON)
    );
    expect(Object.keys(result)).toHaveLength(3);
    expect(result.master).toBe('en.json');
    expect(Object.keys(result.missing)).toHaveLength(1);
    expect(result.missing.four).toBe('FOUR');
    expect(Object.keys(result.unused)).toHaveLength(0);
  });

  test('should identify unused tranlations', () => {
    const result = i18n.validateTranslation(
      'en.json',
      JSON.parse(EN_JSON),
      JSON.parse(IT_JSON)
    );
    expect(Object.keys(result)).toHaveLength(3);
    expect(result.master).toBe('en.json');
    expect(Object.keys(result.missing)).toHaveLength(0);
    expect(Object.keys(result.unused)).toHaveLength(1);
    expect(result.unused.five).toBe('CINQUE');
  });
});

test('createValidation should return filename with validation and report type', () => {
  expect(i18n.createReportFileName('test.json', 'error')).toBe(
    'test-validation-error.json'
  );
  expect(i18n.createReportFileName('test', 'warning')).toBe(
    'test-validation-warning'
  );
  expect(i18n.createReportFileName('test.', 'random')).toBe(
    'test-validation-random.'
  );
  expect(i18n.createReportFileName('en-GB.json', 'test')).toBe(
    'en-GB-validation-test.json'
  );
  expect(i18n.createReportFileName('', 'test')).toBe('-validation-test');
});

test('validateAllJsonFiles should produce a report for each file that has problems', () => {
  const DIRENTS = [
    { name: 'de.json', isFile: () => true, isDirectory: () => false },
    { name: 'en-gb.json', isFile: () => true, isDirectory: () => false },
    { name: 'es.json', isFile: () => true, isDirectory: () => false },
    { name: 'fr.json', isFile: () => true, isDirectory: () => false },
    { name: 'it.json', isFile: () => true, isDirectory: () => false },
    { name: 'sub-dir', isFile: () => false, isDirectory: () => true },
  ];

  readdir.mockResolvedValueOnce(DIRENTS);
  return i18n
    .validateAllJsonFiles('./somedir', 'en-gb.json', '/some/report/dir')
    .then((result) => {
      expect(readdir.mock.calls).toHaveLength(1);
      expect(readdir.mock.calls[0][0]).toMatchPath('./somedir');
      expect(readFile.mock.calls).toHaveLength(5);
      expect(writeFile.mock.calls).toHaveLength(3); //en is master and de has no errors.
      expect(JSON.parse(writeFile.mock.calls[0][1])).toEqual(
        JSON.parse(ES_REPORT_JSON)
      );
      expect(JSON.parse(writeFile.mock.calls[1][1])).toEqual(
        JSON.parse(FR_REPORT_JSON)
      );
      expect(JSON.parse(writeFile.mock.calls[2][1])).toEqual(
        JSON.parse(IT_REPORT_JSON)
      );
    });
});
