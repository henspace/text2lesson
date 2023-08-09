/**
 * @file Tests for the library presenter.
 *
 * @module lessons/presenters/bookPresenter.test
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

const currentLessonInfo = {
  libraryKey: 'key',
  file: 'libfile',
  indexes: {
    book: 0,
    chapter: 0,
    lesson: 0,
  },
  titles: {
    library: 'the library',
    book: 'the book',
    chapter: 'the chapter',
    lesson: 'the lesson',
  },
};

class MockPresenter {
  constructor(config) {
    this.config = config;
  }
  next(indexIgnored) {
    return null;
  }
  previous() {
    return null;
  }
}

jest.unstable_mockModule('./presenter.js', () => {
  return {
    Presenter: jest.fn(function (config) {
      this.config = config;
    }),
  };
});

jest.unstable_mockModule('../lessonManager.js', () => {
  return {
    lessonManager: {
      libraryKey: '',
      bookIndex: 0,
      chapterIndex: 0,
      lessonIndex: 0,
      chapterTitles: ['title1', 'title2', 'title3'],
      currentLessonInfo: currentLessonInfo,
      loadCurrentLesson: () => {
        return Promise.resolve();
      },
    },
  };
});

jest.unstable_mockModule('./presenterFactory.js', () => {
  return {
    presenterFactory: {
      hasNext: jest.fn((callerIgnored) => true),
      hasPrevious: jest.fn((callerIgnored, configIgnored) => true),
      getNext: jest.fn((callerIgnored, config) => new MockPresenter(config)),
      getPrevious: jest.fn(
        (callerIgnored, config) => new MockPresenter(config)
      ),
    },
  };
});

const { presenterFactory } = await import('./presenterFactory');
const { lessonManager } = await import('../lessonManager.js');
const { BookPresenter } = await import('./bookPresenter.js');

beforeEach(() => {
  presenterFactory.getNext.mockClear();
  presenterFactory.getPrevious.mockClear();
});

test('constructor provides base class with class name of bookPresenter.', () => {
  const bookPresenter = new BookPresenter({});
  expect(bookPresenter.config.className).toBe('bookPresenter');
});

test('constructor provides base class with chapter library titles.', () => {
  const bookPresenter = new BookPresenter({});
  expect(bookPresenter.config.titles).toStrictEqual(
    lessonManager.chapterTitles
  );
});

test('next function provides presenter from presenterFactory constructed with config', () => {
  const config = {
    factory: presenterFactory,
  };
  const bookPresenter = new BookPresenter(config);
  const index = 6;
  const next = bookPresenter.next(index);
  expect(next).toBeInstanceOf(MockPresenter);
  expect(presenterFactory.getNext).toBeCalledTimes(1);
  expect(presenterFactory.getPrevious).toBeCalledTimes(0);
  let expectedConfig = { ...bookPresenter.config };
  expect(presenterFactory.getNext.mock.calls[0][0]).toBe(bookPresenter);
  expect(presenterFactory.getNext.mock.calls[0][1]).toEqual(expectedConfig);
});

test("next function sets lessonManager's chapterIndex to index", () => {
  const bookPresenter = new BookPresenter({
    factory: presenterFactory,
  });
  const index = 6;
  bookPresenter.next(index);
  expect(lessonManager.chapterIndex).toBe(index);
});

test('previous function provides presenter from presenterFactory constructed with config', () => {
  const config = {
    factory: presenterFactory,
  };
  const bookPresenter = new BookPresenter(config);
  const index = 6;
  const next = bookPresenter.previous(index);
  expect(next).toBeInstanceOf(MockPresenter);
  expect(presenterFactory.getNext).toBeCalledTimes(0);
  expect(presenterFactory.getPrevious).toBeCalledTimes(1);
  let expectedConfig = { ...bookPresenter.config };
  expect(presenterFactory.getPrevious.mock.calls[0][0]).toBe(bookPresenter);
  expect(presenterFactory.getPrevious.mock.calls[0][1]).toEqual(expectedConfig);
});
