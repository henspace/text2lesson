/**
 * @file Presenter factory to remove circular dependendies with Presenter modules
 *
 * @module lessons/presenters/navigatorFactory
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

import { HomePresenter } from './homePresenter.js';
import { LibraryPresenter } from './libraryPresenter.js';
import { BookPresenter } from './bookPresenter.js';
import { ChapterPresenter } from './chapterPresenter.js';
import { LessonPresenter } from './lessonPresenter.js';
import { ProblemPresenter } from './problemPresenter.js';
import { ChoiceProblemPresenter } from './choiceProblemPresenter.js';
import { FillProblemPresenter } from './fillProblemPresenter.js';
import { OrderProblemPresenter } from './orderProblemPresenter.js';
import { SlideProblemPresenter } from './slideProblemPresenter.js';
import { QuestionType } from '../problem.js';

/**
 * Navigation definition for Presenters.
 * @type {Object<string,{previous:constructor, next:constructor}>}
 */
const NAVIGATION = {
  HomePresenter: { previous: null, next: LibraryPresenter },
  LibraryPresenter: { previous: HomePresenter, next: BookPresenter },
  BookPresenter: { previous: LibraryPresenter, next: ChapterPresenter },
  ChapterPresenter: { previous: BookPresenter, next: LessonPresenter },
  LessonPresenter: { previous: ChapterPresenter, next: ProblemPresenter },
  ProblemPresenter: { previous: null, next: ProblemPresenter },
  ChoiceProblemPresenter: { previous: null, next: ProblemPresenter },
  FillProblemPresenter: { previous: null, next: ProblemPresenter },
  OrderProblemPresenter: { previous: null, next: ProblemPresenter },
  SlideProblemPresenter: { previous: null, next: ProblemPresenter },
};

function getSuitableProblemPresenter(config) {
  const problem = config.lesson.peekAtNextProblem();
  switch (problem.questionType) {
    case QuestionType.ORDER:
      return new OrderProblemPresenter(config);
    case QuestionType.FILL:
      return new FillProblemPresenter(config);
    case QuestionType.MULTI:
      return new ChoiceProblemPresenter(config);
    case QuestionType.SLIDE:
      return new SlideProblemPresenter(config);
    case QuestionType.SIMPLE:
      return new ChoiceProblemPresenter(config);
  }
}
/**
 * Factory for generating the navigation for Presenters.
 *
 * #Use of minifiers#
 * For this function to operate correctly, ensure that `Terser` is run
 * with the `keep_classnames` set to true. Otherwise the {@link Navigation} object
 * may be minified with anonymous classes and the use of `constructor.name` will
 * fail.
 * @type {module:lessons/presenters/presenter~PresenterFactory}
 */

export class PresenterFactory {
  /**
   * Test if next exists for caller.
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @returns {boolean} True if supported.
   */
  hasNext(caller) {
    return !!NAVIGATION[caller.constructor.name].next;
  }
  /**
   * Test if previous exists for caller.
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @returns {boolean} True if supported.
   */
  hasPrevious(caller) {
    return !!NAVIGATION[caller.constructor.name].previous;
  }
  /**
   * Get the appropriate navigator for the calling {@link module:lessons/presenters/presenter.Presenter}
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
   * @returns {constructor} Constructor for the next Presenter or null.
   */
  getNext(caller, config) {
    if (
      caller instanceof ProblemPresenter ||
      caller instanceof LessonPresenter
    ) {
      if (config.lesson.hasMoreProblems) {
        return getSuitableProblemPresenter(config);
      } else {
        return null;
      }
    } else {
      const klass = NAVIGATION[caller.constructor.name].next;
      return klass ? new klass(config) : null;
    }
  }
  /**
   * Get the appropriate navigator for the calling {@link module:lessons/presenters/presenter.Presenter}
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @returns {constructor} Constructor for the next Presenter or undefined.
   */
  getPrevious(caller, config) {
    const klass = NAVIGATION[caller.constructor.name].previous;
    return klass ? new klass(config) : null;
  }

  /**
   * Get the initial presenter.
   */
  static getInitial() {
    return new HomePresenter({ factory: new PresenterFactory() });
  }
}
