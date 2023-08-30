/**
 * @file Present the marks
 *
 * @module lessons/presenters/marksPresenter
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
import { MarkState } from '../itemMarker.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { lessonManager } from '../lessonManager.js';
import { icons } from '../../utils/userIo/icons.js';
import { LessonOrigin } from '../lessonOrigins.js';
import { embeddedLesson } from '../embeddedLesson.js';
import { generateConfetti } from '../../effects/confetti.js';

/**
 * Classes used for styling medals.
 * percent gives the score required to achieve the result.
 * @enum {{percent:number, cssClass:string}}
 */
const MedalDetails = {
  POOR: {
    upperLimit: 25,
    cssClass: 'poor',
  },
  BAD: {
    upperLimit: 50,
    cssClass: 'bad',
  },
  GOOD: {
    upperLimit: 75,
    cssClass: 'good',
  },
  EXCELLENT: {
    upperLimit: 100,
    cssClass: 'excellent',
  },
};

/**
 * Presenter for showing the results of a test.
 */
export class MarksPresenter extends Presenter {
  /**
   * @const
   */
  static RETRY_LESSON_ID = 'RETRY_LESSON';

  /**
   * @type {module:lessons/itemMarker~Marks}
   */
  #marks;

  /**
   *
   * @param {module:lessons/presenters/presenter~PresenterConfig} config
   */
  constructor(config) {
    super(config);
    this.#buildContent();
  }

  /**
   * Build the results content.
   */
  #buildContent() {
    this.#addHeadings();
    this.#addAnswers();
    this.#addResult();
    this.#addRetryButton();
    this.#adjustButtonsForOrigin();
  }

  /**
   * Adjust the buttons for the lesson origin.
   */
  #adjustButtonsForOrigin() {
    switch (this.config.lessonInfo.origin) {
      case LessonOrigin.EMBEDDED:
        this.hideHomeButton();
        this.applyIconToNextButton(icons.exit);
        this.showNextButton();
        break;
      case LessonOrigin.REMOTE:
        this.applyIconToNextButton(icons.selectLesson);
        this.showNextButton();
        break;
      case LessonOrigin.FILE_SYSTEM:
      case LessonOrigin.LOCAL:
      default:
        // no next button. Just Home and repeat.
        break;
    }
  }
  /**
   * Add the titles.
   */
  #addHeadings() {
    const lessonTitle =
      this.config.lessonInfo.titles.lesson ||
      this.config.lesson.metadata.getValue('TITLE', i18n`Unknown title`);

    this.presentation.createAndAppendChild(
      'h1',
      null,
      i18n`Certificate of achievement`
    );
    this.presentation.createAndAppendChild('h2', null, lessonTitle);
    this.#addBookDetailsIfManaged();
  }

  /**
   * Add book details if managed lesson.
   */
  #addBookDetailsIfManaged() {
    if (this.config.lessonInfo.managed) {
      let bookDetails = '<p>from:</p>';
      if (lessonManager.usingLocalLibrary) {
        bookDetails += `<span class='library-title'>${this.config.lessonInfo.titles.library}</span>`;
      } else {
        bookDetails += `<span class='library-title'>${this.config.lessonInfo.titles.library}</span> 
        <span class='book-title'>${this.config.lessonInfo.titles.book}</span>
        <span class='chapter-title'>${this.config.lessonInfo.titles.chapter}</span>`;
      }
      this.presentation.createAndAppendChild('div', null, bookDetails);
    }
  }

  #addRetryButton() {
    const repeatButton = new ManagedElement('button');
    icons.applyIconToElement(icons.repeatLesson, repeatButton);
    this.addButtonToBar(repeatButton);
    this.listenToEventOn('click', repeatButton, MarksPresenter.RETRY_LESSON_ID);
  }

  /**
   * Add a list of answers.
   */
  #addAnswers() {
    const answers = new ManagedElement('div');
    this.config.lesson.marks.markedItems.forEach((markedItem) => {
      const item = new ManagedElement('div', 'answer-summary');
      item.innerHTML = `${markedItem.item.question.plainText}`;
      item.classList.add(this.#getClassForMarkState(markedItem.state));
      answers.appendChild(item);
    });
    this.presentation.appendChild(answers);
  }

  /**
   * Add the score
   */
  #addResult() {
    const marks = this.config.lesson.marks;
    const totalQuestions = marks.correct + marks.incorrect + marks.skipped;
    const percent =
      totalQuestions == 0
        ? 0
        : Math.round((100 * marks.correct) / totalQuestions);
    const summary = i18n`Score: ${percent}% (${marks.correct}/${totalQuestions})`;
    const summaryItem = this.presentation.createAndAppendChild(
      'p',
      'result-summary',
      summary
    );
    summaryItem.classList.add(this.#calcMedalClass(percent));
    if (percent >= MedalDetails.GOOD.upperLimit) {
      generateConfetti();
    }
  }

  /**
   * Add a medal based on the score.
   * The medal is added by adding a class to result which can then be styled in
   * CSS. Four classes are available:
   * bad, poor, good, excellent.
   */
  #calcMedalClass(percent) {
    for (const key in MedalDetails) {
      const details = MedalDetails[key];
      if (percent < details.upperLimit) {
        return details.cssClass;
      }
    }
    return MedalDetails.EXCELLENT.cssClass;
  }

  /**
   * Get a suitable class name for the state.
   * @param {module:lessons/markState.MarkState.MarkState} state
   */
  #getClassForMarkState(state) {
    switch (state) {
      case MarkState.CORRECT:
        return 'correct';
      case MarkState.INCORRECT:
        return 'incorrect';
      case MarkState.SKIPPED:
        return 'skipped';
    }
    return 'unknown-state';
  }

  /**
   * @override
   * @param {number | string} eventIndexOrId
   */
  next(eventId) {
    switch (eventId) {
      case MarksPresenter.RETRY_LESSON_ID:
        return this.config.factory.getProblemAgain(this, this.config);
      case Presenter.NEXT_ID:
        if (this.config.lessonInfo.origin === LessonOrigin.EMBEDDED) {
          window.top.location.replace(embeddedLesson.rootUrl);
          return;
        }
    }
    return super.next(eventId);
  }
}
