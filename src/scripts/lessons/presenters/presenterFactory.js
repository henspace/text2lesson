/**
 * @file Presenter factory to remove circular dependencies with Presenter modules
 *
 * @module lessons/presenters/presenterFactory
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
import { embeddedLesson } from '../embeddedLesson.js';
import { HomePresenter } from './homePresenter.js';
import { LibraryPresenter } from './libraryPresenter.js';
import { BookPresenter } from './bookPresenter.js';
import { ChapterPresenter } from './chapterPresenter.js';
import { LessonPresenter } from './lessonPresenter.js';
import { LessonEditorPresenter } from './lessonEditorPresenter.js';
import { ProblemPresenter } from './problemPresenter.js';
import { ChoiceProblemPresenter } from './choiceProblemPresenter.js';
import { FillProblemPresenter } from './fillProblemPresenter.js';
import { OrderProblemPresenter } from './orderProblemPresenter.js';
import { SlideProblemPresenter } from './slideProblemPresenter.js';
import { QuestionType } from '../problem.js';
import { MarksPresenter } from './marksPresenter.js';
import { PrintableLessonPresenter } from './printableLessonPresenter.js';
import { lessonManager } from '../lessonManager.js';

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
  LessonEditorPresenter: { previous: LessonPresenter, next: LessonPresenter },
  PrintableLessonPresenter: {
    previous: LessonPresenter,
    next: LessonPresenter,
  },
  ProblemPresenter: { previous: null, next: ProblemPresenter },
  ChoiceProblemPresenter: { previous: null, next: ProblemPresenter },
  FillProblemPresenter: { previous: null, next: ProblemPresenter },
  OrderProblemPresenter: { previous: null, next: ProblemPresenter },
  SlideProblemPresenter: { previous: null, next: ProblemPresenter },
  MarksPresenter: { previous: null, next: ChapterPresenter },
};

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
   * Get a suitable problem presenter based on the configuration.
   * @param {LessonConfig} config
   * @returns {Presenter}
   */
  getSuitableProblemPresenter(config) {
    const problem = config.lesson.peekAtNextProblem();
    switch (problem.questionType) {
      case QuestionType.ORDER:
        return new OrderProblemPresenter(config);
      case QuestionType.FILL:
        return new FillProblemPresenter(config);
      case QuestionType.MULTI:
        return new ChoiceProblemPresenter(config);
      case QuestionType.SIMPLE:
        return new ChoiceProblemPresenter(config);
      case QuestionType.SLIDE:
      default:
        return new SlideProblemPresenter(config);
    }
  }
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
   * Get the home presenter.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
   * @returns {Presenter}  Presenter or null.
   */
  getHome(config) {
    return new HomePresenter(config);
  }

  /**
   * Get the appropriate editor for the calling {@link module:lessons/presenters/presenter.Presenter}
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
   * @returns {Presenter}  Presenter or null.
   */
  getEditor(caller, config) {
    if (
      caller instanceof LessonPresenter ||
      caller instanceof ProblemPresenter ||
      caller instanceof MarksPresenter
    ) {
      return new LessonEditorPresenter(config);
    } else {
      console.error(
        `Attempt to edit a presenter for which there is no editor. Going home.`
      );
      return new HomePresenter(config);
    }
  }
  /**
   * Get the appropriate navigator for the calling {@link module:lessons/presenters/presenter.Presenter}
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
   * @returns {Presenter} Presenter or null.
   */
  getNext(caller, config) {
    if (
      caller instanceof ProblemPresenter ||
      caller instanceof LessonPresenter
    ) {
      if (config.lesson.hasMoreProblems) {
        return this.getSuitableProblemPresenter(config);
      } else {
        return new MarksPresenter(config);
      }
    } else {
      const klass = this.#skipUnnecessaryListPresenters(
        NAVIGATION[caller.constructor.name].next
      );
      return klass ? new klass(config) : null;
    }
  }

  /**
   * Get the appropriate problem presenter to repeat the current problem.
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @returns {Presenter} Presenter or undefined.
   */
  getPrevious(caller, config) {
    const klass = NAVIGATION[caller.constructor.name].previous;
    return klass ? new klass(config) : null;
  }
  /**
   * Get the appropriate problem presenter to repeat the current problem.
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @returns {Presenter} Presenter or undefined.
   */
  getProblemAgain(caller, config) {
    if (!(caller instanceof MarksPresenter)) {
      console.error(
        'Attempt to retry problem from other than a MarksPresenter.'
      );
      return this.getHome(config);
    } else {
      config.lesson.restart();
      if (config.lesson.hasMoreProblems) {
        return this.getSuitableProblemPresenter(config);
      } else {
        return new MarksPresenter(config);
      }
    }
  }

  /**
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
   * @returns {Presenter} Presenter or null.
   */
  getLibraryPresenter(callerIgnored, config) {
    const klass = this.#skipUnnecessaryListPresenters(LibraryPresenter);
    return new klass(config);
  }

  /**
   * Get a printable presenter. If one is not available, it juts goes home.
   * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
   * @returns {Presenter} Presenter.
   */
  getPrintable(caller, config) {
    if (caller instanceof LessonPresenter) {
      return new PrintableLessonPresenter(config);
    } else {
      console.error(
        'Attempt to get a printable presenter from other than a LessonPresenter.'
      );
      this.config.lesson = null;
      return new HomePresenter(config);
    }
  }

  /**
   * For list presenters, skip to next if it only has one entry.
   * @param {Class} presenterClass
   * @returns {Class}
   */
  #skipUnnecessaryListPresenters(presenterClass) {
    for (;;) {
      const nextClass = this.#moveToNextPresenterIfUnnecessary(presenterClass);
      if (nextClass === presenterClass) {
        return presenterClass;
      }
      presenterClass = nextClass;
    }
  }

  /**
   * Move to the next presenter if the current one only has one option to choose
   * from.
   * @param {Class} presenterClass
   * @returns {Class} new Class. This will be unchanged if no switch occurred.
   */
  #moveToNextPresenterIfUnnecessary(presenterClass) {
    switch (presenterClass.name) {
      case 'LibraryPresenter':
        if (lessonManager.bookTitles.length <= 1) {
          lessonManager.bookIndex = 0;
          return BookPresenter;
        }
        break;
      case 'BookPresenter':
        if (lessonManager.chapterTitles.length <= 1) {
          lessonManager.chapterIndex = 0;
          return ChapterPresenter;
        }
        break;
      case 'ChapterPresenter':
        if (lessonManager.lessonTitles.length <= 1) {
          lessonManager.lessonIndex = 0;
          return LessonPresenter;
        }
        break;
    }
    return presenterClass;
  }

  /**
   * Get the initial presenter.
   * @returns {Presenter}
   */
  static getInitial() {
    const config = { factory: new PresenterFactory() };
    if (embeddedLesson.hasLesson) {
      config.lesson = embeddedLesson.lesson;
      config.lessonInfo = embeddedLesson.lessonInfo;
      if (config.lesson.hasMoreProblems) {
        return config.factory.getSuitableProblemPresenter(config);
      } else {
        return new MarksPresenter(config);
      }
    }
    return new HomePresenter(config);
  }
}
