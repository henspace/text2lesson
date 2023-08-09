/**
 * @file In memory simulation supporting the WebApi Storage interface.
 *
 * @module utils/userIo/inMemoryStorage
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

/**
 * In memory storage that implements the WebApi Storage interface.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
 */
export class InMemoryStorage {
  /** @type {Map} */
  #store = new Map();

  /**
   * Construct new in Memory storage.
   */
  constructor() {}

  /**
   * Get the number of elements in the store.
   * @returns {number}
   */
  get length() {
    return this.#store.size;
  }

  /**
   * Delete all elements in the store.
   */
  clear() {
    this.#store.clear();
  }

  /**
   * Get the item stored under the key.
   * @param {string} key - key name.
   * @returns {string} item stored under key name or null if not found.
   */
  getItem(key) {
    const value = this.#store.get(key);
    return value === undefined ? null : value;
  }

  /**
   * Get the key name at the index.
   * @param {number} index - key index
   * @returns {*} key name or null if not found.
   */
  key(index) {
    const keys = [...this.#store.keys()];
    const value = keys[index];
    return value === undefined ? null : value;
  }

  /**
   * Remove the item stored under the key name.
   * @param {string} key - key name
   */
  removeItem(key) {
    this.#store.delete(key);
  }

  /**
   * Store value under key. The value must be a string, otherwise it will be
   * ignored.
   * @param {string} key - key name
   * @param {string} value - value to store
   */
  setItem(key, value) {
    if (typeof value === 'string') {
      this.#store.set(key, value);
    } else {
      console.warn(`Storage can only store strings. ${key} ignored.`);
    }
  }
}
