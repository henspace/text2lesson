/**
 * @file Abstract presenter.
 * Presenters are states in a state machine. The state is entered by calling the
 * present method. The present method allows 3 possible exits: back, new presenter,
 * and escape. See {@link Presenter#present} for details.
 *
 * @module lessons/presenters/presenter
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

import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { icons } from '../../utils/userIo/icons.js';
import { focusManager } from '../../utils/userIo/focusManager.js';
import { ArrayIndexer } from '../../utils/arrayIndexer.js';

/**
 * @typedef {Object} Navigator
 * @property {constructor} next - constructor for the next presenter
 * @property {constructor} previous - constructor for the  previous presenter
 */
/**
 * @typedef {Object} PresenterFactory
 * @property {function(className): constructor} next - function to return constructor for next Presenter
 * @property {function(className): constructor} previous - function to return constructor for previous Presenter
 */

/**
 * @typedef {Object} PresenterConfig
 * @property {string[]} titles - titles that are displayed for each item.
 * @property {string} className - class name for the presenter's container.
 * @property {string} itemClassName - class name for the items.
 * @property {module:lessons/lesson/Lesson} [lesson] - the lesson. It is optional for most presenters.
 * @property {PresenterFactory} factory - the presenter factory used to create the next and previous presenters.
 */

/**
 * Identification used for the back button.
 * @type{string}
 */
export const PREVIOUS_ID = 'PREVIOUS';

/**
 * Base presenter class. This is expected to be extended and the `next` and
 * `previous` methods overridden.
 * @class
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class Presenter extends ManagedElement {
  /**
   * The resolve function for the Promise returned by the `presentOnStage` method.
   * @type {function}
   */
  #resolutionExecutor;

  /**
   * @type {PresenterConfig}
   */
  config;

  /*
   * Navigator for keyboard updown navigation.
   * @type {module:utils/arrayIndexer.ArrayIndexer} #navigator
   */
  #navigator;

  /**
   * Construct the presenter
   * @param {PresenterConfig} - configuration for the presenter.
   * @param {string} tagName - type of containing element. This defaults to a UL
   * element as titles are added as LI items.
   */
  constructor(config, tagName = 'ul') {
    super(tagName, config.className);
    this.config = config;
  }

  /**
   * Append a backbutton.
   * @private
   */
  #appendBackButton() {
    const backElement = new ManagedElement('button', 'backNavigation');
    this.appendChild(backElement);
    icons.applyIconToElement(icons.back, backElement.element);
    this.listenToEventOn('click', backElement, PREVIOUS_ID);
  }

  /**
   * Set up keyboard navigation.
   * This can only be called once.
   * If element omitted, the titles are used.
   * @param {module:utils/userIo/managedElement.ManagedElement[]} [managedElements].
   */
  setupKeyboardNavigation(managedElements) {
    if (this.#navigator) {
      console.error('setUpKeyboardNavigation can only be called once.');
      return;
    }
    const items = managedElements ?? this.children;
    this.#navigator = new ArrayIndexer(items, true);
    items.forEach((item) => {
      this.listenToEventOn('keydown', item);
    });
  }

  /**
   * Get configuration for the next presenter.
   * This should be overridden.
   * @param {number} index - index of the item that triggered the call.
   * @returns {Presenter | Promise} new Presenter or Promise that fulfils to a Presenter.
   */
  next(indexIgnored) {
    return null;
  }

  /**
   * Move to the previous Presenter.
   * This should be overridden.
   * @returns {Presenter} new Presenter
   */
  previous() {
    return null;
  }

  /**
   * Present on stage. The element is appended to the stageElement.
   * Note that it is not removed and any existing content is not removed..
   *
   * @param {module:utils/userIo/managedElement.ManagedElement} stageElement
   * @returns {Promise} - The Promise fulfils to the next `Presenter` that should be shown.
   */
  presentOnStage(stageElement) {
    return new Promise((resolve) => {
      this.#resolutionExecutor = resolve;
      stageElement.appendChild(this);
      focusManager.focusWithin(stageElement);
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
   * + Any other eventId, does not resolves with null.
   *
   * Override this method for handling other eventIds.
   * @param {Event} event
   * @param {string} eventId
   */
  handleClickEvent(event, eventId) {
    const index = parseInt(eventId);
    let nextPresenter = null;
    if (!isNaN(index)) {
      nextPresenter = this.next(index);
    } else if (eventId.toUpperCase() === PREVIOUS_ID) {
      nextPresenter = this.previous();
    }

    this.#resolutionExecutor(nextPresenter);
  }

  /**
   * Handle key down event to allow up and down arrows to navigate list.
   * @param {Event} event
   * @param {string} eventId - holds index of the answer.
   */
  handleKeydownEvent(event, eventId) {
    const index = parseInt(eventId);
    console.debug(`Key ${event.key} down for index ${index}`);
    if (isNaN(index)) {
      return;
    }

    switch (event.key) {
      case ' ':
      case 'Enter':
        this.handleClickEvent(event, eventId);
        break;
    }
  }
}
