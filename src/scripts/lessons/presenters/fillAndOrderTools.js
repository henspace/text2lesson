/**
 * @file Utilities shared by fill and order problem presenters
 *
 * @module lessons/presenters/fillAndOrderTools
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

import { ManagedElement } from '../../utils/userIo/managedElement.js';

/**
 * Removes the select control from its parent and replaces it with two span
 * elements containing the given answer and expected answer.
 * @param {ManagedElement} selectControl
 * @param {string} givenAnswer
 * @param {string} expectedAnswer
 */
export function replaceSelectControl(
  selectControl,
  givenAnswer,
  expectedAnswer
) {
  const container = selectControl.parentElement;
  selectControl.remove();
  const givenElement = new ManagedElement('span', 'given-answer');
  const givenElementTextElement = new ManagedElement(
    'span',
    'given-answer-text'
  );
  givenElementTextElement.textContent = givenAnswer;
  givenElement.appendChild(givenElementTextElement);
  const expectedElement = new ManagedElement('span', 'expected-answer');
  expectedElement.textContent = expectedAnswer;
  container.appendChild(givenElement.element);
  container.appendChild(expectedElement.element);
}
