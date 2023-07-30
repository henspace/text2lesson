/**
 * @file Lesson Presenter
 *
 * @module lessons\presenters\lessonPresenter
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
import { ProblemPresenter } from './problemPresenter.js';
import { ChapterPresenter } from './chapterPresenter.js';
import { lessonManager } from '../lessonManager.js';
import { LessonSource } from '../lessonSource.js';

/**
 * Class to present a Lesson.
 * Presentation of a Lesson involves displaying the lesson summary.
 */
export class LessonPresenter extends Presenter {
  /**
   * Construct.
   */
  constructor() {
    const lessonInfo = lessonManager.currentLessonInfo;
    super('lessonPresenter', {
      titles: [
        lessonInfo.titles.library,
        lessonInfo.titles.book,
        lessonInfo.titles.chapter,
        lessonInfo.titles.lesson,
      ],
      itemClassName: 'lessonTitle',
      next: (indexIgnored) => {
        return lessonManager.loadCurrentLesson().then((cachedLesson) => {
          const lessonSource = LessonSource.createFromSource(
            cachedLesson.content
          );
          return new ProblemPresenter(0, lessonSource.convertToLesson());
        });
      },
      previous: () => {
        const currentLessonInfo = lessonManager.currentLessonInfo;
        return Promise.resolve(
          new ChapterPresenter(currentLessonInfo.indexes.chapter)
        );
      },
    });
  }
}
