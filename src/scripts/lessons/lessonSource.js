/**
 * @file Convert plain text
 * {@link module:lessons/lessonSource~LessonSourceRawText} to a
 * {@link LessonSource} instance.
 *
 * @module lessons/lessonSource
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

/**
 * Text used for defining lessons. See {@tutorial writingLessons}.
 * @typedef {string} LessonSourceRawText
 */

import { TextItem } from './textItem.js';
import { Metadata } from './metadata.js';
import { Problem } from './problem.js';
import { Lesson } from './lesson.js';
import { ProblemSource } from './problemSource.js';
/**
 * Keys for splitting the problem source into parts. All keys are lowerCase.
 */
export const ProblemItemKey = {
  INTRO: 'i',
  QUESTION: '?',
  RIGHT_ANSWER: '=',
  WRONG_ANSWER: 'x',
  EXPLANATION: '&',
  QUESTION_BREAK: '_',
};

/**
 * Class encapsulating the source text use to define the problems that comprise
 * a lesson.
 */
export class LessonSource {
  static #isConstructing = false;
  /**
   * Lesson metadata
   */
  #metaSource;
  /**
   * Question blocks in the lesson
   */
  #problemSources;

  /**
   * Construct a lesson.
   */
  constructor() {
    if (!LessonSource.#isConstructing) {
      throw new Error('Private constructor. Use createFromSource');
    }
    this.#problemSources = [];
  }

  /**
   * Set the metaSource
   * @param {string} value
   */
  set metaSource(value) {
    this.#metaSource = value;
  }

  /**
   * @returns {string}
   */
  get metaSource() {
    return this.#metaSource;
  }

  /**
   * Get the problem defs
   * @returns {ProblemSource[]}
   */
  get problemSources() {
    return this.#problemSources;
  }
  /**
   * Create a new LessonSource.
   * Break the source into a collection of {@link ProblemSource} objects.
   * @param {LessonSourceRawText} source
   * @return {LessonSource}
   */
  static createFromSource(source) {
    LessonSource.#isConstructing = true;
    const lessonSource = new LessonSource();
    LessonSource.#isConstructing = false;
    const lines = source.split(/\r\n|\n/);
    let currentItemKey = null;
    let problemSource = lessonSource.createProblemSource();
    let data = '';

    lines.forEach((line) => {
      const details = lessonSource.getLineDetails(line);
      if (!details.key) {
        data += `${details.content}\n`;
      } else {
        lessonSource.addDataToProblemSource(
          problemSource,
          currentItemKey,
          data
        );

        data = details.content ? `${details.content}\n` : '';
        if (
          lessonSource.isNewProblem(currentItemKey, details.key, problemSource)
        ) {
          problemSource = lessonSource.createProblemSource();
        }
        currentItemKey = details.key;
      }
    });
    if (data) {
      lessonSource.addDataToProblemSource(problemSource, currentItemKey, data);
    }
    return lessonSource;
  }

  /**
   * Test to see if the key represents a new question block.
   * Keys for INTRO or QUESTION result in new question blocks if they've already
   * been fulfilled.
   * If the last key was a QUESTION_BREAK, any key creates a new question.
   * @param {QuestionItemKey} lastKey - last key that was in use/
   * @param {QuestionItemKey} newKey - the new key.
   * @param {ProblemSource} currentProblem - the current problem.
   * @returns {boolean}
   */
  isNewProblem(lastKey, newKey, currentProblem) {
    if (lastKey === ProblemItemKey.QUESTION_BREAK) {
      return true;
    }
    switch (newKey) {
      case ProblemItemKey.INTRO:
        return !!currentProblem.introSource;
      case ProblemItemKey.QUESTION:
        return !!currentProblem.questionSource;
    }
    return false;
  }
  /**
   * Add data to the appropriate part of the {@link Problem} based
   * on the state. If the itemType is not defined, the data is added as metadata
   * to the lesson.
   * @param {ProblemSource} problem
   * @param {QUESTION_ITEM_TYPE} itemType
   * @param {string} data
   *
   */
  addDataToProblemSource(problem, itemType, data) {
    switch (itemType) {
      case ProblemItemKey.INTRO:
        problem.introSource = data;
        break;
      case ProblemItemKey.QUESTION:
        problem.questionSource = data;
        break;
      case ProblemItemKey.RIGHT_ANSWER:
        problem.addRightAnswerSource(data);
        break;
      case ProblemItemKey.WRONG_ANSWER:
        problem.addWrongAnswerSource(data);
        break;
      case ProblemItemKey.EXPLANATION:
        problem.explanationSource = data;
        break;
      case ProblemItemKey.QUESTION_BREAK:
        break;
      default:
        this.metaSource = data;
    }
  }

  /**
   * Create a new {@link ProblemSource} and append to internal array.
   * @returns {ProblemSource}
   */
  createProblemSource() {
    const block = new ProblemSource();
    this.problemSources.push(block);
    return block;
  }

  /**
   * Get the key and content that follows the key for the line.
   * If there is no key found, the entire line is returned in the content and
   * key is undefined.
   * A key line can be preceded by up to 3 -, #, _ or space characters. It then comprises the
   * key character, i?=x+& or _, optionallycontained within () brackets. The brackets can
   * be repeated and the key character can be repeated. This allows the author
   * to use more visually prominent key lines if preferred.
   * The content does not include the line terminator.
   * @param {string} line
   * @returns {{key:QuestionItemKey, content:string}}
   */
  getLineDetails(line) {
    // @ToDo remove comment.  const match = line.match(/^ {0,3}(?:\(+([i?=x+#])\1*\)+)(.*)$/i);
    const match = line.match(/^[-#_* ]{0,3}(?:\(*([i?=xX&_])\1*[_) ]+)(.*)$/);

    if (!match) {
      return { key: undefined, content: line };
    }
    return { key: match[1].toLowerCase(), content: match[2] ?? '' };
  }

  /**
   * Converts the lesson source to a `Lesson`
   * @returns {module:lessons/lesson.Lesson}
   */
  convertToLesson() {
    const lesson = new Lesson();
    lesson.metadata = Metadata.createFromSource(this.metaSource);
    this.problemSources.forEach((problemSource) => {
      const problem = new Problem();
      problem.intro = TextItem.createFromSource(
        problemSource.introSource,
        lesson.metadata
      );
      problem.question = TextItem.createFromSource(
        problemSource.questionSource,
        lesson.metadata
      );
      problem.explanation = TextItem.createFromSource(
        problemSource.explanationSource,
        lesson.metadata
      );
      problem.rightAnswers = problemSource.rightAnswerSources.map((source) =>
        TextItem.createFromSource(source, lesson.metadata)
      );
      problem.wrongAnswers = problemSource.wrongAnswerSources.map((source) =>
        TextItem.createFromSource(source, lesson.metadata)
      );
      lesson.addProblem(problem);
    });
    return lesson;
  }
}
