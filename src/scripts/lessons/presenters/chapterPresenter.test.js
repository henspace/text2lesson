/**
 * @file Test for chapter presenter
 *
 * @module lessons/presenters/chapterPresenter.test
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

jest.unstable_mockModule('../lessonManager.js', () => {
  return {
    lessonManager: {
      libraryKey: '',
      bookIndex: 0,
      chapterIndex: 0,
      lessonIndex: 0,
      chapterTitles: ['title1', 'title2', 'title3'],
      currentLessonInfo: {
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
      },
    },
  };
});

jest.unstable_mockModule('./lessonPresenter.js', () => {
  return {
    LessonPresenter: jest.fn((indexIgnored) => null),
  };
});

jest.unstable_mockModule('./bookPresenter.js', () => {
  return {
    BookPresenter: jest.fn((indexIgnored) => null),
  };
});
const { BookPresenter } = await import('./bookPresenter.js');

const { LessonPresenter } = await import('./lessonPresenter.js');
const { lessonManager } = await import('../lessonManager.js');
const { ChapterPresenter } = await import('./chapterPresenter');

test('constructor provides base class with class name of chapterPresenter.', () => {
  const presenter = new ChapterPresenter();
  expect(presenter.className).toBe('chapterPresenter');
});

test('constructor provides base class with chapter titles.', () => {
  const presenter = new ChapterPresenter();
  expect(presenter.config.titles).toStrictEqual(lessonManager.lessonTitles);
});

test('next function provides LessonPresenter constructed with index', () => {
  const presenter = new ChapterPresenter();
  const index = 6;
  return presenter.config.next(index).then((next) => {
    expect(LessonPresenter).toHaveBeenCalledWith(index);
    expect(next).toBeInstanceOf(LessonPresenter);
  });
});

test('previous function returns BookPresenter called with index 0', () => {
  const presenter = new ChapterPresenter(0);
  return presenter.config.previous().then((prev) => {
    expect(prev).toBeInstanceOf(BookPresenter);
    expect(BookPresenter).toHaveBeenCalledWith(0);
  });
});
