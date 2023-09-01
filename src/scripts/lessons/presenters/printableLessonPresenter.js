/**
 * @file Printable version of a lesson
 *
 * @module lessons/presenters/printableLessonPresenter
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
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { lessonManager } from '../lessonManager.js';
import { QuestionType } from '../problem.js';
import { shuffle } from '../../utils/arrayManip.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { icons } from '../../utils/userIo/icons.js';

/**
 * Presenter for showing a lesson in an printable format
 */
export class PrintableLessonPresenter extends Presenter {
  /**
   * @type {string}
   */
  static PRINT_EVENT_ID = 'PRINT_LESSON';
  /**
   * @type {string}
   */
  static FONT_EVENT_ID = 'CHANGE_FONT';

  /**
   *
   * @param {module:lessons/presenters/presenter~PresenterConfig} config
   */
  constructor(config) {
    super(config);
    this.#buildContent();
    this.#addPrintButton();
    this.#addFontButton();
    this.#addFooter();
    this.showBackButton();
  }

  /**
   * Build the results content.
   */
  #buildContent() {
    this.#addTitleBlock();
    this.#addProblems();
  }

  /**
   * Add the title
   */
  #addTitleBlock() {
    const titleBlock = new ManagedElement('div', 'lesson-summary');
    titleBlock.createAndAppendChild(
      'p',
      'library-title',
      this.config.lessonInfo.titles.library
    );
    if (!lessonManager.usingLocalLibrary) {
      titleBlock.createAndAppendChild(
        'p',
        'book-title',
        this.config.lessonInfo.titles.book
      );
      titleBlock.createAndAppendChild(
        'p',
        'chapter-title',
        this.config.lessonInfo.titles.chapter
      );
    }
    titleBlock.createAndAppendChild(
      'p',
      'lesson-title',
      this.config.lessonInfo.titles.lesson
    );
    this.addPreamble(titleBlock);
  }

  /**
   * Add the print button
   */
  #addPrintButton() {
    const printButton = new ManagedElement('button');
    icons.applyIconToElement(icons.print, printButton);
    this.addButtonToBar(printButton);
    this.listenToEventOn(
      'click',
      printButton,
      PrintableLessonPresenter.PRINT_EVENT_ID
    );
  }

  /**
   * Add the print button
   */
  #addFontButton() {
    const fontButton = new ManagedElement('button');
    icons.applyIconToElement(icons.fontSize, fontButton);
    this.addButtonToBar(fontButton);
    this.listenToEventOn(
      'click',
      fontButton,
      PrintableLessonPresenter.FONT_EVENT_ID
    );
  }

  /**
   * Add the questions.
   */
  #addProblems() {
    const questionList = this.presentation.createAndAppendChild(
      'ol',
      'print-problems'
    );
    this.config.lesson.problems.forEach((problem) => {
      this.#addProblem(questionList, problem);
    });
  }

  #addFooter() {
    this.addPostamble(i18n`Lesson printed ${new Date().toLocaleDateString()}`);
  }

  /**
   * Add the problem.
   * @param {ManagedElement} listContainer
   * @param {Problem} problem
   */
  #addProblem(listContainer, problem) {
    const listItem = listContainer.createAndAppendChild('li');
    switch (problem.questionType) {
      case QuestionType.SIMPLE:
      case QuestionType.MULTI:
        this.#addMultipleChoiceProblem(listItem, problem);
        break;
      case QuestionType.FILL:
        this.#addFillInProblem(listItem, problem);
        break;
      case QuestionType.ORDER:
        this.#addOrderProblem(listItem, problem);
        break;
      case QuestionType.SLIDE:
        this.#addSlideshowProblem(listItem, problem);
        break;
    }
  }

  /**
   * Add a simple multiple choice question.
   * @param {ManagedElement} listItem
   * @param {Problem} problem
   */
  #addMultipleChoiceProblem(listItem, problem) {
    listItem.classList.add('multiple-choice-problem');
    listItem.createAndAppendChild('p', 'print-intro', problem.intro.html);
    listItem.createAndAppendChild('p', 'print-question', problem.question.html);
    const answersContainer = listItem.createAndAppendChild(
      'ul',
      'print-answers'
    );
    const answers = shuffle([...problem.rightAnswers, ...problem.wrongAnswers]);
    for (const answer of answers) {
      answersContainer.createAndAppendChild('li', 'print-option', answer.html);
    }
  }
  /**
   * Add a fill in the missing words question.
   * @param {ManagedElement} listItem
   * @param {Problem} problem
   */
  #addFillInProblem(listItem, problem) {
    listItem.classList.add('fill-in-blanks-problem');
    listItem.createAndAppendChild('p', 'print-intro', problem.intro.html);
    listItem.createAndAppendChild('p', 'print-question', problem.question.html);
    const answersContainer = listItem.createAndAppendChild(
      'p',
      'print-word-options'
    );
    answersContainer.createAndAppendChild('span', null, i18n`Options: `);
    const redHerrings = problem.firstWordsOfWrongAnswers;
    const missingWords = problem.question.missingWords;
    const answers = shuffle([...missingWords, ...redHerrings]);
    answers.forEach((answer, index) => {
      answersContainer.createAndAppendChild(
        'span',
        'print-option',
        `${index === 0 ? '' : ', '}${answer}`
      );
    });
  }
  /**
   * Add an order problem.
   * @param {ManagedElement} listItem
   * @param {Problem} problem
   */
  #addOrderProblem(listItem, problem) {
    listItem.classList.add('order-problem');
    listItem.createAndAppendChild('p', 'print-intro', problem.intro.html);
    listItem.createAndAppendChild('p', 'print-question', problem.question.html);
    listItem.createAndAppendChild(
      'p',
      null,
      i18n`Number these in the correct order:`
    );
    const answersContainer = listItem.createAndAppendChild(
      'div',
      'print-word-options'
    );

    const answers = shuffle([
      ...problem.firstWordsOfRightAnswers,
      ...problem.firstWordsOfWrongAnswers,
    ]);
    answers.forEach((answer) => {
      const option = answersContainer.createAndAppendChild(
        'div',
        'print-order-option'
      );
      option.createAndAppendChild('span', 'number-box', ' ');
      option.createAndAppendChild('span', 'print-option', answer);
    });
  }
  /**
   * Add a fill in the missing words question.
   * @param {ManagedElement} listItem
   * @param {Problem} problem
   */
  #addSlideshowProblem(listItem, problem) {
    listItem.classList.add('slideshow-problem');
    listItem.createAndAppendChild('p', 'print-intro', problem.intro.html);
  }

  /**
   * @override
   * @param {Event} event
   * @param {string} eventId
   */
  handleClickEvent(event, eventId) {
    switch (eventId) {
      case PrintableLessonPresenter.FONT_EVENT_ID:
        this.#toggleFontSize();
        return;
      case PrintableLessonPresenter.PRINT_EVENT_ID:
        window.print();
        return;
      default:
        super.handleClickEvent(event, eventId);
    }
  }

  /**
   * Toggle the font size.
   */
  #toggleFontSize() {
    this.classList.toggle('use-large-font');
  }
}
