/**
 * @file Tests for the library presenter.
 *
 * @module lessons/presenters/libraryPresenter.test
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

jest.unstable_mockModule('./presenter.js', () => {
  return {
    Presenter: jest.fn(function (className, config) {
      this.config = config;
      this.className = className;
    }),
  };
});

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

jest.unstable_mockModule('./bookPresenter.js', () => {
  return {
    BookPresenter: jest.fn((indexIgnored) => null),
  };
});

const { BookPresenter } = await import('./bookPresenter.js');
const { lessonManager } = await import('../lessonManager.js');
const { LibraryPresenter } = await import('./libraryPresenter');

test('constructor provides base class with class name of libraryPresenter.', () => {
  const libraryPresenter = new LibraryPresenter();
  expect(libraryPresenter.className).toBe('libraryPresenter');
});

test('constructor provides base class with library titles.', () => {
  const libraryPresenter = new LibraryPresenter();
  expect(libraryPresenter.config.titles).toStrictEqual(
    lessonManager.bookTitles
  );
});

test('next function provides BookPresenter constructed with index', () => {
  const libraryPresenter = new LibraryPresenter();
  const index = 6;
  return libraryPresenter.config.next(index).then((next) => {
    expect(BookPresenter).toHaveBeenCalledWith(index);
    expect(next).toBeInstanceOf(BookPresenter);
  });
});

test('previous function is not defined', () => {
  const libraryPresenter = new LibraryPresenter();
  expect(libraryPresenter.config.previous).toBeUndefined();
});
