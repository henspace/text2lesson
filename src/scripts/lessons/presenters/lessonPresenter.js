/**
 * @file Lesson Presenter
 *
 * @module lessons/presenters/lessonPresenter
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
import { lessonManager } from '../lessonManager.js';
import { LessonSource } from '../lessonSource.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { icons } from '../../utils/userIo/icons.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { toast } from '../../utils/userIo/toast.js';

/**
 * Class to present a Lesson.
 * Presentation of a Lesson involves displaying the lesson summary.
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class LessonPresenter extends Presenter {
  /**
   * @type {string}
   */
  static EDIT_EVENT_ID = 'EDIT_LESSON';

  /**
   * Flag whether it okay to progress to next.
   * @type {boolean}
   */
  #allowNext = false;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = ['placeholder']; // this will be replaced later.
    config.itemClassName = 'lesson-summary';
    super(config);
    this.config.lessonInfo = lessonManager.currentLessonInfo;
    this.#buildCustomContent();
    this.autoAddKeydownEvents();
    if (this.config?.factory?.hasPrevious(this)) {
      this.showBackButton();
    }
  }

  /**
   * Build custom content for the lesson.
   */
  #buildCustomContent() {
    this.presentation.createAndAppendChild('p', null, i18n`Selected lesson:`);
    const summaryBlock = this.presentation.createAndAppendChild(
      'button',
      'lesson-summary'
    );
    summaryBlock.createAndAppendChild(
      'div',
      'library-title',
      this.config.lessonInfo.titles.library
    );
    if (!lessonManager.usingLocalLibrary) {
      summaryBlock.createAndAppendChild(
        'div',
        'book-title',
        this.config.lessonInfo.titles.book
      );
      summaryBlock.createAndAppendChild(
        'div',
        'chapter-title',
        this.config.lessonInfo.titles.chapter
      );
    }
    summaryBlock.createAndAppendChild(
      'div',
      'lesson-title',
      this.config.lessonInfo.titles.lesson
    );

    this.presentation.appendChild(summaryBlock);
    this.applyIconToNextButton(icons.playLesson);
    this.listenToEventOn('click', summaryBlock, Presenter.NEXT_ID);
    this.#showNextButtonIfContent();

    this.#addEditButtonIfLocal();
  }

  /**
   * Add the edit button
   */
  #addEditButtonIfLocal() {
    if (this.config.lessonInfo.usingLocalLibrary) {
      const editButton = new ManagedElement('button');
      icons.applyIconToElement(icons.edit, editButton);
      this.addButtonToBar(editButton);
      this.listenToEventOn('click', editButton, LessonPresenter.EDIT_EVENT_ID);
    }
  }

  /**
   * Show the next button if appropriate. It is always shown for remote
   * lessons but hidden for local lessons that have no content.
   * This also sets the flag #nextNotAppropriate if the button is not shown.
   */
  #showNextButtonIfContent() {
    if (this.config.lessonInfo.usingLocalLibrary) {
      lessonManager.loadCurrentLesson().then((cachedLesson) => {
        if (cachedLesson.content) {
          this.#setNextOkay();
          return;
        }
      });
    } else {
      this.#setNextOkay();
    }
  }

  /**
   * Show the next button and flag that it is okay to progress to the next
   * presenter.
   */
  #setNextOkay() {
    this.#allowNext = true;
    this.showNextButton();
  }

  /**
   * @override
   */
  next(eventId) {
    if (eventId === LessonPresenter.EDIT_EVENT_ID) {
      return this.config.factory.getEditor(this, this.config);
    } else if (!this.#allowNext) {
      toast(
        i18n`This lesson is empty. You need to edit it first and add some content.`
      );
    } else {
      return lessonManager.loadCurrentLesson().then((cachedLesson) => {
        const lessonSource = LessonSource.createFromSource(
          cachedLesson.content
        );
        this.config.lesson = lessonSource.convertToLesson();
        return this.config.factory.getNext(this, this.config);
      });
    }
  }
  /**
   * @override
   */
  previous() {
    return this.config.factory.getPrevious(this, this.config);
  }
}
