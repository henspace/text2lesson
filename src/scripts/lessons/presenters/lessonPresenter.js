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
   * @type {string}
   */
  static PRINT_EVENT_ID = 'PRINT_LESSON';

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presenter
   */
  constructor(config) {
    config.titles = ['placeholder']; // this will be replaced later.
    config.itemClassName = 'lesson-summary';
    super(config);
    this.config.lessonInfo = lessonManager.currentLessonInfo;
    this.#buildCustomContent();
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
    this.listenToEventOn('keydown', summaryBlock, Presenter.NEXT_ID);
    this.#showNextButtonIfContent();
    this.#addPrintButton();
    this.#addEditButtonIfLocal();
  }

  /**
   * Add the print button
   */
  #addPrintButton() {
    const printButton = new ManagedElement('button');
    icons.applyIconToElement(icons.printPreview, printButton);
    this.addButtonToBar(printButton);
    this.listenToEventOn('click', printButton, LessonPresenter.PRINT_EVENT_ID);
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
   * lessons, but hidden for local lessons that have no content.
   * This also sets the flag #nextNotAppropriate if the button is not shown.
   */
  #showNextButtonIfContent() {
    if (this.config.lessonInfo.usingLocalLibrary) {
      lessonManager.loadCurrentLesson().then((cachedLesson) => {
        if (cachedLesson?.content) {
          this.showNextButton();
          return;
        }
      });
    } else {
      this.showNextButton();
    }
  }

  /**
   * Load the lesson into the config
   * @returns {Promise<boolean>} fulfils to true if loaded
   */
  #loadLessonIntoConfig() {
    return lessonManager.loadCurrentLesson().then((cachedLesson) => {
      if (!cachedLesson) {
        return false;
      } else {
        const lessonSource = LessonSource.createFromSource(
          cachedLesson.content
        );
        this.config.lesson = lessonSource.convertToLesson();
        return true;
      }
    });
  }

  /**
   * Handle the click event.
   * @param {Event} event
   * @param {string} eventId
   */
  async handleClickEvent(event, eventId) {
    switch (eventId) {
      case LessonPresenter.PRINT_EVENT_ID:
      case Presenter.NEXT_ID:
        await this.#loadLessonIntoConfig().then((loaded) => {
          if (!loaded) {
            toast(
              i18n`Unable to load lesson. This might be temporary, so please wait and then try again.`
            );
          } else {
            return super.handleClickEvent(event, eventId);
          }
        });
        break;
      default:
        await super.handleClickEvent(event, eventId);
    }
  }
  /**
   * @override
   */
  next(eventId) {
    switch (eventId) {
      case LessonPresenter.EDIT_EVENT_ID:
        return this.config.factory.getEditor(this, this.config);
      case LessonPresenter.PRINT_EVENT_ID:
        return this.config.factory.getPrintable(this, this.config);
      default:
        return this.config.factory.getNext(this, this.config);
    }
  }

  /**
   * @override
   */
  previous() {
    return this.config.factory.getPrevious(this, this.config);
  }
}
