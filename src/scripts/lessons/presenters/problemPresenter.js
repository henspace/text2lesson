/**
 * @file Present a problem
 *
 * @module lessons/presenters/problemPresenter
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

import { Presenter } from './presenter.js';
import { QuestionType } from '../problem.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { ModalDialog } from '../../utils/userIo/modalDialog.js';
import { icons } from '../../utils/userIo/icons.js';
import { MarkState } from '../itemMarker.js';
import { celebrate, commiserate } from '../candy/celebrators.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { LessonOrigin } from '../lessonOrigins.js';
import { focusManager } from '../../utils/userIo/focusManager.js';
import { soundManager } from '../../utils/audio/soundManager.js';
import { StackedProgressBar } from '../../utils/userIo/progress.js';
/**
 * Class names
 * @enum {string}
 */
export const ClassName = {
  ANSWER: 'problem-answer',
  ANSWERS: 'problem-answers',
  INCORRECT_ANSWER: 'incorrect-answer',
  CORRECT_ANSWER: 'correct-answer',
  MISSED_ANSWER: 'missed-answer',
  AVOIDED_ANSWER: 'avoided-answer',
  QUESTION: 'problem-question',
  SELECTED_ANSWER: 'selected-answer',
};

/**
 * Element Ids
 * @enum {string}
 */
export const ElementId = {
  CLICKED_ANSWER: 'answer',
  CLICKED_SUBMIT: 'submit',
  CLICKED_NEXT: 'next',
};

/**
 * Attributes
 * @enum {string}
 */
export const Attribute = {
  RIGHT_OR_WRONG: 'data-code',
};

/**
 * States for selected answers
 * @enum {number}
 */
export const AnswerSelectionState = {
  /** Undefined state */
  UNDEFINED: 0,
  /** Correct answer selected */
  CORRECT: 1,
  /** Incorrect answer selected */
  INCORRECT: 2,
  /** Correct answer not selected */
  MISSED: 3,
  /** Incorrect answer not selected */
  AVOIDED: 4,
};

