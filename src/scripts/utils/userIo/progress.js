/**
 * @file Progress bar
 *
 * @module utils/userIo/progress
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
import { ManagedElement } from './managedElement.js';
import { i18n } from '../i18n/i18n.js';

/**
 * A simple progress bar.
 */
export class ProgressBar extends ManagedElement {
  #progressIndicator;

  /**
   * Construct the bar
   * @param {string} label
   */
  constructor(label) {
    super('div', 'utils-progress-bar');
    this.#progressIndicator = this.createAndAppendChild(
      'div',
      'utils-progress-indicator'
    );
    this.value = 0;
    this.setAttributes({
      'aria-role': 'progressbar',
      'aria-label': label ?? i18n`Progress bar`,
    });
  }

  /**
   * Set the progress bar's value between 0 and 1;
   * @param {number} value
   */
  set value(value) {
    const percentValue = Math.floor(100 * value);
    this.#progressIndicator.style.width = `${percentValue}%`;
    this.setAttribute('aria-valuenow', percentValue);
  }
}

/**
 * Create stacked progress bars.
 */
export class StackedProgressBar extends ManagedElement {
  #bars = [];
  /**
   * Construct the stacked bars
   * @param {number} numberOfBars
   * @param {string[]} labels - these are used as aria labels.
   */
  constructor(numberOfBars, labels) {
    super('div', 'stacked-progress');
    for (let n = 0; n < numberOfBars; n++) {
      const progressBar = this.appendChild(
        new ProgressBar(labels ? labels[n] : null)
      );
      this.#bars.push(progressBar);
    }
  }

  /**
   * Set the progress bar's value
   * @param {number} barIndex
   * @param {number} value
   */
  setValueForBar(barIndex, value) {
    this.#bars[barIndex].value = value;
  }

  /**
   * Hide the selected bar
   * @param {number} index
   */
  hideBar(index) {
    this.#bars[index].style.display = 'none';
  }

  /**
   * Show the selected bar
   * @param {number} index
   */
  showBar(index) {
    this.#bars[index].style.display = 'block';
  }
}
