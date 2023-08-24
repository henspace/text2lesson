/**
 * @file Test localLibrary
 *
 * @module lessons/localLibrary.test
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

import { beforeEach, jest, test, expect } from '@jest/globals';

const mockStorage = new Map();

jest.unstable_mockModule('../utils/userIo/storage.js', () => {
  return {
    persistentData: {
      saveToStorage: jest.fn((key, value) => mockStorage.set(key, value)),
      getFromStorage: jest.fn((key, defValue) => {
        return mockStorage.has(key) ? mockStorage.get(key) : defValue;
      }),
      removeFromStorage: jest.fn((key) => mockStorage.delete(key)),
    },
  };
});

const { LocalLibrary } = await import('./localLibrary.js');
const { persistentData } = await import('../utils/userIo/storage.js');

beforeEach(() => {
  jest.clearAllMocks();
  mockStorage.clear();
});

test('Get key returns LOCAL_LIBRARY', () => {
  const localLibrary = new LocalLibrary();
  expect(localLibrary.key).toBe('LOCAL_LIBRARY');
});

test('Get info returns default library content', () => {
  const localLibrary = new LocalLibrary();
  const info = localLibrary.info;
  const books = info.contentLoader();
  expect(books).toHaveLength(1);
  expect(books[0].chapters).toHaveLength(1);
  expect(books[0].chapters[0].lessons).toHaveLength(4);
  books[0].chapters[0].lessons.forEach((value, index) => {
    expect(value.title).toBe('Untitled lesson');
  });
});

test('saveLocalLessonAtIndex updates storage with lesson data.', () => {
  const localLibrary = new LocalLibrary();
  for (let index = 0; index < 4; index++) {
    const testData = `TEST DATA ${index}`;
    localLibrary.saveLocalLessonAtIndex(index, testData);
    const key = `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${index}`;
    expect(mockStorage.get(key)).toBe(testData);
  }
});

test('deleteLessonAtIndex remove storage and updates indexes', () => {
  const localLibrary = new LocalLibrary();
  for (let index = 0; index < 4; index++) {
    const testData = {
      title: `test title ${index}`,
      contentLoader: () => 'test content',
    };
    localLibrary.saveLocalLessonAtIndex(index, testData);
    const key = `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${index}`;
    expect(mockStorage.get(key)).toBe(testData);
  }
  const indexToRemove = 2;
  localLibrary.deleteLessonAtIndex(indexToRemove);
  const key = `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${indexToRemove}`;
  expect(mockStorage.get(key)).toBeUndefined();
  const info = localLibrary.info;
  const books = info.contentLoader();
  expect(books[0].chapters[0].lessons).toHaveLength(3);

  books[0].chapters[0].lessons.forEach((value, index) => {
    if (index < indexToRemove) {
      expect(value.title).toBe(`test title ${index}`);
    } else {
      expect(value.title).toBe(`test title ${index + 1}`);
    }
  });
});

test('addNewLessonSlot add a new storage key', () => {
  const localLibrary = new LocalLibrary();
  for (let index = 0; index < 4; index++) {
    const testData = {
      title: `test title ${index}`,
      contentLoader: () => 'test content',
    };
    localLibrary.saveLocalLessonAtIndex(index, testData);
    const key = `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${index}`;
    expect(mockStorage.get(key)).toBe(testData);
  }
  localLibrary.addNewLessonSlot();
  const info = localLibrary.info;
  const books = info.contentLoader();
  expect(books[0].chapters[0].lessons).toHaveLength(5);
  books[0].chapters[0].lessons.forEach((value, index) => {
    if (index < 4) {
      expect(value.title).toBe(`test title ${index}`);
    } else {
      expect(value.title).toBe(`Untitled lesson`);
    }
  });
});

test('addNewLessonSlot reuses missing key', () => {
  const localLibrary = new LocalLibrary();
  for (let index = 0; index < 4; index++) {
    const testData = {
      title: `test title ${index}`,
      contentLoader: () => 'test content',
    };
    localLibrary.saveLocalLessonAtIndex(index, testData);
    const key = `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${index}`;
    expect(mockStorage.get(key)).toBe(testData);
  }
  const indexToRemove = 2;
  localLibrary.deleteLessonAtIndex(indexToRemove);
  localLibrary.addNewLessonSlot();
  const info = localLibrary.info;
  const books = info.contentLoader();
  expect(books[0].chapters[0].lessons).toHaveLength(4);

  const expectedKeys = [0, 1, 3, 2]; // note 2 was reused.
  books[0].chapters[0].lessons.forEach((value, index) => {
    const testData = `Test data ${index}`;
    localLibrary.saveLocalLessonAtIndex(index, testData);
    const key = expectedKeys[index];
    const storageKey = `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${key}`;
    expect(mockStorage.get(storageKey)).toBe(`Test data ${index}`);
  });
});
