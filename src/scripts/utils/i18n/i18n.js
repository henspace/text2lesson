/**
 * @file Localisation routines.
 *
 * @module utils/i18n/i18n
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

import { escapeHtml } from '../text/textProcessing.js';
/**
 * @typedef {Object<string, string>} Translations - key: value pair. The key is
 * a unique identification for the translation.
 *
 * @type {Translations}
 */
let activeTranslations = null;

/**
 * @type {Translations}
 */
let fallbackTranslations = null;

export function areActiveTranslationsSet() {
  return activeTranslations !== null;
}

/**
 * Set the active translation. If an activeTranslation has already been set,
 * the existing entry is moved into the fallbackTranslations. So normally usage
 * would be to call setActiveTranslations with the master language and then call
 * setActiveTranslations again with the user's preferred language.
 * @param {Translations} translations - translations to use.
 */
export function setActiveTranslations(translations) {
  sanitiseTranslations(translations);
  if (activeTranslations) {
    fallbackTranslations = activeTranslations;
  }
  activeTranslations = translations;
}

/**
 * Escape the translation to prevent script injection via translation.
 * @param {Translations} translations
 */
function sanitiseTranslations(translations) {
  for (const key in translations) {
    translations[key] = escapeHtml(translations[key]);
  }
}
/**
 * Complete the template. Replacement values are inserted in the template at
 * locations marked with ${n}, where n is the index of the replacement provided
 * in the values. If n is omitted or is not a number, the index used is
 * derived from it's position in the template. So these are equivalent:
 * ```
 * 'This is my ${0} replacement ${1} string'
 * 'This is my ${} replacement ${} string'
 * 'This is my ${BUILD-INFO.date()} replacement ${BUILD-INFO.mode()} string'
 * ```
 * This means it is only necessary to amend the original placeholders if it is
 * necessary to rearrange the position of the strings.
 * @param {string} template template using ${} placeholders.
 * @param {string[]} values results of the replacement expressions from the original
 *  string literal.
 * @returns Completed template. HTML is escaped to prevent injection via tranlations.
 */
function completeTemplate(template, values) {
  let defaultIndex = 0;
  return template.replace(/\${(.*?)}/g, (match, index) => {
    index = parseInt(index);
    if (isNaN(index)) {
      index = defaultIndex++;
    }
    if (index < values.length) {
      return values[index];
    } else {
      console.error(`Cannot find {${index}} for "${template}"`);
      return '${?}';
    }
  });
}

/**
 * Tag function routine for template literals.
 * Translations are picked up from the activeTranslations if they exist.
 *
 * The template literal to which the tag function is applied should start with a
 * keyword like this:
 * ```
 * i18n`keyword::the normal ${varA} use ${varB}.`
 * ```
 * In the translations, ${varA} and ${varB} are referenced as ${0} ${1}.
 *
 * @see completeTemplate for more information about referencing the original
 * expression results.
 *
 * Do not use in constants defined at the module level as these could be
 * resolved prior to resolution of the language files. Use a function instead.
 *
 * @param {string[]} strings
 * @param  {...any} values
 * @returns resulting string.
 */
export function i18n(strings, ...values) {
  const keyMatch = strings[0].match(/(\w+?)::(.*)/);
  let keyword = '';
  let result = [];
  if (keyMatch) {
    keyword = keyMatch[1];
    result.push(keyMatch[2]);
  } else {
    result.push(strings[0]);
  }

  let template = activeTranslations ? activeTranslations[keyword] : null;
  if (!template) {
    template = fallbackTranslations ? fallbackTranslations[keyword] : null;
  }

  let output;
  if (template) {
    output = completeTemplate(template, values);
  } else {
    // just return default template literal as was.
    values.forEach((value, i) => {
      result.push(value);
      result.push(strings[i + 1]);
    });
    output = result.join('');
  }
  return output;
}

/**
 *
 * @returns the preferred language as defined in navigator.languages.
 */
export function getPreferredLanguages() {
  return navigator.languages;
}

/**
 * @typedef {Object} LanguageSubTags
 * @property {string} language - the primary language
 * @property {string} extlang - the first extended languages. Note that these
 * are not split, so multiple extended languages are concatenated but separated
 * by hyphens.
 * @property {string} script - the script
 * @property {string} region - the region
 */
/**
 * Decode an RFC5646 language tag.
 *
 * The tag is converted to lowercase first, so all subtags are in lowercase.
 * @param {string} languageTag - tag conforming to RFC5646
 * @returns {LanguageSubTags} the decoded language tag.
 */
export function extractLanguageSubTags(languageTag) {
  languageTag = languageTag.toLowerCase();
  var language = '';
  var extlang = '';
  var script = '';
  var region = '';

  const matches = languageTag.match(
    /^([a-z]{2,3})(-[a-z]{3}(?:-[a-z]{3}){0,2})?(-[a-z]{4})?(-(?:[a-z]{2}|[0-9]{3}))?([-].{5,})?$/
  );
  if (matches) {
    language = matches[1];
    extlang = matches[2] ? matches[2].substring(1) : '';
    script = matches[3] ? matches[3].substring(1) : '';
    region = matches[4] ? matches[4].substring(1) : '';
  }

  return {
    language: language,
    extlang: extlang,
    script: script,
    region: region,
  };
}

/**
 * Compares an array of preferred languages against an array of language files
 * and returns the best match. When comparing, the language subtag must always
 * match. A more specific match is normally preferred, with the region being
 * more important than the script subtag. However, the order of languages will
 * affect this. The closer a language is to the beginning of the
 * preferredLanguages array, the more important it is. Matching a language
 * closer to the start of the array, will out rank a more specific match to a
 * language further down the array.
 *
 * @param {string[]} preferredLanguages - array of preferred languages.
 * @param {string[]} availableLanguageFiles - array of file names. The file names
 * should follow be in the form of [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646)
 * tags followed by '.json'.
 * @returns the matching file name. Null if no match.
 */
export function getBestLanguageFile(
  preferredLanguages,
  availableLanguageFiles
) {
  const availableSubTags = availableLanguageFiles.map((entry) => {
    const languageTag = entry.toLowerCase().replace(/\.json$/i, '');
    return extractLanguageSubTags(languageTag);
  });
  const preferredSubTags = preferredLanguages.map((entry) => {
    return extractLanguageSubTags(entry);
  });

  let bestMatch = {
    weight: 0,
    file: null,
  };
  preferredSubTags.forEach((prefSubTag, prefIndexIgnored) => {
    const languageIndex = preferredSubTags.findIndex(
      (element) => element.language === prefSubTag.language
    );
    const prefSubTagRank = preferredSubTags.length - languageIndex;
    availableSubTags.forEach((availSubTag, availIndex) => {
      let weight = 0;
      if (prefSubTag.language === availSubTag.language) {
        weight += 100 * prefSubTagRank;
        if (
          prefSubTag.region !== '' &&
          prefSubTag.region === availSubTag.region
        ) {
          weight += 10;
        }
        if (
          prefSubTag.script !== '' &&
          prefSubTag.script === availSubTag.script
        ) {
          weight += 1;
        }
        if (weight > bestMatch.weight) {
          bestMatch.weight = weight;
          bestMatch.file = availableLanguageFiles[availIndex];
        }
      }
    });
  });
  return bestMatch.file;
}
