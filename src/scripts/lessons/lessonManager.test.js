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

import { CachedLesson } from './cachedLesson.js';
import { jest, test, expect, beforeAll, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../utils/jsonUtils/json.js', () => ({
  fetchJson: jest.fn(() => {
    console.log('Mocking fetch');
    return Promise.reject(new Error('response needs to be set.'));
  }),
  fetchText: jest.fn(() =>
    Promise.reject(new Error('response needs to be set.'))
  ),
}));

const json = await import('../utils/jsonUtils/json.js');
const { lessonManager } = await import('./lessonManager.js');

const libraries = {
  L1: { title: '<p>titleL1', file: 'fileL1.json' },
  L2: { title: '<p>titleL2', file: 'fileL2.json' },
};

const libraryContents = {
  L1: [
    {
      title: '<p>titleL1B1',
      location: 'locationL1B1/',
      chapters: [
        {
          title: '<p>titleL1B1C1',
          lessons: [
            { title: '<p>titleL1B1C1L1', file: 'fileL1B1C1L1.json' },
            { title: '<p>titleL1B1C1L2', file: 'fileL1B1C1L2.json' },
          ],
        },
        {
          title: '<p>titleL1B1C2',
          lessons: [
            { title: '<p>titleL1B1C2L1', file: 'fileL1B1C2L1.json' },
            { title: '<p>titleL1B1C2L2', file: 'fileL1B1C2L2.json' },
          ],
        },
      ],
    },
    {
      title: '<p>titleL1B2',
      location: 'locationL1B2/',
      chapters: [
        {
          title: '<p>titleL1B2C1',
          lessons: [
            { title: '<p>titleL1B2C1L1', file: 'fileL1B2C1L1.json' },
            { title: '<p>titleL1B2C1L2', file: 'fileL1B2C1L2.json' },
          ],
        },
        {
          title: '<p>titleL1B2C2',
          lessons: [
            { title: '<p>titleL1B2C2L1', file: 'fileL1B2C2L1.json' },
            { title: '<p>titleL1B2C2L2', file: 'fileL1B2C2L2.json' },
          ],
        },
      ],
    },
  ],

  L2: [
    {
      title: '<p>titleL2B1',
      location: 'locationL1B1/',
      chapters: [
        {
          title: '<p>titleL2B1C1',
          lessons: [
            { title: '<p>titleL2B1C1L1', file: 'fileL2B1C1L1.json' },
            { title: '<p>titleL2B1C1L2', file: 'fileL2B1C1L2.json' },
          ],
        },
        {
          title: '<p>titleL2B1C2',
          lessons: [
            { title: '<p>titleL2B1C2L1', file: 'fileL2B1C2L1.json' },
            { title: '<p>titleL2B1C2L2', file: 'fileL2B1C2L2.json' },
          ],
        },
      ],
    },
    {
      title: '<p>titleL2B2',
      location: 'locationL1B2/',
      chapters: [
        {
          title: '<p>titleL2B2C1',
          lessons: [
            { title: '<p>titleL2B2C1L1', file: 'fileL2B2C1L1.json' },
            { title: '<p>titleL2B2C1L2', file: 'fileL2B2C1L2.json' },
          ],
        },
        {
          title: '<p>titleL2B2C2',
          lessons: [
            { title: '<p>titleL2B2C2L1', file: 'fileL2B2C2L1.json' },
            { title: '<p>titleL2B2C2L2', file: 'fileL2B2C2L2.json' },
          ],
        },
      ],
    },
  ],
};

beforeAll(() => {
  console.log('before all');
  json.fetchJson.mockReturnValueOnce(Promise.resolve(libraries));
  return lessonManager.loadLibraries('somefile.json').then(async (count) => {
    expect(count).toBe(Object.keys(libraries).length);
    for (const libraryKey in libraries) {
      lessonManager.libraryKey = libraryKey;
      json.fetchJson.mockReturnValueOnce(
        Promise.resolve(libraryContents[libraryKey])
      );
      await lessonManager.loadCurrentLibrary();
    }
    return true;
  });
});

beforeEach(() => {
  json.fetchJson.mockReset();
  json.fetchText.mockReset();
});

/**
 * @typedef {Object} TestLessonDetails
 * @property {module:lessons/lessonManager~LibraryDetails} library,
 * @property {string} libraryKey,
 * @property {module:lessons/lessonManager~BookDetails} book
 * @property {number} bookIndex
 * @property {module:lessons/lessonManager~ChapterDetails} chapter
 * @property {number} chapterIndex
 * @property {module:lessons/lessonManager~LessonDetails} lesson
 * @property {number} lessonIndex
 */

/**
 * Loops through every lesson in the all the libraries calling the operation.
 * @param {function(TestLessonDetails)} operation
 */
