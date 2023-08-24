/**
 * @file Set up the headers and footers
 *
 * @module setHeadersAndFooters
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
import { HelpButton } from './utils/userIo/help.js';
import { Menu } from './utils/userIo/menu.js';
import { BuildInfo } from './data/constants.js';
import { ManagedElement } from './utils/userIo/managedElement.js';

/**
 * Class representing the header
 */
class Header {
  /**
   * Construct
   */
  constructor() {}
  /**
   * Set up the header.
   * @param {module:utils/userIo/menu~MenuItemDefinition[]} menuItems
   */
  setup(menuItems) {
    const titleElement = document.getElementById('title-bar');
    if (!titleElement) {
      console.error('Cannot find element with id of "title-bar".');
      return;
    }

    if (titleElement.children?.length > 0) {
      console.error('Second attempt made to setup title bar ignored.');
      return;
    }
    const headerTextContainer = document.createElement('span');
    headerTextContainer.innerHTML = BuildInfo.getProductName();

    const helpButtonContainer = document.createElement('span');
    HelpButton.createInside(helpButtonContainer);

    const menu = new Menu();
    menu.setMenuItems(menuItems);
    titleElement.appendChild(menu.element);
    titleElement.appendChild(headerTextContainer);
    titleElement.appendChild(helpButtonContainer);
  }
}

/**
 * Class representing the footer.
 */
class Footer {
  /**
   * @type{module:utils/userIo/managedElement.ManagedElement}
   */
  #buttonBar;

  /**
   * Create the footer.
   */
  constructor() {}

  /**
   * Get the button bar.
   */
  get buttonBar() {
    return this.#buttonBar;
  }
  /**
   * Set up the footer.
   */
  setup() {
    const footerElement = document.getElementById('footer');
    if (!footerElement) {
      console.error('Cannot find element with id of "footer".');
      return;
    }

    if (footerElement.children?.length > 0) {
      console.error('Second attempt made to setup footer ignored.');
      return;
    }
    this.#buttonBar = new ManagedElement('div', 'button-bar');
    footerElement.appendChild(this.#buttonBar.element);

    const footerTextContainer = document.createElement('div');
    footerTextContainer.className = 'footer-text';

    const devTag =
      BuildInfo.getMode().toUpperCase() !== 'PRODUCTION'
        ? `[${BuildInfo.getMode()}]`
        : '';

    footerTextContainer.innerHTML = `${BuildInfo.getProductName()} ${BuildInfo.getVersion()}${devTag} ${BuildInfo.getBuildDate()}`;

    footerElement.appendChild(footerTextContainer);
  }
}

export const footer = new Footer();
export const header = new Header();

/**
 * Set up the headers and footers. The header includes a help button.
 * @param {module:utils/userIo/menu~MenuItemDefinition[]} menuItems
 */
export function setHeaderAndFooter(menuItems) {
  header.setup(menuItems);
  footer.setup();
}
