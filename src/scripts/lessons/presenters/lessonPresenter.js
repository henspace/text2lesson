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

/**
 * Class to present a Lesson.
 * Presentation of a Lesson involves displaying the lesson summary.
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class LessonPresenter extends Presenter {
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
    this.setupKeyboardNavigation();
  }

  /**
   * Build custom content for the lesson.
   */
  #buildCustomContent() {
    this.presentation.createAndAppendChild('h2', null, i18n`Selected lesson:`);
    const summaryBlock = this.presentation.createAndAppendChild(
      'div',
      'lesson-summary'
    );
    summaryBlock.createAndAppendChild(
      'span',
      'lesson-title',
      this.config.lessonInfo.titles.lesson
    );
    summaryBlock.createAndAppendChild('p', null, i18n`taken from`);
    summaryBlock.createAndAppendChild(
      'span',
      'library-title',
      this.config.lessonInfo.titles.library
    );
    summaryBlock.createAndAppendChild(
      'span',
      'book-title',
      this.config.lessonInfo.titles.book
    );
    summaryBlock.createAndAppendChild(
      'span',
      'chapter-title',
      this.config.lessonInfo.titles.chapter
    );
    this.presentation.appendChild(summaryBlock);
    this.applyIconToNextButton(icons.playLesson);
    this.showNextButton();
  }
  /**
   * @override
   */
  next(indexIgnored) {
    return lessonManager.loadCurrentLesson().then((cachedLesson) => {
      const lessonSource = LessonSource.createFromSource(cachedLesson.content);
      this.config.lesson = lessonSource.convertToLesson();
      return this.config.factory.getNext(this, this.config);
    });
  }
  /**
   * @override
   */
  previous() {
    return this.config.factory.getPrevious(this, this.config);
  }
}
