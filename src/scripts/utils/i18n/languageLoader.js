/**
 * @file Load the appropriate languages.
 *
 * @module utils/i18n/languageLoader
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

import { BuildInfo } from '../../data/constants.js';
import { base64ToString } from '../text/base64.js';
import { setActiveTranslations } from './i18n.js';
import { resolveLanguages } from './i18FileResolver.js';
/**
 * Get the language files required for the application.
 * If the application has not been build, the application just returns a fulfilled
 * Promise.
 * @param {string} embeddedLanguages - embedded language definition from previous call to
 * @returns {Promise} Fulfils to undefined.
 */
export function getLanguages(embeddedLanguages) {
  if (!BuildInfo.isBuilt()) {
    return Promise.resolve(undefined);
  }
  if (embeddedLanguages) {
    try {
      const languages = JSON.parse(base64ToString(embeddedLanguages));
      if (languages.fallback) {
        setActiveTranslations(languages.fallback);
      }
      setActiveTranslations(languages.active);
      return Promise.resolve(undefined);
    } catch (error) {
      console.error(
        'Unable to decode embedded languages ${embeddedLanguages}.',
        error
      );
    }
  }
  return getLanguagesFromJson();
}

/**
 * Get the language files required for the application from remote JSON files..
 * If the application has not been build, the application just returns a fulfilled
 * Promise.
 * @returns {Promise} Fulfils to undefined.
 */
function getLanguagesFromJson() {
  return resolveLanguages('./languages.json')
    .then(() => {
      console.info(
        `Build information: ${
          BuildInfo.getBundleName
        } ${BuildInfo.getVersion()} ${BuildInfo.getMode()}`
      );
      return;
    })
    .catch((error) => {
      const fetchSummary = error.fetchSummary;
      if (fetchSummary && fetchSummary.length > 0 && fetchSummary[0].read) {
        console.error(`${error}\nUsing translation ${fetchSummary[0].url}`);
      } else {
        console.error(error.message);
        return Promise.reject(error);
      }
      return;
    });
}
