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
import { persistentData } from '../../utils/userIo/storage.js';
import { Presenter } from './presenter.js';
import { Gesture } from '../../utils/userIo/gestures.js';
import { Random } from '../../utils/random.js';
import { toast } from '../../utils/userIo/toast.js';
import { i18n } from '../../utils/i18n/i18n.js';

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
 * Classnames for entering
 */
const ENTRY_CLASS_NAMES = ['card-onscreen-slide', 'card-onscreen-spin'];

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
   * @type{string}
   */
  #lastAnimationClass;

  /**
   * @type {number}
   */
  static MIN_READ_TIME_MS = 3000;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presenter
   */
  constructor(config) {
    config.nextInPostamble = false;
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
    this.managedChildren.push(new Gesture(this.#visualCard.element));
    this.listenToEventOn('gesture', this.#visualCard);
    this.listenToEventOn('animationend', this.#visualCard);
    this.questionElement.removeChildren();
    this.questionElement.appendChild(this.#visualCard);
    this.expandPresentation();
    this.#addMediaButtons();
    this.showSlideshowProgress();
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
   * @param {Gesture.Direction} [direction=Gesture.Direction.RIGHT]
   */
  #setCardState(cardState, direction) {
    switch (cardState) {
      case CardState.ARRIVING:
        this.#applyAnimationClass(Random.itemFrom(ENTRY_CLASS_NAMES));
        break;
      case CardState.LEAVING:
        this.#applyAnimationClass(this.#getExitClassForDirection(direction));
        break;
    }
    this.#cardState = cardState;
  }

  /**
   * Apply animation class to the display card.
   * @param {string} className
   */
  #applyAnimationClass(className) {
    this.#removeLastAnimationClass();
    this.#lastAnimationClass = className;
    this.#visualCard.classList.add(className);
  }

  /**
   * Remove the last animation class from the display card.
   */
  #removeLastAnimationClass() {
    if (this.#lastAnimationClass) {
      this.#visualCard.classList.remove(this.#lastAnimationClass);
    }
    this.#lastAnimationClass = '';
  }

  /**
   * Get the appropriate class name for the card exit.
   * @param {Gesture.Direction} direction
   * @returns {string}
   */
  #getExitClassForDirection(direction) {
    const rootClass = 'card-offscreen';
    switch (direction) {
      case Gesture.Direction.UP:
        return `${rootClass}-up`;
      case Gesture.Direction.LEFT:
        return `${rootClass}-left`;
      case Gesture.Direction.DOWN:
        return `${rootClass}-down`;
      case Gesture.Direction.RIGHT:
      default:
        return `${rootClass}-right`;
    }
  }
  /**
   * Show the next card.
   */
  #showNextCard() {
    console.log('Show the next card');
    if (this.#endShowIfLastCard()) {
      this.handleClickEvent(new Event('click'), Presenter.NEXT_ID);
      return;
    }
    // obtain reading speed again incase it's been adjusted.
    const readingSpeed = persistentData.getFromStorage('readingSpeed', 130);
    this.#cards.setWordsPerMinute(readingSpeed);
    this.#currentCardDetail = this.#cards.getNext();
    this.slideshowProgress = this.#cards.progress;
    this.#visualCard.innerHTML = this.#currentCardDetail.html;
    this.addAttributions();
    this.#autoPauseIfAppropriate(this.#currentCardDetail.html);
    this.#visualCard.element.scrollTo(0, 0);
    this.#setCardState(CardState.ARRIVING);
    this.#endShowIfLastCard();
  }

  /**
   * Look at the card html and pause if appropriate. The code pauses when the
   * following conditions are met:
   * - the html contains a link.
   * @param {string} cardHtml
   */
  #autoPauseIfAppropriate(cardHtml) {
    if (this.#paused) {
      return; // already paused.
    }
    if (
      /<a\s*[^>]*href=[^>]+\s*>.*?<\/a>/i.test(cardHtml) ||
      /<iframe[^>]+><\/iframe>/.test(cardHtml)
    ) {
      this.#pauseTheShow();
      toast(
        i18n`This slide contains a link or video, so the presentation has been paused.`
      );
    }
  }

  /**
   * Leave card on screen while it's read.
   * After the read time the remove card is called.
   */
  #readCard() {
    this.#setCardState(CardState.READING);
    const readTimeMs = Math.max(
      SlideProblemPresenter.MIN_READ_TIME_MS,
      this.#currentCardDetail.readTimeSecs * 1000
    );
    if (!this.#paused) {
      this.#readTimerId = setTimeout(() => {
        this.#removeCard();
      }, readTimeMs);
    }
  }

  /**
   * Remove the card
   * @param {?Gesture.Direction} direction
   */
  #removeCard(direction) {
    this.#setCardState(CardState.LEAVING, direction);
  }

  /**
   * Ends the show if end reached.
   * @returns {boolean} true if at end
   */
  #endShowIfLastCard() {
    if (!this.#cards.hasMore) {
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
        this.#pauseTheShow();
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
        this.#skip();
        return;
      case Presenter.HOME_ID:
        this.#pauseTheShow();
        break;
    }
    super.handleClickEvent(event, eventId);
  }

  /**
   * @override
   * @param {number | string} eventIndexOrId
   */
  next(eventId) {
    clearTimeout(this.#readTimerId);
    return super.next(eventId);
  }
  /**
   * Pause the slide show.
   */
  #pauseTheShow() {
    clearTimeout(this.#readTimerId);
    this.#showMediaButtons(false);
    this.#paused = true;
  }

  /**
   * Perform the skip action.
   * @param {?Gesture.Direction} direction
   */
  #skip(direction) {
    clearTimeout(this.#readTimerId);
    if (
      this.#cardState === CardState.ARRIVING ||
      this.#cardState === CardState.READING
    ) {
      this.#removeCard(direction);
    }
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
      this.#skipButton.show();
      this.#playButton.focus();
    }
  }

  /**
   * Handle the gesture.
   * @param {CustomEvent} event
   * @param {*} eventIdIgnored
   */
  handleGestureEvent(event, eventIdIgnored) {
    console.debug(`Gesture direction ${event.detail}`);
    this.#skip(event.detail);
  }
}
