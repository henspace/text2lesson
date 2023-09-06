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
import { BuildInfo } from '../../data/constants.js';
import * as share from '../../utils/share/share.js';
import { Urls } from '../../data/urls.js';

/**
 * Classes used for styling medals.
 * percent gives the score required to achieve the result.
 * @enum {{percent:number, cssClass:string}}
 */
const MedalDetails = {
  POOR: {
    upperLimit: 25,
    cssClass: 'poor',
    emojiCode: '\u{1f62c}',
  },
  BAD: {
    upperLimit: 50,
    cssClass: 'bad',
    emojiCode: '\u{1f614}',
  },
  GOOD: {
    upperLimit: 75,
    cssClass: 'good',
    emojiCode: '\u{1f948}',
  },
  EXCELLENT: {
    upperLimit: 100,
    cssClass: 'excellent',
    emojiCode: '\u{1f947}',
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
   * @const
   */
  static EMAIL_ID = 'EMAIL';
  /**
   * @const
   */
  static WEBSHARE_CERTIFICATE_ID = 'WEBSHARE_CERTIFICATE';
  /**
   * @const
   */
  static WEBSHARE_AUTORUN_ID = 'WEBSHARE_AUTORUN';

  /**
   * @type {module:lessons/itemMarker~Marks}
   */
  #marks;

  /**
   * Assigned medal
   */
  #assignedMedal;
  /**
   * Text detailing the completion date
   */
  #completionDateText;

  /**
   * Text summarising the score.
   */
  #scoreSummaryText;
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
    this.#addShareButtons();
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

  /** Add a retry button, but only if there is at least one problem to answer. */
  #addRetryButton() {
    if (!this.config.lesson.isEmpty) {
      const repeatButton = new ManagedElement('button');
      icons.applyIconToElement(icons.repeatLesson, repeatButton);
      this.addButtonToBar(repeatButton);
      this.listenToEventOn(
        'click',
        repeatButton,
        MarksPresenter.RETRY_LESSON_ID
      );
    }
  }

  /**
   * Add a list of answers.
   */
  #addAnswers() {
    const answers = new ManagedElement('div');
    this.config.lesson.marks.markedItems.forEach((markedItem) => {
      const item = new ManagedElement('div', 'answer-summary');
      item.innerHTML = `${markedItem.item.question.html}`;
      item.classList.add(this.#getClassForMarkState(markedItem.state));
      answers.appendChild(item);
    });
    this.presentation.appendChild(answers);
  }

  /**
   * Add the score.
   *  This also stores formatted text in this.#completionDateText and
   * this.#scoreSummaryText.
   */
  #addResult() {
    const marks = this.config.lesson.marks;
    const totalQuestions = marks.correct + marks.incorrect + marks.skipped;
    const percent =
      totalQuestions == 0
        ? 0
        : Math.round((100 * marks.correct) / totalQuestions);
    this.#scoreSummaryText = i18n`Score: ${percent}% (${marks.correct}/${totalQuestions})`;
    const summaryItem = this.presentation.createAndAppendChild(
      'p',
      'result-summary',
      this.#scoreSummaryText
    );
    const completionDate = this.config.lesson.lastUpdated;
    const formattedDate = completionDate.toUTCString();
    this.#completionDateText = i18n`Lesson completed on ${formattedDate}`;
    this.presentation.createAndAppendChild(
      'p',
      'certificate-date',
      this.#completionDateText
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
   * The result is stored in #assignedMedal.
   */
  #calcMedalClass(percent) {
    for (const key in MedalDetails) {
      const details = MedalDetails[key];
      if (percent < details.upperLimit) {
        this.#assignedMedal = details;
        return details.cssClass;
      }
    }
    this.#assignedMedal = MedalDetails.EXCELLENT;
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
      case MarksPresenter.EMAIL_ID:
        return this.#emailResults();
      case MarksPresenter.WEBSHARE_CERTIFICATE_ID:
        return this.#webShareResults();
      case MarksPresenter.WEBSHARE_AUTORUN_ID:
        return this.#webShareAutorun();
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

  /**
   * Add share buttons. This either uses the Web Share Api or a mailto link.
   */
  #addShareButtons() {
    if (window.navigator.canShare) {
      this.#addWebShareCertificateButton();
      this.#addWebShareAutorunButton();
    } else {
      this.#addEmailButton();
    }
  }

  /**
   * Add a share button using the webshare option.
   */
  #addEmailButton() {
    const button = new ManagedElement('button');
    icons.applyIconToElement(icons.email, button);
    this.addButtonToBar(button);
    this.listenToEventOn('click', button, MarksPresenter.EMAIL_ID);
  }

  /**
   * Add a share button using the Mailto option.
   */
  #addWebShareCertificateButton() {
    const button = new ManagedElement('button');
    icons.applyIconToElement(icons.webshareCertificate, button);
    this.addButtonToBar(button);
    this.listenToEventOn(
      'click',
      button,
      MarksPresenter.WEBSHARE_CERTIFICATE_ID
    );
  }

  /**
   * Add a share button using the Mailto option.
   */
  #addWebShareAutorunButton() {
    const button = new ManagedElement('button');
    icons.applyIconToElement(icons.webshareAutorun, button);
    this.addButtonToBar(button);
    this.listenToEventOn('click', button, MarksPresenter.WEBSHARE_AUTORUN_ID);
  }

  /**
   * Plain text results.
   */
  #getPlainTextResults() {
    const lines = [];
    lines.push(i18n`Hi!`);
    lines.push(i18n`I've just completed this lesson:`);
    lines.push(`  ` + this.config.lessonInfo.titles.lesson);
    if (this.config.lessonInfo.managed) {
      lines.push(
        i18n`taken from the ${this.config.lessonInfo.titles.library} library`
      );
      if (!lessonManager.usingLocalLibrary) {
        lines.push(`  ` + i18n`Book: ${this.config.lessonInfo.titles.book}`);
        lines.push(
          `  ` + i18n`Chapter: ${this.config.lessonInfo.titles.chapter}`
        );
      }
    }
    lines.push('\n');
    lines.push('____________________');
    lines.push(this.#scoreSummaryText + ` ${this.#assignedMedal.emojiCode}`);
    lines.push(this.#completionDateText);
    lines.push('____________________');
    lines.push('\n');
    lines.push(
      i18n`Find out more about ${BuildInfo.getProductName()} at ${
        Urls.DOCS_HOME
      }`
    );
    return lines.join('\n');
  }

  /**
   * Send the results using an email link.
   */
  #emailResults() {
    const data = {
      to: '',
      subject: i18n`I've just completed a lesson in ${BuildInfo.getProductName()}`,
      body: this.#getPlainTextResults(),
    };
    share.shareByEmail(data);
  }

  /**
   * Send the results using a webshare api
   */
  #webShareResults() {
    const data = document.getElementById('content').innerHTML;
    share.shareCertificateContent(data);
  }

  /**
   * Send the an autoshare file using a webshare api
   */
  #webShareAutorun() {
    share.shareAutorunLesson(
      this.config.lessonInfo.titles.lesson,
      this.config.lesson
    );
  }
}
