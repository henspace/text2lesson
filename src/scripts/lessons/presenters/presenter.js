/**
 * @file Abstract presenter.
 *
 * @module libs\utils\userIo\presenter
 *
 * @license GPL-3.0-or-later
 * : create quizzes and lessons from plain text files.
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

import { ManagedElement } from '../../libs/utils/dom/managedElement.js';

/**
 * Base presenter class. This creates a stage if it does not already exist.
 */
export class Presenter {
  static #STAGE_ID = 'presenter-stage';
  /**
   * @type {ManagedElement}
   */
  static #stage;

  /**
   * Construct the presenter and create the stage element if necessary.
   */
  constructor() {
    if (!document.getElementById(Presenter.#STAGE_ID)) {
      Presenter.#stage = new ManagedElement('div', 'stage');
      Presenter.#stage.id = Presenter.#STAGE_ID;
      Presenter.#stage.appendTo(document.body);
    }
  }

  /**
   * Present the data.
   * This merely writes the html to the stage. It is expected that this
   * will be overridden.
   * @param {string} html
   */
  present(html) {
    Presenter.#stage.element.innerHTML = html;
  }
}
