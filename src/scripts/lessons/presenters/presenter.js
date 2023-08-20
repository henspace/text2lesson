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

import { ModalDialog } from '../../utils/userIo/modalDialog.js';
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
 * @property {string} itemClassName - class name for the items.
 * @property {module:lessons/lesson/Lesson} [lesson] - the lesson. It is optional for most presenters.
 * @property {lessons/lessonManager~LessonInfo} lessonInfo - information about the lesson.
 * @property {PresenterFactory} factory - the presenter factory used to create the next and previous presenters.
 */

/**
 * Base presenter class. This is expected to be extended and the `next` and
 * `previous` methods overridden.
 * @class
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
export class Presenter extends ManagedElement {
  static HOME_ID = 'HOME';
  static PREVIOUS_ID = 'BACKWARDS';
  static NEXT_ID = 'FORWARDS';

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
   * Preamble
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #preamble;

  /**
   * Presentation
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #presentation;

  /**
   * Get the presentation
   * @returns {module:utils/userIo/managedElement.ManagedElement}
   */
  get presentation() {
    return this.#presentation;
  }

  /**
   * Button bar - bar at bottom
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #buttonBar;
  /**
   * Back button
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #homeButton;

  /**
   * Back button
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #backwardsButton;

  /**
   * Next button
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #forwardsButton;

  /**
   * Construct the presenter
   * @param {PresenterConfig} - configuration for the presenter.
   * @param {string} presentationTagName - type of presentation containing element. This defaults to a div
   */
  constructor(config, presentationTagName = 'div') {
    super('div');
    this.#addClassNames();
    this.config = config;
    this.#buildContent(presentationTagName);
  }

  #addClassNames() {
    let item = this;
    do {
      this.classList.add(item.constructor.name);
      item = Object.getPrototypeOf(item);
    } while (item.constructor.name !== 'Object');
  }

  /**
   * Add preamble
   * @param {string} presentationTagName - type of the presentation container
   */
  #buildContent(presentationTagName) {
    this.#preamble = new ManagedElement('div', 'preamble');
    this.#presentation = new ManagedElement(
      presentationTagName,
      'presentation'
    );
    this.#buttonBar = new ManagedElement('div', 'button-bar');
    this.#addNavigationButtons();
    this.appendChild(this.#preamble);
    this.appendChild(this.#presentation);
    this.appendChild(this.#buttonBar);
  }

  /**
   * Set up the presenter to expand.
   * The presentation is expanded.
   */
  expandPresentation() {
    this.#presentation.classList.add('expanded');
  }
  /**
   * Add button bar to the presenter's button bar.
   * The default button bar has the buttons in HOME, BACK, FORWARD order.
   * This adds the button between the BACK and FORWARD buttons.
   * @param {module:utils/userIo/managedElement.ManagedElement}
   */
  addButtonToBar(managedButton) {
    this.#buttonBar.element.insertBefore(
      managedButton.element,
      this.#buttonBar.element.lastElementChild
    );
  }

  /**
   * Preamble html or ManagedElement
   * @param {string | Element | module:utils/userIo/managedElement.ManagedElement}
   */
  addPreamble(data) {
    this.#preamble.removeChildren();
    if (typeof data === 'string') {
      this.#preamble.innerHTML = data;
    } else {
      this.#preamble.appendChild(data);
    }
  }

  /**
   * Add back and forward navigation buttons.
   * These are initially hidden.
   */
  #addNavigationButtons() {
    this.#homeButton = new ManagedElement('button', 'home-navigation');
    icons.applyIconToElement(icons.home, this.#homeButton);
    this.listenToEventOn('click', this.#homeButton, Presenter.HOME_ID);
    this.#buttonBar.appendChild(this.#homeButton);

    this.#backwardsButton = new ManagedElement('button', 'back-navigation');
    icons.applyIconToElement(icons.back, this.#backwardsButton);
    this.listenToEventOn('click', this.#backwardsButton, Presenter.PREVIOUS_ID);
    this.#buttonBar.appendChild(this.#backwardsButton);
    this.#backwardsButton.hide();

    this.#forwardsButton = new ManagedElement('button', 'forward-navigation');
    icons.applyIconToElement(icons.forward, this.#forwardsButton);
    this.listenToEventOn('click', this.#forwardsButton, Presenter.NEXT_ID);
    this.#buttonBar.appendChild(this.#forwardsButton);
    this.#forwardsButton.hide();
  }

  /**
   * Hide the home button.
   */
  hideHomeButton() {
    this.#homeButton.hide();
  }

  /**
   * Show the back button.
   * @param {boolean} focus - if true, the button will also get focus.
   */
  showBackButton() {
    this.#backwardsButton.show();
    if (focus) {
      this.#backwardsButton.focus();
    }
  }

  /**
   * Show the forwards button.
   * @param {boolean} focus - if true, the button will also get focus.
   */
  showNextButton(focus) {
    this.#forwardsButton.show();
    if (focus) {
      this.#forwardsButton.focus();
    }
  }

  /**
   * Restyle the forwards button
   * This allows the next button's logic to be used but with a different presentation
   * that might be more appropriate for presenter.
   * @param {module:utils/userIo/icons~IconDetails}
   * @param {?string} overrideText - text to override label if required.
   */
  applyIconToNextButton(iconDetails, overrideText) {
    icons.applyIconToElement(iconDetails, this.#forwardsButton, {
      overrideText: overrideText,
    });
  }

  /**
   * Add a keydown event for all the element's children.
   * The default handling is to trigger a click event on space or enter.
   * This is used primarily to make items such as LI elements behave more like buttons.
   * This can only be called once.
   * If element omitted, the children of the presentation element are used.
   * @param {module:utils/userIo/managedElement.ManagedElement[]} [managedElements].
   */
  autoAddKeydownEvents(managedElements) {
    if (this.#navigator) {
      console.error('autoAddKeydownEvents can only be called once.');
      return;
    }
    const items = managedElements ?? this.#presentation.managedChildren;
    this.#navigator = new ArrayIndexer(items, true);
    items.forEach((item, index) => {
      this.listenToEventOn('keydown', item, index);
    });
  }

  /**
   * Get configuration for the next presenter.
   * The default implementation just calls the presenter factory in the configuration
   * to get the next presenter. This should be overridden if you need to take action based on the index.
   *
   * @param {number | string} index - index of the item that triggered the call or the eventId if it can't be passed as a number.
   * @returns {Presenter | Promise} new Presenter or Promise that fulfils to a Presenter.
   */
  next(indexIgnored) {
    return this.config.factory.getNext(this, this.config);
  }

  /**
   * Move to the previous Presenter.
   * The default implementation just calls the presenter factory in the configuration
   * to get the previous presenter.
   * @returns {Presenter} new Presenter
   */
  previous() {
    return this.config.factory.getPrevious(this, this.config);
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
   * Check if okay to leave.
   * @param {string} message to ask
   * @returns {boolean} true if okay
   */
  async askIfOkayToLeave(message) {
    const confirmation = await ModalDialog.showConfirm(message);
    return confirmation === ModalDialog.DialogIndex.CONFIRM_YES;
  }

  /**
   * Prevent navigation away from page.
   * This is called when the handleClickEvent method is handling a Home, Back or
   * Forwards navigation button. It should be overriden if you need to prevent
   * navigation. Implementers can use the `askIfOkayToLeave` method to ask.
   * @param {Event} event
   * @param {string} eventId
   * @returns {boolean} true if navigation away from page should be allowed
   */
  async allowNavigation(eventIgnored, eventIdIgnored) {
    return true;
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
  async handleClickEvent(event, eventId) {
    const index = parseInt(eventId);
    const upperCaseId = !eventId ? '' : eventId.toString().toUpperCase();
    if (
      upperCaseId === Presenter.HOME_ID ||
      upperCaseId === Presenter.PREVIOUS_ID ||
      upperCaseId === Presenter.NEXT_ID
    ) {
      if (!(await this.allowNavigation(event, eventId))) {
        return true;
      }
    }
    let nextPresenter = null;
    if (upperCaseId === Presenter.PREVIOUS_ID) {
      nextPresenter = this.previous();
    } else if (upperCaseId === Presenter.NEXT_ID) {
      nextPresenter = this.next(Presenter.NEXT_ID);
    } else if (upperCaseId === Presenter.HOME_ID) {
      nextPresenter = this.config.factory.getHome(this.config);
    } else {
      nextPresenter = this.next(isNaN(index) ? eventId : index);
    }
    if (nextPresenter) {
      this.#resolutionExecutor(nextPresenter);
    }
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
