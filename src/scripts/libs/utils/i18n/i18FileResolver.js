/**
 * @file Get the required JSON files for the translations.
 *
 * @module libs/utils/i18n/i18FileResolver
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
 */

import {
  getBestLanguageFile,
  getPreferredLanguages,
  setActiveTranslations,
} from './i18n.js';

import { fetchJson } from '../jsonUtils/json.js';

/**
 * @typedef {Object} FetchSummary - lists language files retrieved.
 * @property {string} url - url of file fetched.
 * @property {boolean} read - true on a successful retrieval.
 */

/**
 * Extended error that provides the fetch summary.
 * @extends Error
 */
class I18nResolutionError extends Error {
  /**
   * @param {*} error - initial error
   * @param {FetchSummary[]} fetchSummary - summary prior to error. Accessible via #fetchSummary property
   */
  constructor(error, fetchSummary) {
    if (error instanceof Error) {
      super(error.message);
      this.cause = error;
    } else {
      super(error);
    }

    /**
     * Summary of results prior to error.
     * @type {FetchSummary[]}
     * @public
     */
    this.fetchSummary = fetchSummary;
  }
}

/**
 * Set up the translations based on the user's settings and the available
 * translations.
 * @param {*} languagesListingUrl - url of the json file containing a listing
 * of the files.
 * @returns {Promise} Fulfills to FetchSummary[]. Rejects with I18ResolutionError.
 */
export function resolveLanguages(languagesListingUrl) {
  let languagesListing = {};
  let languagesBaseUrl = '';
  let fetchSummary = [];

  return fetchJson(languagesListingUrl)
    .then((languages) => {
      console.log(languages);
      languagesListing = languages;
      languagesBaseUrl = new URL(languages.location, window.location.href);
      console.log(`Base url = ${languagesBaseUrl.href}`);
      const url = new URL(languages.meta.master, languagesBaseUrl);
      console.log(`master = ${languages.meta.master}`);
      console.log(`url = ${url}`);
      fetchSummary.push({ url: url, read: false });
      return fetchJson(url.href);
    })
    .then((masterTranslations) => {
      fetchSummary[0].read = true;
      console.log(masterTranslations);
      setActiveTranslations(masterTranslations);
      const bestFile = getBestLanguageFile(
        getPreferredLanguages(),
        languagesListing.files
      );
      if (bestFile === languagesListing.meta.master) {
        console.log(
          `Master language ${languagesListing.meta.master} is the best match.`
        );
        return Promise.resolve(null);
      }
      const url = new URL(bestFile, languagesBaseUrl);
      fetchSummary.push({ url: url, read: false });
      return fetchJson(url.href);
    })
    .then((bestTranslations) => {
      if (bestTranslations) {
        fetchSummary[1].read = true;
        setActiveTranslations(bestTranslations);
      }
      return fetchSummary;
    })
    .catch((error) => {
      return Promise.reject(new I18nResolutionError(error, fetchSummary));
    });
}
