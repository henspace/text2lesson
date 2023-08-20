/**
 * @file celebrators
 *
 * @module lessons/candy/celebrators
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

import { ManagedElement } from '../../utils/userIo/managedElement.js';

/**
 * Possible celebration names
 * @enum {string}
 */
export const CelebrationType = {
  HAPPY: 'smiley-face',
  SAD: 'sad-face',
};

/**
 * DOM element that can appear on screen to celebrate something
 */
export class Celebrator extends ManagedElement {
  /**
   * Class for the celebration type
   * @type {string}
   */
  #animationClass;

  /**
   * Flag set when an animation is in progress.
   */
  #busy;

  /** Create a celebrator. 
   * The celebrator has the class celebrator.
   * This should be set so that the celebrator has position absolute and display 
   * is hidden.
  
   * 
   * No content is included so that should be provided in CSS via a before or
   * after pseudo class.
   */
  constructor() {
    super('div', 'celebrator');
    this.appendTo(document.body);
    this.listenToOwnEvent('animationend');
    this.#busy = false;
    this.hide();
  }

  /**
   * Free up another celebrator when this animation is over.
   * @param {Event} event
   * @param {string} eventId
   */
  handleAnimationendEvent(eventIgnored, eventIdIgnored) {
    console.debug('Celebration ended.');
    this.hide();
    this.#busy = false;
  }

  /**
   * Bring in the celebrator.
   * No more celebrations are handled until this one ends.
   * @param {CelebrationType} [celebration = CelebrationType.SMILEY] - the class to apply
   */
  celebrate(celebration = CelebrationType.HAPPY) {
    if (this.#busy) {
      console.warn('Celebration busy so new celebration ignored.');
      return;
    }
    this.show();
    if (this.#animationClass) {
      this.classList.remove(this.#animationClass);
    }
    this.#animationClass = celebration;
    this.classList.add(this.#animationClass);
  }
}

export const celebrator = new Celebrator();
