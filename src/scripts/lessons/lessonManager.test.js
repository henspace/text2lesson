/**
 * @file Test the lesson manager.
 *
 * @module lessons/lessonManager.test
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
import { jest, test, expect, beforeAll } from '@jest/globals';

jest.unstable_mockModule('../libs/utils/jsonUtils/json.js', () => ({
  fetchJson: jest.fn(() => {
    console.log('Mocking fetch');
    return Promise.reject(new Error('response needs to be set.'));
  }),
  fetchText: jest.fn(() =>
    Promise.resolve(new Error('response needs to be set.'))
  ),
}));

const json = await import('../libs/utils/jsonUtils/json.js');
const lessonManager = await import('./lessonManager.js');

const libraries = {
  L1: { title: 'titleL1', file: 'fileL1.json' },
  L2: { title: 'titleL2', file: 'fileL2.json' },
};

const libraryContents = {
  L1: [
    {
      title: 'titleL1B1',
      location: 'locationL1B1/',
      chapters: [
        {
          title: 'titleL1B1C1',
          lessons: [
            { title: 'titleL1B1C1L1', file: 'fileL1B1C1L1.json' },
            { title: 'titleL1B1C1L2', file: 'fileL1B1C1L2.json' },
          ],
        },
        {
          title: 'titleL1B1C2',
          lessons: [
            { title: 'titleL1B1C2L1', file: 'fileL1B1C2L1.json' },
            { title: 'titleL1B1C2L2', file: 'fileL1B1C2L2.json' },
          ],
        },
      ],
    },
    {
      title: 'titleL1B2',
      location: 'locationL1B2/',
      chapters: [
        {
          title: 'titleL1B2C1',
          lessons: [
            { title: 'titleL1B2C1L1', file: 'fileL1B2C1L1.json' },
            { title: 'titleL1B2C1L2', file: 'fileL1B2C1L2.json' },
          ],
        },
        {
          title: 'titleL1B2C2',
          lessons: [
            { title: 'titleL1B2C2L1', file: 'fileL1B2C2L1.json' },
            { title: 'titleL1B2C2L2', file: 'fileL1B2C2L2.json' },
          ],
        },
      ],
    },
  ],

  L2: [
    {
      title: 'titleL2B1',
      location: 'locationL1B1/',
      chapters: [
        {
          title: 'titleL2B1C1',
          lessons: [
            { title: 'titleL2B1C1L1', file: 'fileL2B1C1L1.json' },
            { title: 'titleL2B1C1L2', file: 'fileL2B1C1L2.json' },
          ],
        },
        {
          title: 'titleL2B1C2',
          lessons: [
            { title: 'titleL2B1C2L1', file: 'fileL2B1C2L1.json' },
            { title: 'titleL2B1C2L2', file: 'fileL2B1C2L2.json' },
          ],
        },
      ],
    },
    {
      title: 'titleL2B2',
      location: 'locationL1B2/',
      chapters: [
        {
          title: 'titleL2B2C1',
          lessons: [
            { title: 'titleL2B2C1L1', file: 'fileL2B2C1L1.json' },
            { title: 'titleL2B2C1L2', file: 'fileL2B2C1L2.json' },
          ],
        },
        {
          title: 'titleL2B2C2',
          lessons: [
            { title: 'titleL2B2C2L1', file: 'fileL2B2C2L1.json' },
            { title: 'titleL2B2C2L2', file: 'fileL2B2C2L2.json' },
          ],
        },
      ],
    },
  ],
};

beforeAll(() => {
  console.log('before all');
  json.fetchJson.mockReturnValueOnce(Promise.resolve(libraries));
  return lessonManager.loadLibraries('somefile.json').then(() => {
    const promises = [];
    for (const libraryKey in libraries) {
      json.fetchJson.mockReturnValueOnce(
        Promise.resolve(libraryContents[libraryKey])
      );
      promises.push(lessonManager.setCurrentLibrary(libraryKey));
    }
    return Promise.all(promises);
  });
});

test('formUrlForLessons creates url based on currentBookIndex, currentChapterIndex and currentLessonIndex', () => {
  for (const libraryKey in libraries) {
    lessonManager.setCurrentLibrary(libraryKey);
    const library = libraryContents[libraryKey];
    library.forEach((book, bookIndex) => {
      lessonManager.setBookIndex(bookIndex);
      book.chapters.forEach((chapter, chapterIndex) => {
        lessonManager.setChapterIndex(chapterIndex);
        chapter.lessons.forEach((lesson, lessonIndex) => {
          lessonManager.setLessonIndex(lessonIndex);
          const url = lessonManager.formUrlForLessonIndex(
            bookIndex,
            chapterIndex,
            lessonIndex
          );
          const file =
            library[bookIndex].chapters[chapterIndex].lessons[lessonIndex].file;
          const location = library[bookIndex].location;
          const expectedUrl = `${location}${file}`;
          expect(url).toEqual(expectedUrl);
        });
      });
    });
  }
});

test('loadCurrentLesson loads lesson from json', () => {
  expect(false).toBeTruthy(); /**@todo */
});

test('setLibraries correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('getBookTitles correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('getChapterTitles correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('getLibraryOptions correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('loadCurrentLesson correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('setBookIndex correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('setChapterIndex correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('setCurrentLibrary correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('setLessonIndex correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});

test('setLibraries correctly ...', () => {
  expect(false).toBeTruthy(); /** @todo */
});
