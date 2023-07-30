/**
 * @file Test for lesson presenter
 *
 * @module lessons/presenters/lessonPresenter.test
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
import { CachedLesson } from '../cachedLesson.js';
import { Lesson } from '../lesson.js';

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
      loadCurrentLesson: jest.fn(() => {
        return Promise.resolve(new CachedLesson({}, 'title: test lesson'));
      }),
    },
  };
});

jest.unstable_mockModule('./problemPresenter.js', () => {
  return {
    ProblemPresenter: jest.fn((indexIgnored, lessonIgnored) => null),
  };
});

jest.unstable_mockModule('./chapterPresenter.js', () => {
  return {
    ChapterPresenter: jest.fn((indexIgnored) => null),
  };
});

const { lessonManager } = await import('../lessonManager.js');
const { ChapterPresenter } = await import('./chapterPresenter.js');
const { ProblemPresenter } = await import('./problemPresenter.js');
const { LessonPresenter } = await import('./lessonPresenter');

test('constructor provides base class with class name of lessonPresenter.', () => {
  const presenter = new LessonPresenter();
  expect(presenter.className).toBe('lessonPresenter');
});

test('constructor provides base class with lesson info titles.', () => {
  const presenter = new LessonPresenter();
  expect(presenter.config.titles).toHaveLength(4);
  expect(presenter.config.titles[0]).toBe(currentLessonInfo.titles.library);
  expect(presenter.config.titles[1]).toBe(currentLessonInfo.titles.book);
  expect(presenter.config.titles[2]).toBe(currentLessonInfo.titles.chapter);
  expect(presenter.config.titles[3]).toBe(currentLessonInfo.titles.lesson);
});

test('next function provides LessonPresenter constructed index of 0 and with lesson created from loaded lesson', () => {
  const presenter = new LessonPresenter();
  const index = 6;
  const metadataKey = 'testKey';
  const metadataValue = 'testValue';

  lessonManager.loadCurrentLesson.mockReturnValueOnce(
    Promise.resolve(new CachedLesson({}, `${metadataKey}:${metadataValue}`))
  );
  return presenter.config.next(index).then((next) => {
    expect(next).toBeInstanceOf(ProblemPresenter);
    expect(ProblemPresenter.mock.calls[0][0]).toBe(0);
    /** @type{Lesson} */
    const lesson = ProblemPresenter.mock.calls[0][1];
    expect(lesson).toBeInstanceOf(Lesson);
    expect(lesson.metadata.getValue(metadataKey)).toBe(metadataValue);
  });
});

test('previous function returns ChapterPresenter called with index 0', () => {
  const presenter = new LessonPresenter(0);
  return presenter.config.previous().then((prev) => {
    expect(prev).toBeInstanceOf(ChapterPresenter);
    expect(ChapterPresenter).toHaveBeenCalledWith(0);
  });
});