async function iterateLibraries(operation) {
  for (const libraryKey in libraries) {
    lessonManager.libraryKey = libraryKey;
    const library = libraryContents[libraryKey];
    library.forEach((book, bookIndex) => {
      lessonManager.bookIndex = bookIndex;
      book.chapters.forEach((chapter, chapterIndex) => {
        lessonManager.chapterIndex = chapterIndex;
        chapter.lessons.forEach(async (lesson, lessonIndex) => {
          lessonManager.lessonIndex = lessonIndex;
          await operation({
            library: library,
            libraryKey: libraryKey,
            book: book,
            bookIndex: bookIndex,
            chapter: chapter,
            chapterIndex: chapterIndex,
            lesson: lesson,
            lessonIndex: lessonIndex,
          });
        });
      });
    });
  }
}

test('All titles are escaped', () => {
  /* Because of the way the lessonManager creates its maps, the original data gets
   * modified. As such we can currently just check the libraries and libraryContent */
  for (const key in libraries) {
    expect(libraries[key].title).toMatch('&lt;p');
  }
  for (const key in libraryContents) {
    libraryContents[key].forEach((book) => {
      expect(book.title).toMatch('&lt;p');
      book.chapters.forEach((chapter) => {
        expect(chapter.title).toMatch('&lt;p');
        chapter.lessons.forEach((lesson) => {
          expect(lesson.title).toMatch('&lt;p');
        });
      });
    });
  }
});

test('formUrlForLesson creates url based on currentBookIndex, currentChapterIndex and currentLessonIndex', async () => {
  return iterateLibraries(async (testDetails) => {
    const url = lessonManager.formUrlForLesson();
    const file =
      testDetails.library[testDetails.bookIndex].chapters[
        testDetails.chapterIndex
      ].lessons[testDetails.lessonIndex].file;
    const location = testDetails.library[testDetails.bookIndex].location;
    const expectedUrl = `${location}${file}`;
    expect(url).toEqual(expectedUrl);
  });
});

test('loadCurrentLesson loads lesson from json. Tests multiple methods.', async () => {
  return iterateLibraries(async (testDetails) => {
    const expectedText = `${testDetails.libraryKey}-${testDetails.bookIndex}-${testDetails.chapterIndex}-${testDetails.lessonIndex}`;
    const expectedUrl = lessonManager.formUrlForLesson();
    const expectedLesson = new CachedLesson(
      {
        libraryKey: testDetails.libraryKey,
        file: testDetails.lesson.file,
        url: expectedUrl,
        indexes: {
          book: testDetails.bookIndex,
          chapter: testDetails.chapterIndex,
          lesson: testDetails.lessonIndex,
        },
        titles: {
          library: libraries[testDetails.libraryKey].title,
          book: testDetails.book.title,
          chapter: testDetails.chapter.title,
          lesson: testDetails.lesson.title,
        },
      },
      expectedText
    );

    const callIndex = json.fetchText.mock.calls.length;
    json.fetchText.mockReturnValueOnce(Promise.resolve(expectedText));
    await lessonManager.loadCurrentLesson().then((lesson) => {
      expect(json.fetchText.mock.calls[callIndex][0]).toBe(expectedUrl);
      expect(lesson).toStrictEqual(expectedLesson);
    });
  });
});

test('loadCurrentLesson loads lesson from cache if already loaded.', async () => {
  const libraryKey = 'L1';
  const bookIndex = 1;
  const chapterIndex = 0;
  const lessonIndex = 1;

  const testDetails = {
    libraryKey: libraryKey,
    bookIndex: bookIndex,
    chapterIndex: chapterIndex,
    lessonIndex: lessonIndex,
    book: libraryContents[libraryKey][bookIndex],
    chapter: libraryContents[libraryKey][bookIndex].chapters[chapterIndex],
    lesson:
      libraryContents[libraryKey][bookIndex].chapters[chapterIndex].lessons[
        lessonIndex
      ],
  };

  lessonManager.libraryKey = testDetails.libraryKey;
  lessonManager.bookIndex = testDetails.bookIndex;
  lessonManager.chapterIndex = testDetails.chapterIndex;
  lessonManager.lessonIndex = testDetails.lessonIndex;

  const expectedText = `${testDetails.libraryKey}-${testDetails.bookIndex}-${testDetails.chapterIndex}-${testDetails.lessonIndex}`;
  const expectedUrl = lessonManager.formUrlForLesson();
  const expectedLesson = new CachedLesson(
    {
      libraryKey: testDetails.libraryKey,
      file: testDetails.lesson.file,
      url: expectedUrl,
      indexes: {
        book: testDetails.bookIndex,
        chapter: testDetails.chapterIndex,
        lesson: testDetails.lessonIndex,
      },
      titles: {
        library: libraries[testDetails.libraryKey].title,
        book: testDetails.book.title,
        chapter: testDetails.chapter.title,
        lesson: testDetails.lesson.title,
      },
    },
    expectedText
  );

  const callIndex = json.fetchText.mock.calls.length;
  json.fetchText.mockReturnValueOnce(Promise.resolve(expectedText));
  await lessonManager
    .loadCurrentLesson()
    .then((lesson) => {
      expect(json.fetchText.mock.calls[callIndex][0]).toBe(expectedUrl);
      expect(lesson).toStrictEqual(expectedLesson);
      expect(json.fetchText).toBeCalledTimes(1);
      json.fetchText.mockReturnValueOnce(
        Promise.resolve('garbage - not expected to be called')
      );
    })
    .then(() => lessonManager.loadCurrentLesson())
    .then((lesson) => {
      expect(lesson).toStrictEqual(expectedLesson);
      expect(json.fetchText).toBeCalledTimes(1); // no extra call
    });
});

