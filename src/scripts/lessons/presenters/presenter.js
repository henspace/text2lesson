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
import { footer } from '../../headerAndFooter.js';
import { getAttributions } from './attributions.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { BuildInfo } from '../../data/constants.js';

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
  static IMAGE_INFO = 'IMAGE_INFO';
  static DO_NOT_CLOSE_CLASS_NAME = 'do-not-close';
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
   * Navigator for keyboard up/down navigation.
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
   * Postamble
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #postamble;
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
   * Credits button
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #creditsButton;

  /**
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #attributions;
  /**
   * Location of next button. It defaults to the button bar
   * @type {boolean}
   */
  #nextInPostamble;

  /**
   * Construct the presenter
   * @param {PresenterConfig} - configuration for the presenter.
   * @param {boolean} nextInPostamble - the next button is normally in the button bar, but it can be moved to the postamble if preferred.
   */
  constructor(config, nextInPostamble) {
    super('div');
    this.#nextInPostamble = nextInPostamble;
    this.#addClassNames();
    this.config = config;
    footer.buttonBar.removeChildren();
    this.#buildContent();
  }

  /**
   * Add class names for the presenter. This is built up from the presenter's
   * inheritance.
   */
  #addClassNames() {
    let item = this;
    do {
      this.classList.add(item.constructor.name);
      item = Object.getPrototypeOf(item);
    } while (item.constructor.name !== 'Object');
  }

  /**
   * Build content for presenter.
   */
  #buildContent() {
    this.#preamble = new ManagedElement('div', 'preamble');
    this.#presentation = new ManagedElement('div', 'presentation');
    this.#postamble = new ManagedElement('div', 'postamble');
    this.#buttonBar = footer.buttonBar; // new ManagedElement('div', 'button-bar');
    this.#addNavigationButtons();
    this.appendChild(this.#preamble);
    this.appendChild(this.#presentation);
    this.appendChild(this.#postamble);
    this.#addAttributionButton();
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
    if (typeof data === 'string') {
      this.#preamble.createAndAppendChild('div', null, data);
    } else {
      this.#preamble.appendChild(data);
    }
  }

  /**
   * Postamble html or ManagedElement
   * @param {string | Element | module:utils/userIo/managedElement.ManagedElement}
   */
  addPostamble(data) {
    if (typeof data === 'string') {
      this.#postamble.createAndAppendChild('div', null, data);
    } else {
      this.#postamble.appendChild(data);
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
    if (this.#nextInPostamble) {
      this.addPostamble(this.#forwardsButton);
    } else {
      this.#buttonBar.appendChild(this.#forwardsButton);
    }

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
      this.addAttributions();
      this.#addLinkGuardians();
      this.onPostPresentActions();
      focusManager.findBestFocus();
    });
  }

  /**
   * Actions to perform after the Presenter has been added to the stage.
   * The default does nothing, but it's a hook for children to use.
   */
  onPostPresentActions() {}

  /**
   * Create the credits button.
   */
  #addAttributionButton() {
    const attributionsContainer = new ManagedElement(
      'div',
      'attribution-button-container'
    );
    this.#creditsButton = new ManagedElement('button');
    attributionsContainer.appendChild(this.#creditsButton);
    icons.applyIconToElement(icons.imageInfo, this.#creditsButton, {
      hideText: true,
    });
    this.listenToEventOn('click', this.#creditsButton, Presenter.IMAGE_INFO);
    this.addPostamble(attributionsContainer);
    this.#creditsButton.hide();
  }

  /**
   * Add credits to the postamble.
   * This needs to be called after any child classes have built their content.
   */
  addAttributions() {
    if (this.#attributions) {
      this.#attributions.remove();
    }
    this.#attributions = getAttributions(document.getElementById('stage'));
    if (this.#attributions) {
      this.#attributions.classList.add('for-print-only');
      this.addPostamble(this.#attributions);
      this.#creditsButton.show();
    } else if (this.#creditsButton) {
      this.#creditsButton.hide();
    }
  }

  /**
   * Check if okay to leave.
   * @param {string} message to ask
   * @returns {boolean} true if okay
   */
  async askIfOkayToLeave(message) {
    const confirmation = await ModalDialog.showConfirm(message, null, false);
    return confirmation === ModalDialog.DialogIndex.CONFIRM_YES;
  }

  /**
   * Prevent navigation away from page.
   * This is called when the handleClickEvent method is handling a Home, Back or
   * Forwards navigation button. It should be overridden if you need to prevent
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

    if (!(await this.allowNavigation(event, eventId))) {
      return true;
    }

    let nextPresenter = null;
    if (upperCaseId === Presenter.IMAGE_INFO) {
      return ModalDialog.showInfo(
        document.querySelector('.attributions').innerHTML,
        i18n`Acknowledgements`
      );
    } else if (upperCaseId === Presenter.PREVIOUS_ID) {
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

  /** Add a guardian for links that go to external sites. */
  #addLinkGuardians() {
    document
      .getElementById('content')
      ?.querySelectorAll('a')
      ?.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && new URL(href).origin !== window.location.origin) {
          anchor.addEventListener('click', async (event) => {
            return this.#confirmOpeningLink(event);
          });
        }
      });
  }

  /**
   * Check whether the link should be opened.
   * Popup confirmation. If not confirmed, the default event action is prevented.
   * @param {Event} event
   */
  #confirmOpeningLink(event) {
    const destination = event.currentTarget.getAttribute('href');
    const question =
      i18n`You are about to leave this application and go to ${destination}.` +
      '\n' +
      i18n`${BuildInfo.getProductName()} has no control over the site's content or privacy policies.` +
      '\n' +
      i18n`Is it okay to continue?`;
    if (!confirm(question)) {
      event.preventDefault();
    }
  }
}
