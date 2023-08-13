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

import { ListPresenter } from './listPresenter.js';
import { lessonManager } from '../lessonManager.js';
import { LessonSource } from '../lessonSource.js';
import { escapeHtml } from '../../utils/text/textProcessing.js';

/**
 * Class to present a Lesson.
 * Presentation of a Lesson involves displaying the lesson summary.
 * @extends module:lessons/presenters/presenter.Presenter
 */
export class LessonPresenter extends ListPresenter {
  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = ['placeholder']; // this will be replaced later.
    config.itemClassName = 'lesson';
    super(config);
    this.config.lessonInfo = lessonManager.currentLessonInfo;
    this.#buildCustomContent();
    this.setupKeyboardNavigation();
  }

  /**
   * Build custom content for the lesson.
   */
  #buildCustomContent() {
    const li = this.querySelector('li');
    li.innerHTML = `
      <p>${escapeHtml(this.config.lessonInfo.titles.library)}</p>
      <p>${escapeHtml(this.config.lessonInfo.titles.book)}</p>
      <p>${escapeHtml(this.config.lessonInfo.titles.chapter)}</p>
      <p>${escapeHtml(this.config.lessonInfo.titles.lesson)}</p>
    `;
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
