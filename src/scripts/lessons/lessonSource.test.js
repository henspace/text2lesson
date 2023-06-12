/**
 * @file Test for lessons
 * @module lessons/lessonSource.test
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

import { LessonSource, ProblemItemKey } from './lessonSource.js';
import { Metadata } from './metadata.js';
import { test, expect } from '@jest/globals';

test('Key lines allow up to 3 preceding spaces', () => {
  const lesson = LessonSource.createFromSource(' ');
  let spaces = '';
  for (let n = 0; n < 4; n++) {
    expect(lesson.getLineDetails(`${spaces}(i)this is the data`)).toStrictEqual(
      {
        key: ProblemItemKey.INTRO,
        content: 'this is the data',
      }
    );
    spaces += ' ';
  }
  expect(lesson.getLineDetails(`${spaces}(i)this is the data`)).toStrictEqual({
    key: undefined,
    content: `${spaces}(i)this is the data`,
  });
});

test('Key lines allow multiple brackets', () => {
  const lesson = LessonSource.createFromSource(' ');
  let openBrackets = '(';
  let closeBrackets = ')';
  for (let n = 0; n < 10; n++) {
    expect(
      lesson.getLineDetails(
        `${openBrackets}(i)${closeBrackets}this is the data`
      )
    ).toStrictEqual({
      key: ProblemItemKey.INTRO,
      content: 'this is the data',
    });
    openBrackets += '(';
    closeBrackets += '))'; // mismatched
  }
});

test('Key lines allow multiple key characters', () => {
  const lesson = LessonSource.createFromSource(' ');
  let keyChr = 'i';
  for (let n = 0; n < 10; n++) {
    expect(lesson.getLineDetails(`(${keyChr})this is the data`)).toStrictEqual({
      key: ProblemItemKey.INTRO,
      content: 'this is the data',
    });
    keyChr += 'i';
  }
});

test('MetaSource details extracted with content', () => {
  const lesson = LessonSource.createFromSource(' ');
  expect(lesson.getLineDetails('this is the meta data')).toStrictEqual({
    key: undefined,
    content: 'this is the meta data',
  });
});

test('InfoSource details extracted with content', () => {
  const lesson = LessonSource.createFromSource(' ');
  expect(lesson.getLineDetails('(i)this is the data')).toStrictEqual({
    key: ProblemItemKey.INTRO,
    content: 'this is the data',
  });
});

test('QuestionSource details extracted with content', () => {
  const lesson = LessonSource.createFromSource(' ');
  expect(lesson.getLineDetails('(?)this is the data')).toStrictEqual({
    key: ProblemItemKey.QUESTION,
    content: 'this is the data',
  });
});

test('ExplanationSource details extracted with content', () => {
  const lesson = LessonSource.createFromSource(' ');
  expect(lesson.getLineDetails('(+)this is the data')).toStrictEqual({
    key: ProblemItemKey.EXPLANATION,
    content: 'this is the data',
  });
});

test('Source broken down correctly into ProblemSource parts', () => {
  const source = `This is the meta data
containing multiple lines
of text.
(i)This is the intro
containing multiple lines
of text.
(?)This is the question
containing multiple lines
of text.
(=)This is the correct answer
containing multiple lines
of text.
(=)And another correct answer.
(=)And one more correct answer.
(x)This is an incorrect answer
containing multiple lines
of text.
(x)And another incorrect answer.
(x)And one more incorrect answer.
(+)This is the explanation
containing multiple lines
of text.`;
  const lesson = LessonSource.createFromSource(source);
  expect(lesson.problemSources).toHaveLength(1);
  expect(lesson.problemSources[0].rightAnswerSources).toHaveLength(3);
  expect(lesson.problemSources[0].wrongAnswerSources).toHaveLength(3);

  expect(lesson.metaSource).toBe(
    'This is the meta data\ncontaining multiple lines\nof text.\n'
  );

  expect(lesson.problemSources[0].introSource).toBe(
    'This is the intro\ncontaining multiple lines\nof text.\n'
  );

  expect(lesson.problemSources[0].questionSource).toBe(
    'This is the question\ncontaining multiple lines\nof text.\n'
  );

  expect(lesson.problemSources[0].rightAnswerSources[0]).toBe(
    'This is the correct answer\ncontaining multiple lines\nof text.\n'
  );
  expect(lesson.problemSources[0].rightAnswerSources[1]).toBe(
    'And another correct answer.\n'
  );
  expect(lesson.problemSources[0].rightAnswerSources[2]).toBe(
    'And one more correct answer.\n'
  );

  expect(lesson.problemSources[0].wrongAnswerSources[0]).toBe(
    'This is an incorrect answer\ncontaining multiple lines\nof text.\n'
  );
  expect(lesson.problemSources[0].wrongAnswerSources[1]).toBe(
    'And another incorrect answer.\n'
  );
  expect(lesson.problemSources[0].wrongAnswerSources[2]).toBe(
    'And one more incorrect answer.\n'
  );

  expect(lesson.problemSources[0].explanationSource).toBe(
    'This is the explanation\ncontaining multiple lines\nof text.\n'
  );
});

test('New introSource part creates second ProblemSource', () => {
  const source = `(i)intro
(?)question
(=)correct answer
(x)incorrect answer
(+)explanation
(i)intro2`;
  const lesson = LessonSource.createFromSource(source);
  expect(lesson.problemSources).toHaveLength(2);
  expect(lesson.problemSources[0].introSource).toBe('intro\n');
  expect(lesson.problemSources[1].introSource).toBe('intro2\n');
});

test('New questionSource part creates second question block', () => {
  const source = `(i)intro
(?)question
(=)correct answer
(x)incorrect answer
(+)explanation
(?)question2`;
  const lesson = LessonSource.createFromSource(source);
  expect(lesson.problemSources).toHaveLength(2);
  expect(lesson.problemSources[0].introSource).toBe('intro\n');
  expect(lesson.problemSources[0].questionSource).toBe('question\n');
  expect(lesson.problemSources[1].introSource).toBe('');
  expect(lesson.problemSources[1].questionSource).toBe('question2\n');
});

test('LessonSource constructor throws exception if called directly.', () => {
  expect(() => new LessonSource()).toThrowError(/Private constructor/i);
});

test('converts to Lesson successfully', () => {
  const source = `lesson metadata
(i)intro1
(?)question1
(=)correct answer1.1
(=)correct answer1.2
(x)incorrect answer1.1
(x)incorrect answer1.2
(+)explanation1
(i)intro2
(?)question2
(=)correct answer2.1
(=)correct answer2.2
(x)incorrect answer2.1
(x)incorrect answer2.2
(+)explanation2
(i)intro3
(?)question3
(=)correct answer3.1
(=)correct answer3.2
(x)incorrect answer3.1
(x)incorrect answer3.2
(+)explanation3
(i)intro4
(?)question4
(=)correct answer4.1
(=)correct answer4.2
(x)incorrect answer4.1
(x)incorrect answer4.2
(+)explanation4`;
  const lessonSource = LessonSource.createFromSource(source);
  const lesson = lessonSource.convertToLesson();
  expect(lesson.metadata).toStrictEqual(
    Metadata.createFromSource('lesson metadata')
  );
  expect(lesson.problems).toHaveLength(4);
  lesson.problems.forEach((value, problemIndex) => {
    expect(value.intro.html).toMatch(`intro${problemIndex + 1}`);
    expect(value.question.html).toMatch(`question${problemIndex + 1}`);
    expect(value.explanation.html).toMatch(`explanation${problemIndex + 1}`);
    expect(value.rightAnswers).toHaveLength(2);
    value.rightAnswers.forEach((value, answerIndex) => {
      expect(value.html).toMatch(
        `correct answer${problemIndex + 1}.${answerIndex + 1}`
      );
    });
    expect(value.wrongAnswers).toHaveLength(2);
    value.wrongAnswers.forEach((value, answerIndex) => {
      expect(value.html).toMatch(
        `incorrect answer${problemIndex + 1}.${answerIndex + 1}`
      );
    });
  });
});
