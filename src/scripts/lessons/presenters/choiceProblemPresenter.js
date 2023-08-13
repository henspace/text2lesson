/**
 * @file Present a problem
 *
 * @module lessons/presenters/choiceProblemPresenter
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

import { QuestionType } from '../problem.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { shuffle } from '../../utils/arrayManip.js';
import { i18n } from '../../utils/i18n/i18n.js';
import {
  ClassName,
  ElementId,
  Attribute,
  AnswerSelectionState,
  ProblemPresenter,
} from './problemPresenter.js';

/**
 * Class to present a problem.
 * Presentation of a Problem provides the full problem and answer.
 * @class
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class ChoiceProblemPresenter extends ProblemPresenter {
  /**
   * @type {module:utils/userIo/ManagedElement.ManagedElement}
   */
  #answerListElement;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    super(config);
    this.#buildSimpleOrMultiple();
  }

  /** Build a simple or multiple choice question.
   * Both question types are similar in design. The only difference is that
   * the answers that are added are treated like radio buttons or checkboxes.
   * That is handed by the `#addAnswers` method.
   * @private
   */
  #buildSimpleOrMultiple() {
    this.#buildAnswers();
    this.setupKeyboardNavigation(this.answerElement.managedChildren);
  }

  /**
   * Append the answers.
   * @private
   */
  #buildAnswers() {
    this.#answerListElement = new ManagedElement('ul');
    this.answerElement.appendChild(this.#answerListElement);
    this.#answerListElement.setAttributes({
      'aria-label': i18n`Possible answers`,
      'aria-role':
        this.problem.questionType === QuestionType.MULTI ? '' : 'radiogroup',
    });
    const answers = [];
    this.#pushAnswerElementsToArray(this.problem.rightAnswers, answers, true);
    this.#pushAnswerElementsToArray(this.problem.wrongAnswers, answers, false);

    shuffle(answers);

    answers.forEach((element) => {
      this.#answerListElement.appendChild(element);
      this.listenToEventOn('click', element, ElementId.CLICKED_ANSWER);
      this.listenToEventOn('keydown', element, ElementId.CLICKED_ANSWER);
    });

    setTimeout(() => this.#answerListElement.children[0].focus());
  }

  /**
   * Create Elements for the answers and adds to the array.
   * The `Attributes.RIGHT_OR_WRONG` attribute is set to true or false to flag the answer status.
   * @param {TextItem[]} answers - answers to create elements for
   * @param {Element[]} destination - target array for push
   * @param {boolean} areRight - true if these are correct answers.
   * @private
   */
  #pushAnswerElementsToArray(answers, destination, areRight) {
    const role =
      this.problem.questionType === QuestionType.MULTI ? 'checkbox' : 'radio';
    answers.forEach((value) => {
      const element = new ManagedElement('li', ClassName.ANSWER);
      element.classList.add('selectable');
      element.innerHTML = value.html;
      element.setSafeAttribute(Attribute.RIGHT_OR_WRONG, areRight);
      element.setAttributes({
        tabindex: '0',
        'aria-role': role,
        'aria-checked': false,
        'aria-label': i18n`Possible answer to question`,
      });
      destination.push(element);
    });
  }

  /**
   * Handle a clicked answer
   * @param {Element} element
   * @override
   */
  processClickedAnswer(element) {
    switch (this.problem.questionType) {
      case QuestionType.MULTI:
        element.classList.toggle(ClassName.SELECTED_ANSWER);
        break;
      case QuestionType.SIMPLE:
        {
          const selected = element.classList.contains(
            ClassName.SELECTED_ANSWER
          );
          this.#deselectAllAnswers();
          if (!selected) {
            this.#selectAnswer(element);
          }
        }
        break;
      default:
        console.error(
          `Wrong presenter ${this.constructor.name} being used for ${this.problem.questionType}`
        );
        break;
    }
  }

  /**
   * Deselect an answer element
   * @param {Element} element
   * @private
   */
  #selectAnswer(element) {
    element.setAttribute('aria-checked', 'true');
    element.classList.add(ClassName.SELECTED_ANSWER);
  }

  /**
   * Deselect an answer element
   * @param {Element} element
   * @private
   */
  #deselectAnswer(element) {
    element.setAttribute('aria-checked', 'false');
    element.classList.remove(ClassName.SELECTED_ANSWER);
  }

  /**
   * Deselect all of the answers.
   * @private
   */
  #deselectAllAnswers() {
    const allAnswers = document.querySelectorAll(`.${ClassName.ANSWER}`);
    allAnswers.forEach((element) => {
      this.#deselectAnswer(element);
    });
  }

  /**
   * Mark a simple question.
   * @returns {boolean} true if answer correct.
   * @override
   */
  areAnswersCorrect() {
    let correct = true; // default
    const allAnswers = document.querySelectorAll(`.${ClassName.ANSWER}`);

    allAnswers.forEach((element) => {
      if (!this.#processAnswerState(element)) {
        correct = false;
      }
      element.classList.replace('selectable', 'selectable-off');
      element.setAttribute('tabindex', '-1');
    });

    return correct;
  }

  /**
   * Process the selection state of the answer element
   * @param {*} element
   * @returns {boolean} true if the selection or lack of selection is correct.
   */
  #processAnswerState(element) {
    this.freezeAnswers = true;
    const elementIsCorrect =
      ManagedElement.getSafeAttribute(
        element,
        Attribute.RIGHT_OR_WRONG
      ).toLowerCase() === 'true';
    const selected = element.classList.contains(ClassName.SELECTED_ANSWER);
    let answerState;
    if (elementIsCorrect) {
      answerState = selected
        ? AnswerSelectionState.CORRECT
        : AnswerSelectionState.MISSED;
    } else {
      answerState = selected
        ? AnswerSelectionState.INCORRECT
        : AnswerSelectionState.AVOIDED;
    }
    this.#showAnswerState(element, answerState);

    return (
      answerState === AnswerSelectionState.CORRECT ||
      answerState === AnswerSelectionState.AVOIDED
    );
  }

  /**
   * Adjust the element's class to present its state.
   * @param {Element} element - the element to adjust
   * @param {AnswerSelectionState} answerState - selection state of the element
   */
  #showAnswerState(element, answerState) {
    let className = '';
    switch (answerState) {
      case AnswerSelectionState.AVOIDED:
        className = ClassName.AVOIDED_ANSWER;
        break;
      case AnswerSelectionState.CORRECT:
        className = ClassName.CORRECT_ANSWER;
        break;
      case AnswerSelectionState.INCORRECT:
        className = ClassName.INCORRECT_ANSWER;
        break;
      case AnswerSelectionState.MISSED:
        className = ClassName.MISSED_ANSWER;
        break;
    }
    element.classList.add(className);
  }

  /**
   * Handle key down event to allow up and down arrows to navigate list.
   * @param {Event} event
   * @param {string} eventId - holds index of the answer.
   */
  handleKeydownEvent(event, eventId) {
    if (eventId === ElementId.CLICKED_ANSWER) {
      switch (event.key) {
        case ' ':
        case 'Enter':
          this.handleClickEvent(event, eventId);
          break;
      }
    } else {
      return super.handleKeydownEvent(event, eventId);
    }
  }
}
