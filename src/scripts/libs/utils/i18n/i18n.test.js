/**
 * @file Test of i18n routines
 *
 * @module libs/utils/i18n/i18.test
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

/*global beforeEach, test, expect */
import { jest } from '@jest/globals';

import {
  i18n,
  setActiveTranslations,
  getPreferredLanguages,
  getBestLanguageFile,
  extractLanguageSubTags,
  areActiveTranslationsSet,
} from './i18n.js';

beforeEach(() => {
  setActiveTranslations(null);
});

test('i18n should return literal untouched if no translation', () => {
  var testText = 'Test A';
  var testNumber = 42;
  expect(i18n`${testText}${testNumber}`).toBe('Test A42');
});

test('i18n should translate literals according to key.', () => {
  const translations = {
    key1: 'var 0 ${0} var 1 ${1}',
    key2: 'var 0 ${} var 1 ${}',
    key3: 'var 0 ${some.text()} var 1 ${somemore text}',
    key4: 'var 1 ${1} var 0 ${0}',
  };
  setActiveTranslations(translations);
  const var0 = 'VARIABLE ZERO';
  const var1 = 'VARIABLE ONE';
  expect(i18n`key1::Untranslated ${var0} and ${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key1::${var0}${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key1::Untranslated ${var0}`).toBe(
    'var 0 VARIABLE ZERO var 1 ${?}'
  );
  expect(i18n`key2::Untranslated ${var0} and ${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key3::Untranslated ${var0} and ${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key4::Untranslated ${var0} and ${var1}`).toBe(
    'var 1 VARIABLE ONE var 0 VARIABLE ZERO'
  );
  expect(i18n`unknownKey::Untranslated ${var0} and ${var1}`).toBe(
    'Untranslated VARIABLE ZERO and VARIABLE ONE'
  );
});

test('i18n should use fallback if provided.', () => {
  const translations = {
    key1: 'var 0 ${0} var 1 ${1}',
    key2: 'var 0 ${} var 1 ${}',
    key4: 'var 1 ${1} var 0 ${0}',
  };
  const fallbackTranslations = {
    key1: 'FALLBACK var 0 ${0} var 1 ${1}',
    key2: 'FALLBACK var 0 ${} var 1 ${}',
    key3: 'FALLBACK var 0 ${some.text()} var 1 ${somemore text}',
    key4: 'FALLBACK var 1 ${1} var 0 ${0}',
  };
  setActiveTranslations(fallbackTranslations);
  setActiveTranslations(translations);
  const var0 = 'VARIABLE ZERO';
  const var1 = 'VARIABLE ONE';
  expect(i18n`key1::Untranslated ${var0} and ${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key1::${var0}${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key1::Untranslated ${var0}`).toBe(
    'var 0 VARIABLE ZERO var 1 ${?}'
  );
  expect(i18n`key2::Untranslated ${var0} and ${var1}`).toBe(
    'var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key3::Untranslated ${var0} and ${var1}`).toBe(
    'FALLBACK var 0 VARIABLE ZERO var 1 VARIABLE ONE'
  );
  expect(i18n`key4::Untranslated ${var0} and ${var1}`).toBe(
    'var 1 VARIABLE ONE var 0 VARIABLE ZERO'
  );
  expect(i18n`unknownKey::Untranslated ${var0} and ${var1}`).toBe(
    'Untranslated VARIABLE ZERO and VARIABLE ONE'
  );
});

test('i18n should escape any HTML to prevent script injection', () => {
  const translations = {
    key1: 'var 0 ${0} <div> var 1 ${1}',
    key2: '<script>var 0 ${} & var 1 ${}',
    key3: 'var 1 ${1} var 0 ${0} </script>',
  };
  setActiveTranslations(translations);
  const var0 = 'VARIABLE ZERO';
  const var1 = 'VARIABLE ONE';
  expect(i18n`key1::Untranslated ${var0} and ${var1}`).toBe(
    'var 0 VARIABLE ZERO &lt;div> var 1 VARIABLE ONE'
  );
  expect(i18n`key2::Untranslated ${var0} and ${var1}`).toBe(
    '&lt;script>var 0 VARIABLE ZERO &amp; var 1 VARIABLE ONE'
  );
  expect(i18n`key3::Untranslated ${var0} and ${var1}`).toBe(
    'var 1 VARIABLE ONE var 0 VARIABLE ZERO &lt;/script>'
  );
});

