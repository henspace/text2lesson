/**
 * @file General indexer for arrays
 *
 * @module utils/arrayIndexer
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

export class ArrayIndexer {
  /**
   * Array of the items to index
   * @type {*[]}
   */
  #items;

  /**
   * @type {boolean}
   * Should increment wrap.
   */
  #wrap;

  /**
   * Current index
   * @type {number}
   */
  #index;

  /**
   * Construct the indexer
   * @param {*[]} items - array to managed index
   * @param {boolean} wrap - should index wrap or not.
   */
  constructor(items, wrap = true) {
    this.#items = items;
    this.#wrap = wrap;
    this.#index = 0;
  }

  /** Get the underlying array.
   * @returns {*[]}
   */
  get items() {
    return this.#items;
  }

  /**
   * Reset the index to 0
   */
  reset() {
    this.#index = 0;
  }
  /**
   * Decrements the index
   * @returns {*} the item at the new index
   */
  decrement() {
    if (this.#index > 0) {
      --this.#index;
    } else {
      this.#index = this.#wrap ? this.#items.length - 1 : this.#index - 1;
    }
    return this.#items[this.#index];
  }
  /**
   * Increments the index
   * @returns {*} the item at the next index
   */
  increment() {
    if (this.#index < this.#items.length - 1) {
      ++this.#index;
    } else {
      this.#index = this.#wrap ? 0 : this.#index;
    }
    return this.#items[this.#index];
  }
}
