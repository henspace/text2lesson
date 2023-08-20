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
import { celebrator, CelebrationType } from '../candy/celebrators.js';
import { i18n } from '../../utils/i18n/i18n.js';

/**
 * Class names
 * @enum {string}
 */
export const ClassName = {
  ANSWER: 'problem-answer',
  ANSWERS: 'problem-answers',
  EXPLANATION: 'problem-explanation',
  INCORRECT_ANSWER: 'incorrect-answer',
  CORRECT_ANSWER: 'correct-answer',
  MISSED_ANSWER: 'missed-answer',
  AVOIDED_ANSWER: 'avoided-answer',
  QUESTION: 'problem-question',
  SELECTED_ANSWER: 'selected-answer',
};

/**
 * Ids
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
  /** @type {Problem} */
  #problem;

  /** @type {module:utils/userIo/managedElement.ManagedElement} */
  #questionElement;

  /** @type {module:utils/userIo/managedElement.ManagedElement} */
  #answerElement;

  /** @type {module:utils/userIo/managedElement.ManagedElement} */
  #explanationElement;

  /** @type {module:utils/userIo/controls.ManagedElement} */
  #submitButton;

  /** @type {boolean} */
  #freezeAnswers;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = [];
    config.itemClassName = '';
    super(config, 'div');
    this.#problem = config.lesson.getNextProblem();
    this.#questionElement = new ManagedElement('div', ClassName.QUESTION);
    this.#questionElement.innerHTML = this.#problem.question.html;

    this.#answerElement = new ManagedElement('div', ClassName.ANSWERS);

    this.#explanationElement = new ManagedElement('div', ClassName.EXPLANATION);
    this.#explanationElement.innerHTML = this.#problem.explanation.html;
    this.#explanationElement.hide();

    this.presentation.appendChild(this.#questionElement);
    this.presentation.appendChild(this.#answerElement);
    this.presentation.appendChild(this.#explanationElement);
    this.addButtons();

    this.#submitButton.show();
    this.#freezeAnswers = false;
    if (!this.config.lessonInfo.managed) {
      this.hideHomeButton();
    }
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
  get explanationElement() {
    return this.#explanationElement;
  }

  /**
   * @returns {module:utils/userIo/managedElement.ManagedElement}
   */
  get submitButton() {
    return this.#submitButton;
  }

  /**
   * Add button bar to the presenter.
   */
  addButtons() {
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
    this.addButtonToBar(this.#submitButton);
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
        this.#processClickedSubmit();
        break;
      default:
        super.handleClickEvent(event, eventId);
    }
  }

  /**
   * @override
   */
  async allowNavigation(event, eventId) {
    if (eventId === Presenter.HOME_ID || eventId === Presenter.PREVIOUS_ID) {
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
   * @param {Element} target
   */
  #processClickedSubmit() {
    const correct = this.areAnswersCorrect();
    this.config.lesson.markProblem(
      this.#problem,
      correct ? MarkState.CORRECT : MarkState.INCORRECT
    );
    this.#submitButton.hide();
    this.showNextButton(true);
    celebrator.celebrate(correct ? CelebrationType.HAPPY : CelebrationType.SAD);
  }

  /**
   * Mark the answers. This should be overridden.
   * @returns {boolean} true if all correct.
   */
  areAnswersCorrect() {
    console.debug(`Override markAnswers should be overridden.`);
    return false;
  }
}
