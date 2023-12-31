/**
 * @file Present a problem
 *
 * @module lessons/presenters/fillProblemPresenter
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
import { SelectControl } from '../../utils/userIo/controls.js';
import {
  ClassName,
  AnswerSelectionState,
  ProblemPresenter,
} from './problemPresenter.js';
import { shuffle } from '../../utils/arrayManip.js';
import { replaceSelectControl } from './fillAndOrderTools.js';

/**
 * Class to present a problem.
 * Presentation of a Problem provides the full problem and answer.
 * @class
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class FillProblemPresenter extends ProblemPresenter {
  /** @type {control:module:utils/userIo/controls.SelectControl} */
  #missingWordSelectors;
  /** @type {string} */
  #missingWordCorrectAnswers;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    super(config, true);
    this.#createMissingWordSelectors();
    this.answerElement.hide();
  }

  /**
   * Create a set of missing word selectors and inject them into the question.
   */
  #createMissingWordSelectors() {
    const questionWordElements =
      this.questionElement.querySelectorAll('.missing-word');

    this.#missingWordCorrectAnswers = [];

    questionWordElements.forEach((element) => {
      const correctAnswer = ManagedElement.getSafeAttribute(
        element,
        'data-missing-word'
      );
      this.#missingWordCorrectAnswers.push(correctAnswer);
    });

    const redHerrings = this.problem.firstWordsOfWrongAnswers;
    let options = [...this.#missingWordCorrectAnswers, ...redHerrings];
    options = ['...', ...shuffle(options)];
    const settingDefinition = {
      defaultValue: '...',
      options: options,
    };
    this.#missingWordSelectors = [];
    questionWordElements.forEach((element, index) => {
      const selector = new SelectControl(index, settingDefinition);
      element.appendChild(selector.element);
      this.#missingWordSelectors.push(selector);
    });
    this.autoAddKeydownEvents(this.#missingWordSelectors);
  }

  /**
   * Mark a fill question.
   * @returns {boolean} true if answer correct.
   * @override
   */
  areAnswersCorrect() {
    let correct = true;
    this.#missingWordSelectors.forEach((selectControl, index) => {
      const givenAnswer = selectControl.getText();
      const expectedAnswer = this.#missingWordCorrectAnswers[index];
      const container = selectControl.parentElement;
      replaceSelectControl(selectControl, givenAnswer, expectedAnswer);
      if (givenAnswer === expectedAnswer) {
        this.#showAnswerState(container, AnswerSelectionState.CORRECT);
      } else {
        this.#showAnswerState(container, AnswerSelectionState.INCORRECT);
        correct = false;
      }
    });
    return correct;
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
}