test('getPreferredLanguage should return values set by navigator.languages', () => {
  const languages = ['en-GB', 'en-US', 'en'];
  const languagesGetter = jest.spyOn(window.navigator, 'languages', 'get');
  languagesGetter.mockImplementationOnce(() => {
    return languages;
  });
  expect(getPreferredLanguages()).toEqual(languages);
  languagesGetter.mockRestore();
});

test('extractLanguageSubTags should extract language, extlang, script and region', () => {
  const languages = ['en', 'EN', 'zh', 'kok'];
  const extlangs = ['', '-abc', '-ABC-def', '-abc-def-GHI'];
  const scripts = ['', '-CYRL', '-cyrl'];
  const regions = ['', '-GB', '-us'];
  const extras = ['', '-additional subtags'];
  for (const language of languages) {
    for (const extlang of extlangs) {
      for (const script of scripts) {
        for (const region of regions) {
          for (const extra of extras) {
            const languageTag = `${language}${extlang}${script}${region}${extra}`;
            console.log(`Test parsing of ${languageTag}`);
            const result = extractLanguageSubTags(languageTag);
            expect(result.language).toBe(language.toLowerCase());
            expect(result.extlang).toBe(extlang.toLowerCase().substring(1));
            expect(result.script).toBe(script.toLowerCase().substring(1));
            expect(result.region).toBe(region.toLowerCase().substring(1));
          }
        }
      }
    }
  }
});

test('getBestLanguageFile should return best match', () => {
  expect(
    getBestLanguageFile(
      ['en', 'en-US', 'en-GB'],
      ['en.json', 'en-gb.json', 'us.json']
    )
  ).toBe('en-gb.json');

  expect(
    getBestLanguageFile(
      ['en', 'en-US', 'en-GB'],
      ['en.json', 'en-it.json', 'us.json']
    )
  ).toBe('en.json');

  expect(
    getBestLanguageFile(
      ['en', 'en-US', 'en-GB'],
      ['en.json', 'de-GB.json', 'us.json']
    )
  ).toBe('en.json');

  expect(
    getBestLanguageFile(
      ['en', 'en-US', 'en-cyrl-GB'],
      ['en.json', 'en-gb.json', 'en-cyrl-gb.json']
    )
  ).toBe('en-cyrl-gb.json');
});

test('getBestLanguageFile should prefer region over script match', () => {
  expect(
    getBestLanguageFile(
      ['en', 'en-US', 'en-cyrl-GB'],
      ['en.json', 'en-gb.json', 'en-cyrl.json']
    )
  ).toBe('en-gb.json');
});

test('getBestLanguageFile should require language match', () => {
  expect(
    getBestLanguageFile(
      ['en', 'en-US', 'en-cyrl-GB'],
      ['us.json', 'us-US.json', 'us-GB.json', 'us-cyrl.json', 'us-cyrl-GB.json']
    )
  ).toBeNull();
});

test('getBestLanguageFile should prefer first preferred over more specific', () => {
  expect(
    getBestLanguageFile(
      ['en', 'de-US', 'de-cyrl-GB'],
      ['de-US.json', 'de-cyrl-GB.json', 'en.json']
    )
  ).toBe('en.json');

  expect(
    getBestLanguageFile(
      ['en', 'de-US', 'de-cyrl-GB', 'en-GB'],
      ['de-US.json', 'en-gb.json', 'de-cyrl-GB.json', 'en.json']
    )
  ).toBe('en-gb.json');
});

test('areActiveTranslationsSet should return true if set.', () => {
  const translations = {
    key1: 'var 0 ${0} var 1 ${1}',
    key2: 'var 0 ${} var 1 ${}',
    key4: 'var 1 ${1} var 0 ${0}',
  };
  expect(areActiveTranslationsSet()).toBe(false);
  setActiveTranslations(translations);
  expect(areActiveTranslationsSet()).toBe(true);
});
