/**
 * @file The `Problem` class.
 *
 * @module lessons/problem
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
 * Question types.
 * @enum {string}
 */
export const QuestionType = {
  SIMPLE: 'simple',
  MULTI: 'multi',
  FILL: 'fill',
  ORDER: 'order',
  SLIDE: 'slide',
};

/**
 * Decoded problem.
 */
export class Problem {
  /**
   * @type {module:lessons/textItem-parser~TextItem}
   */
  #intro;

  /**
   * @type {module:lessons/textItem-parser~TextItem}
   */
  #question;

  /**
   * @type {module:lessons/textItem-parser~TextItem}
   */
  #explanation;

  /**
   * @type {module:lessons/textItem-parser~TextItem[]}
   */
  #rightAnswers;

  /**
   * @type {module:lessons/textItem-parser~TextItem[]}
   */
  #wrongAnswers;

  /**
   * @type {QuestionType}
   */
  #questionType = QuestionType.SLIDE;

  /**
   * Construct `Problem`.
   */
  constructor() {}

  /**
   * Get the intro
   * @returns {module:lessons/textItem-parser~TextItem}
   */
  get intro() {
    return this.#intro;
  }

  /**
   * Set the intro
   * @param {module:lessons/textItem-parser~TextItem} value
   */
  set intro(value) {
    this.#intro = value;
  }

  /**
   * Get the question
   * @returns {module:lessons/textItem-parser~TextItem}
   */
  get question() {
    return this.#question;
  }

  /**
   * Set the question
   * @param {module:lessons/textItem-parser~TextItem} value
   */
  set question(value) {
    this.#question = value;
    this.#deriveQuestionType();
  }

  /**
   * Get the explanation
   * @returns {module:lessons/textItem-parser~TextItem}
   */
  get explanation() {
    return this.#explanation;
  }

  /**
   * Set the explanation
   * @param {module:lessons/textItem-parser~TextItem} value
   */
  set explanation(value) {
    this.#explanation = value;
  }

  /**
   * Get the rightAnswers
   * @returns {module:lessons/textItem-parser~TextItem[]}
   */
  get rightAnswers() {
    return this.#rightAnswers;
  }

  /**
   * Set the rightAnswers
   * @param {module:lessons/textItem-parser~TextItem[]} value
   */
  set rightAnswers(value) {
    this.#rightAnswers = value;
    this.#deriveQuestionType();
  }

  /**
   * Get the wrongAnswers
   * @returns {module:lessons/textItem-parser~TextItem[]}
   */
  get wrongAnswers() {
    return this.#wrongAnswers;
  }

  /**
   * Get the first words from the wrong answers.
   * @returns {string[]}
   */
  get firstWordsOfWrongAnswers() {
    return this.#extractFirstWords(this.wrongAnswers);
  }
  /**
   * Get the first words from the wrong answers.
   * @returns {string[]}
   */
  get firstWordsOfRightAnswers() {
    return this.#extractFirstWords(this.rightAnswers);
  }

  /**
   * Extract the first word from
   * @param {module:lessons/textItem-parser~TextItem} data
   * @returns {string[]}
   */
  #extractFirstWords(data) {
    const words = [];
    data.forEach((textItem) => {
      words.push(textItem.firstWord);
    });
    return words;
  }

  /**
   * Set the wrongAnswers
   * @param {module:lessons/textItem-parser~TextItem[]} value
   */
  set wrongAnswers(value) {
    this.#wrongAnswers = value;
    this.#deriveQuestionType();
  }

  /**
   * Get the question type
   */
  get questionType() {
    return this.#questionType;
  }

  /**
   * Derive the type of question.
   *
   * The program supports six question types. The type is automatically derived
   * from the question type,
   *
   * +simple: a multiple choice question with just one correct answer.
   * +multi: a multiple choice question where the user can select more than one
   * correct answer.
   * +fill: a fill the blank question. Users have a selection of words which
   * they must select to fill in the blanks in the question. This type is
   * created if the question has an array of missing words which are not blank.
   * Any wrong answers are added as red herrings. Note that only the first word
   * of any wrong answer is used. If right answers have also been added, they
   * are ignored. Note that if the question has one missing word with no content
   * at the end, this is taken as the trigger to add an extra answer line at the
   * end and this becomes an *order* question.
   * +order: a select the answers in the correct order question. Users have a
   * selection of words which they must select in the correct order. Any wrong
   * answers that have been defined are treated as red herrings. This is similar
   * to the fill question, but with the correct selections being added to a
   * separate answer line rather than being inserted into blanks in the
   * question. This type is created if there is a single missing word (...) at
   * the end with no content.
   * +slide: there is no question to answer. The user can just continue when
   * ready. This is the default if the question does not fall into any of the
   * other categories.
   */
  #deriveQuestionType() {
    if (!this.#question?.html) {
      return QuestionType.SLIDE;
    }
    if (this.#isOrderQuestion()) {
      this.#questionType = QuestionType.ORDER;
    } else if (this.#isFillQuestion()) {
      this.#questionType = QuestionType.FILL;
    } else if (this.#isMultiQuestion()) {
      this.#questionType = QuestionType.MULTI;
    } else if (this.#isSimpleQuestion()) {
      this.#questionType = QuestionType.SIMPLE;
    } else {
      this.#questionType = QuestionType.SLIDE;
    }
  }

  /**
   * Return true if this is a multiple choice question with one correct answers.
   * This means there is just one right answer. Callers must check that
   * the question is not an order or fill question first.
   * @returns {true}
   */
  #isSimpleQuestion() {
    return this.#rightAnswers ? this.#rightAnswers.length === 1 : false;
  }

  /**
   * Return true if this is a multiple choice question with multiple answers.
   * This means there is more that one right answer. Callers must check that
   * the question is not an order or fill question first.
   * @returns {true}
   */
  #isMultiQuestion() {
    return this.#rightAnswers ? this.#rightAnswers.length > 1 : false;
  }

  /**
   * Return true if the question is a fill type.
   * This means that the question contains missing words, each containing
   * content.
   * @returns {boolean}
   */
  #isFillQuestion() {
    if (this.#question.missingWords.length === 0) {
      return false;
    }
    for (const content of this.#question.missingWords) {
      if (!content) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return true if the question is an *order*.
   * This means there is just one missing word in the question, positioned at
   * the very end and with no content.
   * @returns {boolean}
   */
  #isOrderQuestion() {
    const missingAtEnd = this.#question.html.match(
      /<span +class *= *"missing-word".*?><\/span>(?:\s*<\/p>\s*)*$/
    );
    return (
      missingAtEnd &&
      this.#question.missingWords.length === 1 &&
      !this.#question.missingWords[0]
    );
  }
}
