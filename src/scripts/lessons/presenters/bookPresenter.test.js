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
    },
  };
});

jest.unstable_mockModule('./chapterPresenter.js', () => {
  return {
    ChapterPresenter: jest.fn((indexIgnored) => null),
  };
});

jest.unstable_mockModule('./libraryPresenter.js', () => {
  return {
    LibraryPresenter: jest.fn((indexIgnored) => null),
  };
});
const { LibraryPresenter } = await import('./libraryPresenter.js');

const { ChapterPresenter } = await import('./chapterPresenter.js');
const { lessonManager } = await import('../lessonManager.js');
const { BookPresenter } = await import('./bookPresenter');

test('constructor provides base class with class name of bookPresenter.', () => {
  const presenter = new BookPresenter();
  expect(presenter.className).toBe('bookPresenter');
});

test('constructor provides base class with chapter titles.', () => {
  const presenter = new BookPresenter();
  expect(presenter.config.titles).toStrictEqual(lessonManager.chapterTitles);
});

test('next function provides ChapterPresenter constructed with index', () => {
  const presenter = new BookPresenter();
  const index = 6;
  return presenter.config.next(index).then((next) => {
    expect(ChapterPresenter).toHaveBeenCalledWith(index);
    expect(next).toBeInstanceOf(ChapterPresenter);
  });
});

test('previous function returns LibraryPresenter', () => {
  const presenter = new BookPresenter(0);
  return presenter.config.previous().then((prev) => {
    expect(prev).toBeInstanceOf(LibraryPresenter);
  });
});
