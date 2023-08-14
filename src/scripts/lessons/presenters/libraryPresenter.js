/**
 * @file Present a library on the stage.
 *
 * @module lessons/presenters/libraryPresenter
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
import { lessonManager } from '../lessonManager.js';
import { ListPresenter } from './listPresenter.js';

/**
 * Class to present a library.
 * Presentation of a library involves displaying all of the books available in
 * the library.
 * @extends module:lessons/presenters/listPresenter.ListPresenter
 */
export class LibraryPresenter extends ListPresenter {
  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = lessonManager.bookTitles;
    config.itemClassName = 'book';
    super(config);
    this.#buildPreamble();
    this.setupKeyboardNavigation();
  }

  /**
   * Set up the preamble
   */
  #buildPreamble() {
    this.addPreamble(
      `<span class='library-title'>${lessonManager.libraryTitle}</span>`
    );
  }
  /**
   * @override
   */
  next(index) {
    lessonManager.bookIndex = index;
    return super.next(index);
  }
}
