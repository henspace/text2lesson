/**
 * @file i18n utilities
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
import * as fsPromises from 'node:fs/promises';
import * as nodePath from 'node:path';
import { FileManager, StringTransformer } from './file-utils.js';
import * as crypto from 'node:crypto';

/**
 * Extract the placeholders from the template literal.
 * Complex placeholder expressions that contain additional { characters will
 * be returned as ${*}
 * @param {string} template - contents of the literal.
 * @returns {string} concatentated placeholders.
 */
export function extractPlaceholders(template) {
  const matches = template.match(/\${.+?}/g);
  if (matches) {
    matches.forEach((holder, index) => {
      if (holder.match(/\${.*({|=>)/)) {
        matches[index] = '${*}'; // sanitize misinterpreted placeholder
      }
    });
    return matches.join('');
  }
  return '';
}

/**
 * Wrapper for StringTransformer. This replaces template literals which have an
 * i18n tag function. The contents of the replacement template literal is a
 * template literal containing a hash of the originla followed by placeholders
 * from the original literal. So
 *
 * `i18n\`this is a test ${varA} of literal ${varB}\``
 *
 * becomes
 *
 * `i18n\`hash::${varA}${varB}\``
 *
 * The replacements made are collected and pushed into the collection array
 * provided in the constructor.
 *
 * The I18n strings must be be template literals with an i18n tag function.
 * a keyword version. @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals | template literals}
 * for more details
 * @implements {BufferTransformer}
 */
export class I18nTransformer {
  /**
   * Performs transformation of i18n strings.
   * @param {Translation[]} translatedStrings - array of
   *  translations used for collecting any transformations made.
   */
  constructor(translatedStrings) {
    const replacements = [
      {
        search: /i18n`(?!\w+::)(.*?)`/g,
        sub: (match, contents) => {
          const hash = crypto.createHash('md5').update(contents).digest('hex');
          const compacted = extractPlaceholders(contents);
          const result = `i18n\`${hash}::${compacted}\``;
          translatedStrings[`${hash}`] = contents;
          return result;
        },
        filetype: 'JS',
      },
    ];
    this.transformer = new StringTransformer(replacements);
  }

  /**
   * @see BufferTransformer#transfom
   */
  transform(buffer, filetype) {
    return this.transformer.transform(buffer, filetype);
  }
}

/**
 * Create a translation file. Any template literals with an i18n tag function
 * are replaced by a hashed version. @see I18nTransformer.
 * @param {string} scriptPath - path to script file. Beware! It will be
 *  overwritten. Normally this would be the build script.
 * @param {string} jsonPath - path to the destination JSON output. The file name
 * should be in the form path/xxxx.json where xxxx is an RFC5646 language tag.
 * @returns {Promise} Fulfils to undefined on success.
 */
export function extractI18nLiterals(scriptPath, jsonPath) {
  const matches = jsonPath.match(/([^\\\/][a-zA-Z-]+)\.json$/i);
  const translations = {
    language: matches[1],
    translator: 'Automatically generated from source.',
    comment: 'This file is automatically generated. Do not overwrite!',
  };
  const transformer = new I18nTransformer(translations);
  return FileManager.copyFile(scriptPath, scriptPath, transformer).then(() => {
    const json = JSON.stringify(translations, null, 2);
    return fsPromises.writeFile(jsonPath, json);
  });
}

/**
 * @typedef {Object} TranslationReport
 * @property {Translation[]} missing - missing translations
 * @property {Translation[]} unused - unused translations
 *
 * Check translations against a master. The translations are in the form
 * {Object<string, string}.
 * @param {string} masterFilename - the master language JSON filename.
 * @param {Translation[]} masterTranslations - master translations. Note this is not JSON.
 * @param {Translation[]} translations - translations to check. Note this is not JSON.
 * @returns {TranslationReport}
 */
export function validateTranslation(
  masterFilename,
  masterTranslations,
  translations
) {
  const missingTranslations = {};
  const unusedTranslations = {};
  for (const key in masterTranslations) {
    if (!Object.prototype.hasOwnProperty.call(translations, key)) {
      missingTranslations[key] = masterTranslations[key];
    }
  }

  for (const key in translations) {
    if (!Object.prototype.hasOwnProperty.call(masterTranslations, key)) {
      unusedTranslations[key] = translations[key];
    }
  }

  return {
    master: masterFilename,
    missing: missingTranslations,
    unused: unusedTranslations,
  };
}

/**
 * Converts a filename into a validation report filename.
 * XXX.YYY will become XXX.validation-result.YYY
 * @param {string} sourceName - source filename
 * @param {string} result - normally warning or error
 * @returns {string} new filename
 */
export function createReportFileName(sourceName, result) {
  return sourceName.replace(
    /^([a-zA-Z-]*)(\.?[a-zA-Z-]*)$/,
    `\$1-validation-${result}\$2`
  );
}

/**
 * Searches for all files
 * @param {string} translationDir - directory containing the files.
 * @param {string} masterFilename - master JSON file for the source text.
 * @param {string} reportDir - location of report files.
 * @returns {Promise} fulfils to number of files written.
 */
export function validateAllJsonFiles(
  translationDir,
  masterFilename,
  reportDir
) {
  let masterTranslations = {};
  return fsPromises
    .readFile(nodePath.join(translationDir, masterFilename))
    .then((buffer) => {
      masterTranslations = JSON.parse(buffer.toString('utf-8'));
      return FileManager.getAllMatchingFiles(
        translationDir,
        /^[a-zA-Z-]{2}\.json$/i
      );
    })
    .then((fileEntries) => {
      const promises = [];
      fileEntries.forEach((entry) => {
        if (entry.name != masterFilename) {
          promises.push(
            fsPromises
              .readFile(nodePath.join(translationDir, entry.name))
              .then((buffer) => {
                const translations = JSON.parse(buffer.toString('utf-8'));
                return validateTranslation(
                  masterFilename,
                  masterTranslations,
                  translations
                );
              })
              .then((validation) => {
                var reportType = '';
                if (Object.keys(validation.missing).length > 0) {
                  reportType = 'error';
                } else if (Object.keys(validation.unused).length > 0) {
                  reportType = 'warning';
                }
                if (reportType !== '') {
                  const json = JSON.stringify(validation, null, 2);
                  return fsPromises.writeFile(
                    nodePath.join(
                      reportDir,
                      createReportFileName(entry.name, reportType)
                    ),
                    json
                  );
                }
                return true;
              })
          );
        }
      });
      return Promise.all(promises);
    })
    .then((values) => values.length);
}