/**
 * @file Functions to handle storage for settings.
 *
 * @module utils/userIo/storage
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
import { i18n } from '../i18n/i18n.js';
import { toast } from './toast.js';

/**
 * Storage manager. This manages storage that conforms the the WebApi Storage interface.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
 */
export class DataStoreManager {
  /**
   * @type{Storage}
   */
  #storage;
  /**
   * String appended to keys to make storage unique when testing locally.
   * If running a server on the unbuilt source, the {@link module:data/constants.BuildInfo.getBundleName} is
   * not unique, so a prefix of 'LR' is also appended. This should be modified
   * for each application.
   * @type{string}
   */
  #keyPrefix = 'app';

  /**
   * Construct store
   * @param {Storage} storage - the underlying storage that supports the WebApi Storage interface.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
   */
  constructor(storage) {
    this.#storage = storage;
  }

  /**
   * Create a unique key for the storage. To do this, this.#keyPrefix is
   * added to the front of the key.
   * @param {string} key
   * @returns {string} the unique key.
   */
  createStorageKey(key) {
    return `${this.#keyPrefix}${key}`;
  }

  /**
   * Get setting from storage
   * @param {string} key - saved item key. NB. this is prefixed by
   * LOCAL_STORAGE_ID to prevent clashes with local debugging.
   * @param {*} defaultValue
   * @returns {*}
   */
  getFromStorage(key, defaultValue) {
    key = this.createStorageKey(key);
    const value = this.#storage.getItem(key);
    if (value) {
      try {
        const parsedValue = JSON.parse(value);
        if (parsedValue === null || parsedValue === undefined) {
          return defaultValue;
        } else {
          return parsedValue;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return defaultValue;
  }
  /**
   * Save setting to local storage
   * @param {string} key
   * @param {*} value
   * @throws {Error} if underlying storage fails.
   */
  saveToStorage(key, value) {
    key = this.createStorageKey(key);
    try {
      this.#storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      toast(i18n`Unable to save data. ${error.message}`);
    }

    return;
  }

  /**
   * Remove setting from storage
   * @param {string} key
   */
  removeFromStorage(key) {
    key = this.createStorageKey(key);
    this.#storage.removeItem(key);
  }

  /**
   * Set the prefix for the storage key. This is primarily used to stop apps
   * from the the same domain sharing the same storage values.
   * @param {string} prefix
   */
  setStorageKeyPrefix(prefix) {
    this.#keyPrefix = prefix;
  }
}

/**
 * DataStoreManager for the localStorage.
 */
export const persistentData = new DataStoreManager(localStorage);
