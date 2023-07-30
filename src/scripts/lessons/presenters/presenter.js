/**
 * @file Abstract presenter.
 * Presenters are states in a state machine. The state is entered by calling the
 * present method. The present method allows 3 possible exits: back, new presenter,
 * and escape. See {@link Presenter#present} for details.
 *
 * @module libs/utils/userIo/presenter
 *
 * @license GPL-3.0-or-later
 * : create quizzes and lessons from plain text files.
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

import { ManagedElement } from '../../libs/utils/dom/managedElement.js';
import {
  ICON_HTML,
  applyIconToElement,
} from '../../libs/utils/userIo/icons.js';
/**
 * @typedef {Object} PresentationConfig
 * @property {string[]} titles - titles that are displayed for each item.
 * @property {string} itemClassName - class name for the items.
 * @property {function(index:number):Promise} next - function that generates the next presenter. The Promise fulfils to the next presenter.
 * @property {function(index:number):Promise} previous - function that generates the previous presenter. The Promise fulfils to the previous presenter.
 * If this is not set, no back button is added.
 */

/**
 * Identification used for the back button.
 * @type{string}
 */
const PREVIOUS_ID = 'PREVIOUS';

/**
 * Base presenter class.
 */
export class Presenter extends ManagedElement {
  /**
   * @type {function}
   */
  #resolutionExecutor;

  /**
   * @type {PresentationConfig}
   */
  #config;

  /**
   * Construct the presenter
   * @param {string} className - class for the presenter.
   * @param {PresentationConfig} - configuration for the presenter.
   */
  constructor(className, config) {
    super('div', className);
    this.#config = config;
    this.#buildContent();
  }

  /**
   * Build the presenter content.
   * This calls `buildCustomContent` which can be overridden.
   * If the config includes the `previous` function, a back button is automatically
   * added at the end.
   */
  #buildContent() {
    this.#config?.titles.forEach((title, index) => {
      const itemElement = new ManagedElement('a', this.#config.itemClassName);
      this.appendChild(itemElement);
      itemElement.element.textContent = title;
      this.listenToEventOn('click', itemElement, index);
    });

    if (!this.#config || this.#config.previous) {
      this.#appendBackButton();
    }
  }

  /**
   * Append a backbutton
   */
  #appendBackButton() {
    const backElement = new ManagedElement('A', 'backNavigation');
    this.appendChild(backElement);
    applyIconToElement(ICON_HTML.BACK, backElement.element, 'link');
    this.listenToEventOn('click', backElement, PREVIOUS_ID);
  }

  /**
   * Present on stage. The element is appended to the stageElement.
   * Note that it is not removed and any existing content is not removed..
   *
   * @param {ManagedElement} stageElement
   * @returns {Promise} - fulfils to the next `Presenter` that should be shown.
   */
  presentOnStage(stageElement) {
    return new Promise((resolve) => {
      this.#resolutionExecutor = resolve;
      stageElement.appendChild(this);
    });
  }

  /**
   * Handle the click event.
   * The method will resolve the `Promise` made by `presentOnStage`.
   * The resolution is determined by the eventId.
   * + If the eventId is a positive integer, including zero, the Presenter resolves by
   * calling the next method in the config.
   * + If the eventId is 'PREVIOUS', case insensitive, the Presenter resolves by
   * calling the previous method in the config.
   * + Any other eventId, does not resolve the Presenter
   *
   * Override this method for handling other eventIds.
   * @param {Event} event
   * @param {string} eventId
   */
  handleClickEvent(event, eventId) {
    const index = parseInt(eventId);
    if (!isNaN(index)) {
      this.#resolveNext(index);
    } else if (eventId.toUpperCase() === PREVIOUS_ID) {
      this.#resolvePrevious();
    }
  }

  /**
   * Resolve the Presenter's Promise by calling the next function.
   * @param {number} index
   * @throws {Error} thrown if next method does not exist
   */
  #resolveNext(index) {
    if (typeof this.#config.next === 'function') {
      this.#resolutionExecutor(this.#config.next(index));
    } else {
      throw new Error(
        'Resolution direction set to next but no function to handle it.'
      );
    }
  }

  /**
   * Resolve the Presenter's Promise by calling the previous function.
   * @throws {Error} thrown if next method does not exist
   */
  #resolvePrevious() {
    if (typeof this.#config.previous === 'function') {
      this.#resolutionExecutor(this.#config.previous());
    } else {
      throw new Error(
        'Resolution direction set to previous but no function to handle it.'
      );
    }
  }
}
