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
import { jest, test, expect } from '@jest/globals';

jest.unstable_mockModule('./libraryPresenter.js', () => {
  return {
    LibraryPresenter: function (config) {
      this.config = config;
    },
  };
});

jest.unstable_mockModule('./bookPresenter.js', () => {
  return {
    BookPresenter: function (config) {
      this.config = config;
    },
  };
});

jest.unstable_mockModule('./chapterPresenter.js', () => {
  return {
    ChapterPresenter: function (config) {
      this.config = config;
    },
  };
});

jest.unstable_mockModule('./lessonPresenter.js', () => {
  return {
    LessonPresenter: function (config) {
      this.config = config;
    },
  };
});

jest.unstable_mockModule('./problemPresenter.js', () => {
  return {
    ProblemPresenter: function (config) {
      this.config = config;
    },
  };
});

const { LibraryPresenter } = await import('./libraryPresenter.js');
const { BookPresenter } = await import('./bookPresenter.js');
const { ChapterPresenter } = await import('./chapterPresenter.js');
const { LessonPresenter } = await import('./lessonPresenter.js');
const { ProblemPresenter } = await import('./problemPresenter.js');
const { presenterFactory } = await import('./presenterFactory.js');

const TEST_DATA = [
  {
    callerClass: LibraryPresenter,
    hasPrevious: false,
    previous: null,
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
    next: ProblemPresenter,
  },
  {
    callerClass: ProblemPresenter,
    hasPrevious: false,
    previous: null,
    next: ProblemPresenter,
  },
];

test('Library presenter no previous, BookPresenter next, null previous', () => {
  TEST_DATA.forEach((data) => {
    const config = {
      value: data.callerClass.name,
      lesson: {
        hasMoreProblems: () => true,
      },
    };
    const caller = new data.callerClass(config);
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
    'is another ProblemPresenter',
  () => {
    const config = {
      lesson: {
        hasMoreProblems: true,
      },
    };

    const presenter = new ProblemPresenter(config);
    expect(presenterFactory.getNext(presenter, config)).toBeInstanceOf(
      ProblemPresenter
    );
  }
);

test(
  'If lesson has no more problems, next called by a ProblemPresenter ' +
    'is a ResultPresenter',
  () => {
    const config = {
      lesson: {
        hasMoreProblems: false,
      },
    };

    const presenter = new ProblemPresenter(config);
    expect(presenterFactory.getNext(presenter, config)).toBeNull();
    /*
    @ToDo
    expect(presenterFactory.getNext(presenter, config)).toBeInstanceOf(
      ResultPresenter
    );
    */
  }
);
