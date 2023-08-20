/**
 * @file list presenter
 *
 * @module lessons/presenters/listPresenter
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

/**
 * Class that creates a simple list presenter
 * @extends module:lessons/presenters/presenter.Presenter
 */

export class ListPresenter extends Presenter {
  /**
   * Construct simple list presenter
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    super(config, 'ul');
    this.#buildContent();
  }

  /**
   * Build the presenter content.
   * If the config includes the `previous` function, a back button is automatically
   * added at the end.
   * @private
   */
  #buildContent() {
    this.config?.titles?.forEach((title, index) => {
      const itemElement = new ManagedElement('li', this.config.itemClassName);
      itemElement.setAttribute('tabindex', '0');
      itemElement.classList.add('selectable');
      this.presentation.appendChild(itemElement);
      itemElement.innerHTML = title;
      this.listenToEventOn('click', itemElement, index);
    });

    if (this.config?.factory?.hasPrevious(this)) {
      this.showBackButton();
    }
  }
}
