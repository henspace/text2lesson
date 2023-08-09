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

import { Presenter, PREVIOUS_ID } from './presenter.js';
import { icons } from '../../utils/userIo/icons.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';

/**
 * Class that creates a simple list presenter
 * @extends module:lessons/presenters/presenter.Presenter
 */

export class ListPresenter extends Presenter {
  #list;

  /**
   * Construct simple list presenter
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    super(config, 'div');
    this.#buildContent();
  }

  /**
   * Get the list managed element.
   * @returns {module:utils/userIo/managedElement.ManagedElement}
   */
  get listManagedElement() {
    return this.#list;
  }
  /**
   * Build the presenter content.
   * If the config includes the `previous` function, a back button is automatically
   * added at the end.
   * @private
   */
  #buildContent() {
    this.#list = new ManagedElement('ul');
    this.config?.titles?.forEach((title, index) => {
      const itemElement = new ManagedElement('li', this.config.itemClassName);
      itemElement.setAttribute('tabindex', '0');
      itemElement.classList.add('selectable');
      //this.appendChild(itemElement);
      this.#list.appendChild(itemElement);
      itemElement.element.textContent = title;
      this.listenToEventOn('click', itemElement, index);
    });

    this.appendChild(this.#list);
    if (this.config?.factory?.hasPrevious(this)) {
      this.#appendBackButton();
    }
  }

  /**
   * Append a backbutton.
   * @private
   */
  #appendBackButton() {
    const backElement = new ManagedElement('button', 'backNavigation');
    this.appendChild(backElement);
    icons.applyIconToElement(icons.back, backElement.element);
    this.listenToEventOn('click', backElement, PREVIOUS_ID);
  }
}