/**
 * Class to present a problem.
 * Presentation of a Problem provides the full problem and answer.
 * @class
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class ProblemPresenter extends Presenter {
  /**
   * @type {string}
   */
  static EDIT_EVENT_ID = 'EDIT';

  /**
   * Delay before advancing to next question.
   * @type {number}
   */
  static ADVANCE_DELAY_MS = 3000;

  /** @type {Problem} */
  #problem;

  /** @type {module:utils/userIo/managedElement.ManagedElement} */
  #questionElement;

  /** @type {module:utils/userIo/managedElement.ManagedElement} */
  #answerElement;

  /** @type {module:utils/userIo/controls.ManagedElement} */
  #submitButton;

  /** @type {boolean} */
  #freezeAnswers;

  /**
   * @type {Timer}
   */
  #autoAdvanceTimer;

  /**
   * @type {StackedProgressBar}
   */
  #progressBars;

  /**
   * @type {ManagedElement}
   */
  #editButton;

  /** @type {number} */
  static SLIDE_BAR_INDEX = 0;
  /** @type {number} */
  static LESSON_BAR_INDEX = 1;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presenter
   * @param {boolean} nextInPostamble - should the next button go in the postamble.
   */
  constructor(config, nextInPostamble) {
    config.titles = [];
    config.itemClassName = '';
    super(config, nextInPostamble);
    this.#addProgressBars();
    this.#problem = config.lesson.getNextProblem();
    this.#updateLessonProgress();
    this.#questionElement = new ManagedElement('div', ClassName.QUESTION);
    this.#questionElement.innerHTML = this.#problem.question.html;

    this.#answerElement = new ManagedElement('div', ClassName.ANSWERS);

    this.presentation.appendChild(this.#questionElement);
    this.presentation.appendChild(this.#answerElement);

    this.addButtons();

    this.#submitButton.show();
    this.#freezeAnswers = false;
    if (this.config.lessonInfo.origin === LessonOrigin.EMBEDDED) {
      this.hideHomeButton();
    }
    this.classList.add(Presenter.DO_NOT_CLOSE_CLASS_NAME);
    focusManager.findBestFocus();
  }

  /**
   * @returns {module:lessons/problem.Problem} the underlying problem
   */
  get problem() {
    return this.#problem;
  }

  /**
   * @returns {module:utils/userIo/managedElement.ManagedElement}
   */
  get questionElement() {
    return this.#questionElement;
  }

  /**
   * @returns {module:utils/userIo/managedElement.ManagedElement}
   */
  get answerElement() {
    return this.#answerElement;
  }

  /**
   * @returns {module:utils/userIo/managedElement.ManagedElement}
   */
  get submitButton() {
    return this.#submitButton;
  }

  /**
   * Set the progress for the slide show
   * @param {number} value 0 to 1.
   */
  set slideshowProgress(value) {
    this.#progressBars.setValueForBar(ProblemPresenter.SLIDE_BAR_INDEX, value);
  }

  showSlideshowProgress() {
    this.#progressBars.showBar(ProblemPresenter.SLIDE_BAR_INDEX);
  }

  /**
   * Add the edit button
   */
  #addEditButtonIfLocal() {
    if (this.config.lessonInfo.usingLocalLibrary) {
      this.#editButton = new ManagedElement('button');
      icons.applyIconToElement(icons.edit, this.#editButton);
      this.addButtonToBar(this.#editButton);
      this.listenToEventOn(
        'click',
        this.#editButton,
        ProblemPresenter.EDIT_EVENT_ID
      );
    }
  }

  /**
   * Add progress indicators.
   */
  #addProgressBars() {
    this.#progressBars = new StackedProgressBar(2, [
      i18n`Progress bar for slide show.`,
      i18n`Progress bar for the entire lesson.`,
    ]);
    this.#progressBars.hideBar(ProblemPresenter.SLIDE_BAR_INDEX);
    this.#progressBars.setValueForBar(
      ProblemPresenter.LESSON_BAR_INDEX,
      this.config.lesson.progress
    );
    this.addPreamble(this.#progressBars);
  }
  /**
   * Add progress indicators.
   */
  #updateLessonProgress() {
    setTimeout(() => {
      this.#progressBars.setValueForBar(
        ProblemPresenter.LESSON_BAR_INDEX,
        this.config.lesson.progress
      );
    }, 100);
  }

  /**
   * Add button bar to the presenter.
   */
  addButtons() {
    this.#addEditButtonIfLocal();
    this.#addSubmitButton();
  }

  /**
   * Append a submit button. In this context, submit means sending the selected
   * answers for marking.
   * @private
   */
  #addSubmitButton() {
    this.#submitButton = new ManagedElement('button', ClassName.ANSWER_SUBMIT);
    icons.applyIconToElement(icons.submitAnswer, this.#submitButton.element);
    this.listenToEventOn('click', this.#submitButton, ElementId.CLICKED_SUBMIT); // numeric handler means this will resolve the presenter.
    this.addPostamble(this.#submitButton);
  }

  /** Enable the edit button */
  enableEditButton() {
    if (this.#editButton) {
      this.#editButton.disabled = false;
    }
  }

  /** Disable the edit button */
  disableEditButton() {
    if (this.#editButton) {
      this.#editButton.disabled = true;
    }
  }

  /**
   * @override
   */
  presentOnStage(stage) {
    if (
      this.#problem.intro.html !== '' &&
      this.#problem.questionType !== QuestionType.SLIDE
    ) {
      return ModalDialog.showInfo(this.#problem.intro.html).then(() =>
        super.presentOnStage(stage)
      );
    } else {
      return super.presentOnStage(stage);
    }
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
      case ElementId.CLICKED_ANSWER:
        if (!this.#freezeAnswers) {
          this.processClickedAnswer(event.currentTarget);
        }
        break;
      case ElementId.CLICKED_SUBMIT:
        this.#freezeAnswers = true;
        this.#processClickedSubmit(event);
        break;
      case ProblemPresenter.EDIT_EVENT_ID:
      case Presenter.NEXT_ID:
        clearTimeout(this.#autoAdvanceTimer);
        super.handleClickEvent(event, eventId);
        break;
      default:
        super.handleClickEvent(event, eventId);
    }
  }

  /**
   * @override
   * @param {number | string} eventIndexOrId
   */
  next(eventId) {
    if (eventId === ProblemPresenter.EDIT_EVENT_ID) {
      return this.config.factory.getEditor(this, this.config);
    } else {
      return super.next(eventId);
    }
  }

  /**
   * @override
   */
  async allowNavigation(event, eventId) {
    if (
      eventId === Presenter.HOME_ID ||
      eventId === Presenter.PREVIOUS_ID ||
      eventId === ProblemPresenter.EDIT_EVENT_ID
    ) {
      return this.askIfOkayToLeave(
        i18n`Are you sure you want to quit the lesson?`
      );
    } else {
      return true;
    }
  }

  /**
   * Process a clicked answer. This should be overridden.
   * @param {Element} target
   */
  processClickedAnswer(target) {
    console.debug(`Process ${target.tagName}:${target.className}`);
  }

  /**
   * Process a clicked answer.
   * This will pass a next event id onto the super's handler. If it was a correct
   * answer it automatically advances.
   * @param {Event} event - original event.
   */
  #processClickedSubmit() {
    const correct = this.areAnswersCorrect();
    this.config.lesson.markProblem(
      this.#problem,
      correct ? MarkState.CORRECT : MarkState.INCORRECT
    );
    this.#submitButton.hide();
    if (correct) {
      this.#handleCorrectAnswer();
    } else {
      this.#handleIncorrectAnswer();
    }
  }

  /**
   * Handle correct answer
   */
  #handleCorrectAnswer() {
    this.disableHomeButton();
    this.disableEditButton();
    celebrate();
    soundManager.playGood();
    this.#autoAdvanceTimer = setTimeout(
      () => super.handleClickEvent(event, Presenter.NEXT_ID),
      ProblemPresenter.ADVANCE_DELAY_MS
    );
  }

  /**
   * Handle incorrect answer
   */
  #handleIncorrectAnswer() {
    setTimeout(
      () => this.showNextButton(true),
      ProblemPresenter.ADVANCE_DELAY_MS
    );
    commiserate();
    soundManager.playBad();
    const explanation = this.#problem.explanation;
    if (explanation.html) {
      return ModalDialog.showInfo(
        explanation.html,
        i18n`Sorry. That's not right`
      );
    }
  }

  /**
   * Mark the answers. This should be overridden.
   * @returns {boolean} true if all correct.
   */
  areAnswersCorrect() {
    console.debug(`Override markAnswers should be overridden.`);
    return false;
  }

  /**
   * Hide titles on mouseover and hide credits button
   * @override
   */
  onPostPresentActions() {
    const stage = document.getElementById('stage');
    stage.querySelectorAll('img').forEach((image) => {
      image.setAttribute('title', i18n`Image for question. Details hidden.`);
    });
  }
}