test('libraryTitles returns map of available titles', () => {
  const options = new Map();
  for (const key in libraries) {
    options.set(key, libraries[key].title);
  }

  expect(lessonManager.libraryTitles).toStrictEqual(options);
});

test('loadLibraries populates libraries from JSON', () => {
  // loadLibraries is called beforeAll. No test required as it is implicitely
  // tested by `getLibraryTitles`.
});

test('set currentLibrary switches library', () => {
  for (const libraryKey in libraries) {
    lessonManager.libraryKey = libraryKey;
    const currentLesson = lessonManager.currentLessonInfo;
    expect(currentLesson.titles.library).toBe(libraries[libraryKey].title);
  }
});

test('set bookIndex switches book', async () => {
  return iterateLibraries(async (testDetails) => {
    lessonManager.libraryKey = testDetails.libraryKey;
    lessonManager.bookIndex = testDetails.bookIndex;
    const currentLesson = lessonManager.currentLessonInfo;
    expect(currentLesson.titles.book).toBe(testDetails.book.title);
  });
});

test('set chapterIndex switches chapter', async () => {
  return iterateLibraries(async (testDetails) => {
    lessonManager.libraryKey = testDetails.libraryKey;
    lessonManager.bookIndex = testDetails.bookIndex;
    lessonManager.shapterIndex = testDetails.chapterIndex;
    const currentLesson = lessonManager.currentLessonInfo;
    expect(currentLesson.titles.chapter).toBe(testDetails.chapter.title);
  });
});

test('set lessonIndex switches lesson', async () => {
  return iterateLibraries(async (testDetails) => {
    lessonManager.libraryKey = testDetails.libraryKey;
    lessonManager.bookIndex = testDetails.bookIndex;
    lessonManager.chapterIndex = testDetails.chapterIndex;
    lessonManager.lessonIndex = testDetails.lessonIndex;
    const currentLesson = lessonManager.currentLessonInfo;
    expect(currentLesson.titles.lesson).toBe(testDetails.lesson.title);
    expect(currentLesson.file).toBe(testDetails.lesson.file);
  });
});

test('invalid book index defaults to book 0.', () => {
  lessonManager.bookIndex = 9999;
  expect(lessonManager.currentLessonInfo.indexes.book).toBe(0);
});

test('bookTitles returns array of book titles', () => {
  for (const libraryKey in libraries) {
    lessonManager.libraryKey = libraryKey;
    const library = libraryContents[libraryKey];
    const titles = [];
    library.forEach((book) => {
      titles.push(book.title);
    });

    expect(lessonManager.bookTitles).toStrictEqual(titles);
  }
});

test('chapterTitles returns array of chapter titles', () => {
  for (const libraryKey in libraries) {
    lessonManager.libraryKey = libraryKey;
    const library = libraryContents[libraryKey];
    library.forEach((book, index) => {
      const titles = [];
      lessonManager.bookIndex = index;
      book.chapters.forEach((chapter) => {
        titles.push(chapter.title);
      });
      expect(lessonManager.chapterTitles).toStrictEqual(titles);
    });
  }
});

test('lessonTitles returns array of lesson titles', () => {
  for (const libraryKey in libraries) {
    lessonManager.libraryKey = libraryKey;
    const library = libraryContents[libraryKey];
    library.forEach((book, index) => {
      lessonManager.bookIndex = index;
      book.chapters.forEach((chapter, chapterIndex) => {
        const titles = [];
        lessonManager.chapterIndex = chapterIndex;
        chapter.lessons.forEach((lesson) => {
          titles.push(lesson.title);
        });
        expect(lessonManager.lessonTitles).toStrictEqual(titles);
      });
    });
  }
});

test('currentLessonInfo provides LessonDetails', async () => {
  return iterateLibraries(async (testDetails) => {
    lessonManager.libraryKey = testDetails.libraryKey;
    lessonManager.bookIndex = testDetails.bookIndex;
    lessonManager.chapterIndex = testDetails.chapterIndex;
    lessonManager.lessonIndex = testDetails.lessonIndex;
    const lessonDetails = lessonManager.currentLessonInfo;

    expect(lessonDetails.indexes.book).toBe(testDetails.bookIndex);
    expect(lessonDetails.indexes.chapter).toBe(testDetails.chapterIndex);
    expect(lessonDetails.indexes.lesson).toBe(testDetails.lessonIndex);

    expect(lessonDetails.libraryKey).toBe(testDetails.libraryKey);
    expect(lessonDetails.file).toBe(testDetails.lesson.file);
    expect(lessonDetails.titles.library).toBe(
      libraries[testDetails.libraryKey].title
    );
    expect(lessonDetails.titles.book).toBe(testDetails.book.title);
    expect(lessonDetails.titles.chapter).toBe(testDetails.chapter.title);
    expect(lessonDetails.titles.lesson).toBe(testDetails.lesson.title);
  });
});
