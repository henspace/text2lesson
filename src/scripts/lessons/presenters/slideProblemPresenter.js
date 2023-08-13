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
 * States of the card.
 * @enum {number}
 */
const CardState = {
  INACTIVE: 0,
  ARRIVING: 1,
  READING: 2,
  LEAVING: 3,
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
  #readTimerId;

  /**
   * @type {CardState}
   */
  #cardState = CardState.INACTIVE;

  /**
   * @type {module:lessons/presenters/displayCards~CardDetail}
   */
  #currentCardDetail;

  /**
   * @type {boolean}
   */
  #paused;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    super(config);
    this.#buildSlideShow();
    this.submitButton.hide();
  }

  /**
   * Build the content.
   */
  #buildSlideShow() {
    this.#cards = new DisplayCards(
      this.problem.intro.html || this.problem.question.html
    );
    this.#visualCard = new ManagedElement('div', 'display-card');
    this.listenToEventOn('animationend', this.#visualCard);
    this.questionElement.appendChild(this.#visualCard);
    this.expandPresentation();
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
    this.addButtonToBar(button);
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

  /**
   * Set the card state adjusting css classes as required.
   * @param {CardState} cardState
   */
  #setCardState(cardState) {
    switch (cardState) {
      case CardState.ARRIVING:
        this.#visualCard.classList.remove('card-offscreen');
        this.#visualCard.classList.add('card-onscreen');
        break;
      case CardState.LEAVING:
        this.#visualCard.classList.remove('card-onscreen');
        this.#visualCard.classList.add('card-offscreen');
        break;
    }
    this.#cardState = cardState;
  }

  /**
   * Show the next card.
   */
  #showNextCard() {
    console.log('Show the next card');
    if (this.#endShowIfLastCard()) {
      return;
    }
    this.#currentCardDetail = this.#cards.getNext();
    this.#visualCard.innerHTML = this.#currentCardDetail.html;
    const cardRect = this.#visualCard.getBoundingClientRect();
    const presentationRect = this.presentation.getBoundingClientRect();
    const verticalSpace = presentationRect.height - cardRect.height;
    if (verticalSpace > 0) {
      this.#visualCard.style.marginTop = `${Math.floor(verticalSpace / 2)}px`;
    }

    this.#setCardState(CardState.ARRIVING);
  }

  /**
   * Leave card on screen while it's read.
   * After the read time the remove card is called.
   */
  #readCard() {
    this.#setCardState(CardState.READING);
    if (!this.#paused) {
      this.#readTimerId = setTimeout(() => {
        this.#removeCard();
      }, this.#currentCardDetail.readTimeSecs * 1000);
    }
  }

  /**
   * Remove the card
   */
  #removeCard() {
    if (this.#endShowIfLastCard()) {
      return;
    }
    this.#setCardState(CardState.LEAVING);
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
      this.showNextButton(true);
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
        clearTimeout(this.#readTimerId);
        this.#showMediaButtons(false);
        this.#paused = true;
        return;
      case MediaID.PLAY:
        clearTimeout(this.#readTimerId);
        this.#showMediaButtons(true);
        if (this.#cardState === CardState.READING) {
          this.#removeCard();
        }
        this.#paused = false;
        return;
      case MediaID.SKIP:
        clearTimeout(this.#readTimerId);
        this.#showMediaButtons(true);
        if (this.#cardState === CardState.READING) {
          this.#removeCard();
        }
        this.#paused = false;
        return;
    }
    super.handleClickEvent(event, eventId);
  }

  /**
   * Handle animation end event
   * @param {Event} event
   * @param {eventId} eventId - this will not be set.
   */
  handleAnimationendEvent(eventIgnored, eventIdIgnored) {
    switch (this.#cardState) {
      case CardState.ARRIVING:
        this.#readCard();
        break;
      case CardState.LEAVING:
        this.#showNextCard();
        break;
      default:
        console.error(
          `Animation unexpectedly ended with card in state ${this.#cardState}`
        );
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
