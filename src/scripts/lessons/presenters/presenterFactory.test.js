/**
 * @file Test for the presenter factory
 *
 * @module lessons/presenters/presenterFactory.test
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
import { jest, beforeEach, test, expect } from '@jest/globals';
import { ItemMarker } from '../itemMarker.js';

const mockedLessonManager = {
  libraryTitles: ['lib1', 'lib2'],
  bookTitles: ['book1', 'book2'],
  chapterTitles: ['chapter1', 'chapter2'],
  lessonTitles: ['lesson1', 'lesson2'],
  currentLessonInfo: {
    titles: {
      library: 'library',
      book: 'book',
      chapter: 'chapter',
      lesson: 'lesson',
    },
  },
};

jest.unstable_mockModule('../lessonManager.js', () => {
  return {
    lessonManager: mockedLessonManager,
  };
});

jest.unstable_mockModule('../lesson.js', () => {
  return {
    Lesson: jest.fn(function () {
      this.marker = new ItemMarker();
      return {
        hasMoreProblems: true,
        peekAtNextProblem: jest.fn(() => new Problem()),
        getNextProblem: jest.fn(() => new Problem()),
        nextProblem: jest.fn(() => new Problem()),
        marks: this.marker.marks,
      };
    }),
  };
});

jest.unstable_mockModule('../problem.js', () => {
  return {
    QuestionType: {
      SIMPLE: 'simple',
      MULTI: 'multi',
      FILL: 'fill',
      ORDER: 'order',
      SLIDE: 'slide',
    },
    Problem: jest.fn(() => {
      return {
        questionType: 'slide',
        intro: { html: 'intro' },
        question: { html: 'intro' },
        explanation: { html: 'intro' },
      };
    }),
  };
});

const { Lesson } = await import('../lesson.js');
const { Problem } = await import('../problem.js');

const { HomePresenter } = await import('./homePresenter.js');
const { LibraryPresenter } = await import('./libraryPresenter.js');
const { BookPresenter } = await import('./bookPresenter.js');
const { ChapterPresenter } = await import('./chapterPresenter.js');
const { LessonPresenter } = await import('./lessonPresenter.js');

const { ProblemPresenter } = await import('./problemPresenter.js');
const { SlideProblemPresenter } = await import('./slideProblemPresenter.js');
const { MarksPresenter } = await import('./marksPresenter.js');

const { PresenterFactory } = await import('./presenterFactory.js');

const TEST_DATA = [
  {
    callerClass: LibraryPresenter,
    hasPrevious: true,
    previous: HomePresenter,
    next: BookPresenter,
  },
  {
    callerClass: BookPresenter,
    hasPrevious: true,
    previous: LibraryPresenter,
    next: ChapterPresenter,
  },
  {
    callerClass: ChapterPresenter,
    hasPrevious: true,
    previous: BookPresenter,
    next: LessonPresenter,
  },
  {
    callerClass: LessonPresenter,
    hasPrevious: true,
    previous: ChapterPresenter,
    next: SlideProblemPresenter,
  },
  {
    callerClass: ProblemPresenter,
    hasPrevious: false,
    previous: null,
    next: SlideProblemPresenter,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

test('Factory provides expected next and previous presenters for test data', () => {
  const presenterFactory = new PresenterFactory();
  TEST_DATA.forEach((data) => {
    const config = {
      titles: ['title1', 'title2'],
      value: data.callerClass.name,
      lesson: null,
    };

    config.lesson = new Lesson();
    const caller = new data.callerClass(config);
    console.log(`Test ${caller.constructor.name}`);
    const next = presenterFactory.getNext(caller, config);
    const previous = presenterFactory.getPrevious(caller, config);
    expect(presenterFactory.hasPrevious(caller)).toBe(data.hasPrevious);

    if (data.next === null) {
      expect(next).toBeNull();
    } else {
      expect(next).toBeInstanceOf(data.next);
      expect(next.config).toBe(config);
    }

    if (data.previous === null) {
      expect(previous).toBeNull();
    } else {
      expect(previous).toBeInstanceOf(data.previous);
      expect(previous.config).toBe(config);
    }
  });
});

test(
  'If lesson has more problems, next called by a ProblemPresenter ' +
    'is another ProblemPresenter set by problem question type.',
  () => {
    const config = {
      lesson: new Lesson(),
    };
    const presenterFactory = new PresenterFactory();
    const presenter = new ProblemPresenter(config);
    expect(presenterFactory.getNext(presenter, config)).toBeInstanceOf(
      SlideProblemPresenter
    );
  }
);

test(
  'If lesson has no more problems, next called by a ProblemPresenter ' +
    'is a MarksPresenter',
  () => {
    const config = {
      lesson: new Lesson(),
      lessonInfo: {
        titles: {
          library: 'library',
          book: 'book',
          chapter: 'chapter',
          lesson: 'lesson',
        },
      },
    };
    const presenterFactory = new PresenterFactory();
    const presenter = new ProblemPresenter(config);
    jest.replaceProperty(config.lesson, 'hasMoreProblems', false);
    expect(presenterFactory.getNext(presenter, config)).toBeInstanceOf(
      MarksPresenter
    );
    jest.replaceProperty(config.lesson, 'hasMoreProblems', true);
  }
);
