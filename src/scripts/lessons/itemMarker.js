/**
 * @file Marker for keep track of scores
 *
 * @module lessons/itemMarker
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
 * Possible states for a problem waiting to be answered.
 * @enum
 */
export const MarkState = {
  UNDEFINED: -1,
  CORRECT: 0,
  INCORRECT: 1,
  SKIPPED: 2,
};

/**
 * Information about the current marks.
 * @typedef {Object} Marks
 * @property {number} correct
 * @property {number} incorrect
 * @property {number} skipped
 * @property {Problem[]} markedItems
 */

/**
 * @typedef {Object} MarkedItem
 * @property {Object} item
 * @property {MarkState} state
 */

/**
 * Class for keeping track of scores.
 */
export class ItemMarker {
  /** @type {MarkedItem[]} */
  #markedItems;

  /**
   * Create the marker.
   */
  constructor() {
    this.reset();
  }

  /**
   * Reset all scores to zero
   */
  reset() {
    this.#markedItems = [];
  }

  /**
   * Get the current marks.
   * @returns {Marks}
   */
  get marks() {
    const marks = {
      correct: 0,
      incorrect: 0,
      skipped: 0,
      markedItems: this.#markedItems,
    };
    this.#markedItems.forEach((markedItem) => {
      switch (markedItem.state) {
        case MarkState.CORRECT:
          marks.correct++;
          break;
        case MarkState.INCORRECT:
          marks.incorrect++;
          break;
        case MarkState.SKIPPED:
          marks.skipped++;
          break;
      }
    });
    return marks;
  }

  /**
   * Add a mark for the specified state.
   * @param {Object} item - marked item.
   * @param {MarkState} state - state to be marked.
   */
  markItem(item, state) {
    this.#markedItems.push({
      item: item,
      state: state,
    });
  }
}
