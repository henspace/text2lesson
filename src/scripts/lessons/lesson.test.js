/**
 * @file Test the lesson class
 *
 * @module lessons/lesson.test
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
 */

import { Lesson } from './lesson.js';
import { MarkState } from './itemMarker.js';
import { Problem } from './problem.js';
import { test, expect } from '@jest/globals';

test('metadata set and get access metadata property', () => {
  const metadata = 'test string';
  const lesson = new Lesson();
  expect(lesson.metadata).toBeUndefined();
  lesson.metadata = metadata;
  expect(lesson.metadata).toBe(metadata);
});

test('addProblem adds to array of problems.', () => {
  const lesson = new Lesson();
  for (let n = 0; n < 4; n++) {
    const problem = new Problem();
    problem.intro = `intro${n}`;
    lesson.addProblem(problem);
  }
  const problems = lesson.problems;
  expect(problems).toHaveLength(4);
  problems.forEach((value, index) => {
    expect(value.intro).toBe(`intro${index}`);
  });
});

test('problem index starts at problem zero', () => {
  const lesson = new Lesson();
  const testProblems = [];
  for (let n = 0; n < 4; n++) {
    const problem = new Problem();
    problem.intro = `intro${n}`;
    lesson.addProblem(problem);
    testProblems.push(problem);
  }
  expect(lesson.getNextProblem()).toBe(testProblems[0]);
});

test('getNextProblem traverses problems and returns null when no more', () => {
  const lesson = new Lesson();
  const testProblems = [];
  for (let n = 0; n < 4; n++) {
    const problem = new Problem();
    problem.intro = `intro${n}`;
    lesson.addProblem(problem);
    testProblems.push(problem);
  }
  testProblems.forEach((value) => {
    expect(lesson.getNextProblem()).toBe(value);
  });
  expect(lesson.getNextProblem()).toBeNull();
});

test('restart sets index back to zero', () => {
  const lesson = new Lesson();
  const testProblems = [];
  for (let n = 0; n < 4; n++) {
    const problem = new Problem();
    problem.intro = `intro${n}`;
    lesson.addProblem(problem);
    testProblems.push(problem);
  }
  lesson.getNextProblem();
  lesson.getNextProblem();
  lesson.restart();
  expect(lesson.getNextProblem()).toBe(testProblems[0]);
});

test('hasMoreProblems checks to see if there are more questions', () => {
  const lesson = new Lesson();
  const testProblems = [];
  for (let n = 0; n < 4; n++) {
    const problem = new Problem();
    problem.intro = `intro${n}`;
    lesson.addProblem(problem);
    testProblems.push(problem);
  }
  for (let index = 0; index < testProblems.length; index++) {
    expect(lesson.hasMoreProblems).toBe(true);
    lesson.getNextProblem();
  }
  expect(lesson.hasMoreProblems).toBe(false);
});

test('isEmpty returns false if there is a problem in the lesson with an intro', () => {
  const lesson = new Lesson();
  const problem = new Problem();
  problem.intro = { html: 'intro' };
  lesson.addProblem(problem);
  expect(lesson.isEmpty).toBe(false);
});

test('isEmpty returns false if there is a problem in the lesson with a question', () => {
  const lesson = new Lesson();
  const problem = new Problem();
  problem.question = { html: 'intro', missingWords: [] };
  lesson.addProblem(problem);
  expect(lesson.isEmpty).toBe(false);
});

test('isEmpty returns false if there is a problem in the lesson with an intro and a question', () => {
  const lesson = new Lesson();
  const problem = new Problem();
  problem.intro = { html: 'intro' };
  problem.question = { html: 'intro', missingWords: [] };
  lesson.addProblem(problem);
  expect(lesson.isEmpty).toBe(false);
});

test('isEmpty returns true if there is no problem in the lesson', () => {
  const lesson = new Lesson();
  expect(lesson.isEmpty).toBe(true);
});

test('isEmpty returns true if there is a problem in the lesson with no intro and no question', () => {
  const lesson = new Lesson();
  const problem = new Problem();
  lesson.addProblem(problem);
  expect(lesson.isEmpty).toBe(true);
});

test('markProblem adjusts marks', () => {
  const lesson = new Lesson();
  expect(lesson.marks).toStrictEqual({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    markedItems: [],
  });
  const markedProblems = [
    { state: MarkState.CORRECT, item: { value: 'test1' } },
    { state: MarkState.INCORRECT, item: { value: 'test2' } },
    { state: MarkState.INCORRECT, item: { value: 'test3' } },
    { state: MarkState.SKIPPED, item: { value: 'test4' } },
    { state: MarkState.SKIPPED, item: { value: 'test5' } },
    { state: MarkState.SKIPPED, item: { value: 'test6' } },
  ];
  markedProblems.forEach((data) => {
    lesson.markProblem(data.item, data.state);
  });
  const marks = lesson.marks;
  expect(marks.markedItems).toHaveLength(markedProblems.length);
  expect(marks.correct).toEqual(1);
  expect(marks.incorrect).toEqual(2);
  expect(marks.skipped).toEqual(3);
  markedProblems.forEach((data, index) => {
    expect(marks.markedItems[index].state).toEqual(data.state);
    expect(marks.markedItems[index].item).toEqual(data.item);
  });
});
