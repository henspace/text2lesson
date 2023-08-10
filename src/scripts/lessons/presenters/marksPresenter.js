/**
 * @file Present the marks
 *
 * @module lessons/presenters/marksPresenter
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

import { Presenter } from './presenter.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { MarkState } from '../itemMarker.js';

export class MarksPresenter extends Presenter {
  constructor(config) {
    super(config);
    this.#buildContent();
  }

  /**
   * Build the results content.
   */
  #buildContent() {
    const marks = this.config.lesson.marks;
    const heading = new ManagedElement('h2');
    heading.innerHTML = `Correct: ${marks.correct}; Incorrect: ${marks.incorrect}; skipped: ${marks.skipped}`;
    this.presentation.appendChild(heading);

    const answers = new ManagedElement('ul');
    marks.markedItems.forEach((markedItem) => {
      const li = new ManagedElement('li');
      li.innerHTML = `${markedItem.item.question.plainText}`;
      li.classList.add(this.#getClassForMarkState(markedItem.state));
      answers.appendChild(li);
    });
    this.presentation.appendChild(answers);
    this.showNextButton();
  }

  /**
   * Get a suitable class name for the state.
   * @param {module:lessons/markState.MarkState.MarkState} state
   */
  #getClassForMarkState(state) {
    switch (state) {
      case MarkState.CORRECT:
        return 'correct';
      case MarkState.INCORRECT:
        return 'incorrect';
      case MarkState.SKIPPED:
        return 'skipped';
    }
    return 'unknown-state';
  }
}
