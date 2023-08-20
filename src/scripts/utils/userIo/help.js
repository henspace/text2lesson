/**
 * @file Add help button
 *
 * @module utils/userIo/help
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

import { ManagedElement } from './managedElement.js';
import { icons } from './icons.js';
import { Urls } from '../../data/urls.js';

/**
 * Icon only help button which launches external help.
 */
export class HelpButton extends ManagedElement {
  /**
   * Create the button.
   */
  constructor() {
    super('button', 'help-button');
    this.classList.add('icon-only-button');
    icons.applyIconToElement(icons.help, this, { hideText: true });
    this.listenToOwnEvent('click', 'HELP');
  }

  /**
   * @override
   */
  handleClickEvent(eventIgnored, eventIdIgnored) {
    const presenter = document.querySelector('.Presenter');
    console.debug(`Help triggered from ${presenter?.className}`); // this could be used for context sensitive help.
    window.open(Urls.HELP, '_blank');
  }

  /**
   * Create the help button and append to the container.
   * @param {Element | ManagedElement} container
   * @returns {ManagedElement}
   */
  static createInside(container) {
    const button = new HelpButton(container);
    button.appendTo(container);
    return button;
  }
}
