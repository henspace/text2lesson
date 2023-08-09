/**
 * @file Present a problem
 *
 * @module lessons/presenters/slideProblemPresenter
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
import { ProblemPresenter } from './problemPresenter.js';
import { DisplayCards } from './displayCards.js';
import { icons } from '../../utils/userIo/icons.js';

const MediaClass = {
  PAUSE: 'pause',
  PLAY: 'play',
  SKIP: 'skip',
};

const MediaID = {
  PAUSE: 'pause',
  PLAY: 'play',
  SKIP: 'skip',
};

/**
 * Class to present a slide show.
 * Presentation of a Problem provides the full problem and answer.
 * @class
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class SlideProblemPresenter extends ProblemPresenter {
  /**
   * @type {module:lessons/presenters/displayCards.DisplayCards}
   */
  #cards;
  /**
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #visualCard;

  /**
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #skipButton;

  /**
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #playButton;

  /**
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #pauseButton;

  /**
   * TimerId
   * @type {number}
   */
  #timerId;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    super(config);
    this.#buildSlideShow();
    this.submitButton.hide();
    this.nextButton.hide();
  }

  #buildSlideShow() {
    this.#cards = new DisplayCards(this.problem.intro.html);
    this.#visualCard = new ManagedElement('div', 'display-card');
    this.questionElement.appendChild(this.#visualCard);
    this.onlyUseQuestionElement();
    this.#addMediaButtons();
  }

  /**
   * Add media control buttons.
   */
  #addMediaButtons() {
    this.#playButton = new ManagedElement('button', MediaClass.PLAY);
    this.#addButtonToButtonBar(this.#playButton, icons.play, MediaID.PLAY);

    this.#pauseButton = new ManagedElement('button', MediaClass.PAUSE);
    this.#addButtonToButtonBar(this.#pauseButton, icons.pause, MediaID.PAUSE);

    this.#skipButton = new ManagedElement('button', MediaClass.SKIP);
    this.#addButtonToButtonBar(this.#skipButton, icons.skip, MediaID.SKIP);
  }

  /**
   * Add a button to the button bar
   * @param {module:utils/userIo/managedElement.ManagedElement} button
   * @param {utils/userIo/icons~IconDetails} iconDetails
   * @param {string} eventId
   */
  #addButtonToButtonBar(button, icon, eventId) {
    icons.applyIconToElement(icon, button.element);
    this.listenToEventOn('click', button, eventId); // numeric handler means this will resolve the presenter.
    this.addButton(button);
  }

  /**
   * Present on stage. The element is appended to the stageElement.
   * Note that it is not removed and any existing content is not removed..
   *
   * @param {module:utils/userIo/managedElement.ManagedElement} stageElement
   * @returns {Promise} - The Promise fulfils to the next `Presenter` that should be shown.
   */
  presentOnStage(stageElement) {
    this.#showMediaButtons(true);
    setTimeout(() => this.#showNextCard());
    return super.presentOnStage(stageElement);
  }

  #showNextCard() {
    console.log('Show the next card');
    if (this.#endShowIfLastCard()) {
      return;
    }
    this.#visualCard.innerHTML = this.#cards.getNext();
    if (this.#visualCard.classList.contains('card-offscreen')) {
      this.#visualCard.classList.replace('card-offscreen', 'card-onscreen');
    } else {
      this.#visualCard.classList.add('card-onscreen');
    }

    this.#timerId = setTimeout(() => {
      this.#removeCard();
    }, 5000);
  }
  #removeCard() {
    if (this.#endShowIfLastCard()) {
      return;
    }
    this.#visualCard.classList.replace('card-onscreen', 'card-offscreen');
    this.#timerId = setTimeout(() => {
      this.#showNextCard();
    }, 1000);
  }

  /**
   * Ends the show if end reached.
   * @returns {boolean} true if at end
   */
  #endShowIfLastCard() {
    if (!this.#cards.hasMore) {
      this.#pauseButton.hide();
      this.#playButton.hide();
      this.#skipButton.hide();
      this.nextButton.show();
      this.nextButton.focus();
      return true;
    }
    return false;
  }

  /**
   * Handle the answers. Any other event is passed on to the base Presenter's
   * handler.
   * @param {Event} event
   * @param {string} eventId
   * @override
   */
  handleClickEvent(event, eventId) {
    switch (eventId) {
      case MediaID.PAUSE:
        clearTimeout(this.#timerId);
        this.#showMediaButtons(false);
        return;
      case MediaID.PLAY:
        clearTimeout(this.#timerId);
        this.#showMediaButtons(true);
        this.#continueSlides();
        return;
      case MediaID.SKIP:
        clearTimeout(this.#timerId);
        this.#showMediaButtons(true);
        this.#continueSlides();
        return;
    }
    super.handleClickEvent(event, eventId);
  }

  /** Continue the slide show. */
  #continueSlides() {
    if (this.#visualCard.classList.contains('card-onscreen')) {
      this.#removeCard();
    } else {
      this.#showNextCard();
    }
  }

  /**
   * Show media buttons.
   * @param {boolean} playing - true if playing.
   */
  #showMediaButtons(playing) {
    if (playing) {
      this.#pauseButton.show();
      this.#playButton.hide();
      this.#skipButton.show();
      this.#pauseButton.focus();
    } else {
      this.#pauseButton.hide();
      this.#playButton.show();
      this.#skipButton.hide();
      this.#playButton.focus();
    }
  }
}
