/**
 * @file Test the lesson class
 *
 * @module lessons/problem.test
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

import { Problem, QuestionType } from './problem.js';
import { LessonSource } from './lessonSource.js';
import { TextItem } from './textItem.js';
import { test, expect } from '@jest/globals';

test('get and set intro access property', () => {
  const problem = new Problem();
  const item = TextItem.createFromSource('Test string');
  expect(problem.intro).toBeUndefined();
  problem.intro = item;
  expect(problem.intro).toStrictEqual(item);
});

test('get and set question access property', () => {
  const problem = new Problem();
  const item = TextItem.createFromSource('Test string');
  expect(problem.question).toBeUndefined();
  problem.question = item;
  expect(problem.question).toStrictEqual(item);
});

test('get and set explanation access property', () => {
  const problem = new Problem();
  const item = TextItem.createFromSource('Test string');
  expect(problem.explanation).toBeUndefined();
  problem.explanation = item;
  expect(problem.explanation).toStrictEqual(item);
});

test('get and set right answers access property', () => {
  const problem = new Problem();
  expect(problem.rightAnswers).toBeUndefined();
  const data = [
    TextItem.createFromSource('Test string 1'),
    TextItem.createFromSource('Test string 2'),
    TextItem.createFromSource('Test string 3'),
  ];
  problem.rightAnswers = data;
  expect(problem.rightAnswers).toStrictEqual(data);
});

test('get and set wrong answers access property', () => {
  const problem = new Problem();
  expect(problem.wrongAnswers).toBeUndefined();
  const data = [
    TextItem.createFromSource('Test string 1'),
    TextItem.createFromSource('Test string 2'),
    TextItem.createFromSource('Test string 3'),
  ];
  problem.wrongAnswers = data;
  expect(problem.wrongAnswers).toStrictEqual(data);
});

test('Question type defaults to SLIDE', () => {
  const problem = new Problem();
  expect(problem.questionType).toBe(QuestionType.SLIDE);
});

test('Question type defaults to SLIDE if no question set', () => {
  const problem = new Problem();
  problem.rightAnswers = ['Test'];
  problem.wrongAnswers = ['Test'];
  expect(problem.questionType).toBe(QuestionType.SLIDE);
});

test('Simple question identified correctly.', () => {
  const source = `
  (?)A question with one correct answer
  (=)This is correct
  (x)wrong
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.SIMPLE);
});

test('Multi question identified correctly.', () => {
  const source = `
  (?)A question with more than one correct answer
  (=)This is correct
  (=)And this is correct
  (x)wrong
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.MULTI);
});

test('Simple question identified correctly.', () => {
  const source = `
  (?)A question with one correct answer
  (=)This is correct
  (x)wrong
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.SIMPLE);
});

test('Fill question identified correctly.', () => {
  const source = `
  (?)Some missing words with content ...one ...two blanks
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.FILL);
});

test('Order question identified correctly.', () => {
  const source = `
  (?)One missing words with no content at the end 123
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.ORDER);
});

test('Slide identified correctly if no question', () => {
  const source = `
  (i)Intro
  (=)right answer
  (x)wrong
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.SLIDE);
});

test('Slide identified correctly if just intro', () => {
  const source = `
  (i)Intro
  `;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.problems).toHaveLength(1);
  expect(lesson.problems[0].questionType).toBe(QuestionType.SLIDE);
});

test('Extract firstWordsOfRightAnswers extracts correctly', () => {
  const problem = new Problem();
  const data = [
    TextItem.createFromSource('WordOne Test string 1'),
    TextItem.createFromSource('WordTwo string 2'),
    TextItem.createFromSource('WordThree string 3'),
  ];
  const firstWords = ['WordOne', 'WordTwo', 'WordThree'];

  problem.rightAnswers = data;
  expect(problem.firstWordsOfRightAnswers).toStrictEqual(firstWords);
});

test('Extract firstWordsOfWrongAnswers extracts correctly', () => {
  const problem = new Problem();
  const data = [
    TextItem.createFromSource('WordOne Test string 1'),
    TextItem.createFromSource('WordTwo string 2'),
    TextItem.createFromSource('WordThree string 3'),
  ];
  const firstWords = ['WordOne', 'WordTwo', 'WordThree'];

  problem.wrongAnswers = data;
  expect(problem.firstWordsOfWrongAnswers).toStrictEqual(firstWords);
});
