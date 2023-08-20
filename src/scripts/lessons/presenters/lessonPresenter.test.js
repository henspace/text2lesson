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
        return Promise.resolve({ content: 'cachedLesson' });
      },
    },
  };
});

const mockLessonConverter = jest.fn(() => new MockLesson());

const MockLessonSource = function (source) {
  this.source = source;
  this.convertToLesson = mockLessonConverter;
};

const MockLesson = jest.fn(() => {});

jest.unstable_mockModule('../lessonSource.js', () => {
  return {
    LessonSource: {
      createFromSource: jest.fn((rawSource) => new MockLessonSource(rawSource)),
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
const { LessonSource } = await import('../lessonSource.js');
const { LessonPresenter } = await import('./lessonPresenter.js');

beforeEach(() => {
  jest.clearAllMocks();
  //presenterFactory.hasPrevious.mockClear();
  //presenterFactory.getNext.mockClear();
  //presenterFactory.getPrevious.mockClear();
});

test('next function provides presenter from presenterFactory constructed with config', async () => {
  const config = {
    factory: presenterFactory,
  };
  const lessonPresenter = new LessonPresenter(config);
  const index = 6;
  const next = await lessonPresenter.next(index);
  expect(next).toBeInstanceOf(MockPresenter);
  expect(presenterFactory.getNext).toBeCalledTimes(1);
  expect(presenterFactory.getPrevious).toBeCalledTimes(0);
  let expectedConfig = { ...lessonPresenter.config };
  expect(presenterFactory.getNext.mock.calls[0][0]).toBe(lessonPresenter);
  expect(presenterFactory.getNext.mock.calls[0][1]).toEqual(expectedConfig);
});

test('next function provides presenterFactory constructed with config containing a lesson', async () => {
  const config = {
    factory: presenterFactory,
  };
  const lessonPresenter = new LessonPresenter(config);
  const index = 6;
  const next = await lessonPresenter.next(index);
  expect(next).toBeInstanceOf(MockPresenter);
  expect(presenterFactory.getNext).toBeCalledTimes(1);
  expect(presenterFactory.getPrevious).toBeCalledTimes(0);
  let expectedConfig = { ...lessonPresenter.config };
  expect(presenterFactory.getNext.mock.calls[0][0]).toBe(lessonPresenter);
  expect(presenterFactory.getNext.mock.calls[0][1]).toEqual(expectedConfig);
  expect(LessonSource.createFromSource).toHaveBeenCalledWith('cachedLesson');
  expect(mockLessonConverter).toBeCalledTimes(1);
});

test('previous function provides presenter from presenterFactory constructed with config', () => {
  const config = {
    factory: presenterFactory,
  };
  const lessonPresenter = new LessonPresenter(config);
  const index = 6;
  const next = lessonPresenter.previous(index);
  expect(next).toBeInstanceOf(MockPresenter);
  expect(presenterFactory.getNext).toBeCalledTimes(0);
  expect(presenterFactory.getPrevious).toBeCalledTimes(1);
  let expectedConfig = { ...lessonPresenter.config };
  expect(presenterFactory.getPrevious.mock.calls[0][0]).toBe(lessonPresenter);
  expect(presenterFactory.getPrevious.mock.calls[0][1]).toEqual(expectedConfig);
});
