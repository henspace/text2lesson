/**
 * @file StageManager. Responsible for switching Presenters on the stage.
 *
 * @module lessons/presenters/stageManager
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
 * Class to manage movement between Presenters.
 */
export class StageManager {
  /**
   * Main stage element.
   * @type {module:utils/userIo/managedElement.ManagedElement}
   */
  #stage;

  /**
   * Prepare the stage
   * @param {Element} stageElement
   */
  constructor(stageElement) {
    this.#stage = new ManagedElement(stageElement);
  }

  /**
   * Start the stage show using the provided presenter. If the presenter fulfils
   * to another presenter, the show continues.
   * @param {module:lessons/presenters/presenter.Presenter} presenter - the presenter that starts the show.
   * @returns {undefined}  The method returns when a presenter is null.
   */
  async startShow(presenter) {
    this.#stage.removeChildren();
    for (;;) {
      presenter = await presenter.presentOnStage(this.#stage);
      this.#stage.removeChildren();
      if (presenter === null) {
        return;
      }
    }
  }
}
