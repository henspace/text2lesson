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
import { ManagedElement } from '../../libs/utils/dom/managedElement.js';
import { ModalDialog } from '../../libs/utils/userIo/modalDialog.js';
import { shuffle } from '../../libs/utils/shuffle.js';
import * as icons from '../../libs/utils/userIo/icons.js';

/**
 * Class names
 * @enum {string}
 */
const ClassNames = {
  ANSWER: 'problem-answer',
  ANSWERS: 'problem-answers',
  BAD_ANSWER: 'bad-answer',
  GOOD_ANSWER: 'good-answer',
  MISSED_ANSWER: 'missed-answer',
  QUESTION: 'problem-question',
  SELECTED_ANSWER: 'selected-answer',
};

/**
 * Ids
 * @enum {string}
 */
const Ids = {
  CLICKED_ANSWER: 'answer',
  CLICKED_SUBMIT: 'submit',
  CLICKED_NEXT: 'next',
};

/**
 * Attributes
 * @enum {string}
 */
const Attributes = {
  RIGHT_OR_WRONG: 'data-code',
};

/**
 * Class to present a problem.
 * Presentation of a Problem provides the full problem and answer.
 */
export class ProblemPresenter extends Presenter {
  /**
   * @type {Lesson}
   */
  #lesson;
  /** @type {number} */
  #index;
  /** @type {Problem} */
  #problem;
  /** @type {ManagedElement} */
  #submitButton;
  /** @type {ManagedElement} */
  #nextButton;
  /** @type {ManagedElement} */
  #explanation;

  /**
   * Construct.
   * @param {number} index - the problem index
   * @param {lesson} lesson - the lesson containing the problem
   */
  constructor(index, lesson) {
    super('problemPresenter', {
      titles: [],
      itemClassName: '',
      next: (index) => {
        return new ProblemPresenter(index, this.#lesson);
      },
    });
    this.#index = index;
    this.#lesson = lesson;
    this.#problem = lesson.problems[index];
    this.#buildCustomContent();
  }

  /**
   * Create the custom content for the problem
   */
  #buildCustomContent() {
    switch (this.#problem.questionType) {
      case QuestionType.ORDER:
        break;
      case QuestionType.FILL:
        break;
      case QuestionType.MULTI:
        break;
      case QuestionType.ACTIVITY:
        break;
      case QuestionType.SIMPLE:
        this.#buildSimple();
        break;
    }
  }

  /** Build a simple question. */
  #buildSimple() {
    this.#addQuestion();
    this.#addAnswers();
    this.#addSubmitButton();
    this.#addHiddenExplanation();
    this.#addHiddenNextButton();
  }

  /**
   * Append the question.
   */
  #addQuestion() {
    const questionElement = new ManagedElement('div', ClassNames.QUESTION);
    questionElement.innerHTML = this.#problem.question.html;
    this.appendChild(questionElement);
  }

  /**
   * Append the answers
   */
  #addAnswers() {
    const answerElement = new ManagedElement('div', ClassNames.ANSWERS);
    const answers = [];
    this.#pushAnswerElementsToArray(this.#problem.rightAnswers, answers, true);
    this.#pushAnswerElementsToArray(this.#problem.wrongAnswers, answers, false);

    shuffle(answers);

    answers.forEach((element) => {
      answerElement.appendChild(element);
      this.listenToEventOn('click', element, Ids.CLICKED_ANSWER);
    });
    this.appendChild(answerElement);
  }

  /**
   * Create Elements for the answers and adds to the array.
   * The `Attributes.RIGHT_OR_WRONG` attribute is set to true or false to flag the answer status.
   * @param {TextItem[]} answers - answers to create elements for
   * @param {Element[]} destination - target array for push
   * @param {boolean} areRight - true if these are correct answers.
   */
  #pushAnswerElementsToArray(answers, destination, areRight) {
    answers.forEach((value) => {
      const element = new ManagedElement('button', ClassNames.ANSWER);
      element.innerHTML = value.html;
      element.setSafeAttribute(Attributes.RIGHT_OR_WRONG, areRight);
      destination.push(element);
    });
  }

  #addSubmitButton() {
    this.#submitButton = new ManagedElement('button', ClassNames.ANSWER_SUBMIT);
    icons.applyIconToElement(
      icons.ICON_HTML.SUBMIT_ANSWER,
      this.#submitButton.element
    );
    this.listenToEventOn('click', this.#submitButton, Ids.CLICKED_SUBMIT); // numeric handler means this will resolve the presenter.
    this.appendChild(this.#submitButton);
  }

  #addHiddenExplanation() {
    this.#explanation = new ManagedElement('div', ClassNames.EXPLANATION);
    this.#explanation.innerHTML = this.#problem.explanation.html;
    this.#explanation.hide();
  }

  #addHiddenNextButton() {
    this.#nextButton = new ManagedElement('button', ClassNames.NEXT_PROBLEM);
    icons.applyIconToElement(
      icons.ICON_HTML.NEXT_PROBLEM,
      this.#nextButton.element
    );
    this.listenToEventOn('click', this.#nextButton, Ids.CLICKED_NEXT);
    this.appendChild(this.#nextButton);
    this.#nextButton.hide();
  }

  /**
   * @override
   */
  presentOnStage(stage) {
    if (this.#problem.intro.html !== '') {
      return ModalDialog.showInfo(this.#problem.intro.html).then(() =>
        super.presentOnStage(stage)
      );
    } else {
      return super.presentOnStage(stage);
    }
  }

  /**
   * @override
   * Handle the answers. Any other event is passed on to the base Presenter's
   * handler.
   * @param {Event} event
   * @param {string} eventId
   */
  handleClickEvent(event, eventId) {
    switch (eventId) {
      case Ids.CLICKED_ANSWER:
        this.#processClickedAnswer(event.currentTarget);
        break;
      case Ids.CLICKED_SUBMIT:
        this.#processClickedSubmit();
        break;
      case Ids.CLICKED_NEXT:
        super.handleClickEvent(event, '0');
        break;
    }
  }

  /**
   * Handle a clicked answer
   * @param {Element} element
   */
  #processClickedAnswer(element) {
    switch (this.#problem.questionType) {
      case QuestionType.ORDER:
        break;
      case QuestionType.FILL:
        break;
      case QuestionType.MULTI:
        element.classList.toggle(ClassNames.SELECTED_ANSWER);
        break;
      case QuestionType.ACTIVITY:
        break;
      case QuestionType.SIMPLE:
        {
          const selected = element.classList.contains(
            ClassNames.SELECTED_ANSWER
          );
          this.#deselectAllAnswers();
          if (!selected) {
            element.classList.add(ClassNames.SELECTED_ANSWER);
          }
        }
        break;
    }
  }

  /**
   * Deselect all of the answers.
   */
  #deselectAllAnswers() {
    const allAnswers = document.querySelectorAll(`.${ClassNames.ANSWER}`);
    allAnswers.forEach((element) =>
      element.classList.remove(ClassNames.SELECTED_ANSWER)
    );
  }

  /**
   * Mark the answer.
   */
  #processClickedSubmit() {
    const allAnswers = document.querySelectorAll(`.${ClassNames.ANSWER}`);
    allAnswers.forEach((element) => {
      const isRight =
        ManagedElement.getSafeAttribute(
          element,
          Attributes.RIGHT_OR_WRONG
        ).toLowerCase() === 'true';
      if (element.classList.contains(ClassNames.SELECTED_ANSWER)) {
        element.classList.add(
          isRight ? ClassNames.GOOD_ANSWER : ClassNames.BAD_ANSWER
        );
      } else if (isRight) {
        element.classList.add(ClassNames.MISSED_ANSWER);
      }
    });
    this.#submitButton.hide();
    this.#nextButton.show();
  }
}
