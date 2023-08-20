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
import { i18n } from './utils/i18n/i18n.js';
import { Menu } from './utils/userIo/menu.js';
import { BuildInfo } from './data/constants.js';

/**
 * Set up the header.
 * @param {module:utils/userIo/menu~MenuItemDefinition[]} menuItems
 */
function setUpTitleBar(menuItems) {
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
  headerTextContainer.innerHTML = i18n`The header`;

  const helpButtonContainer = document.createElement('span');
  HelpButton.createInside(helpButtonContainer);

  const menu = new Menu();
  menu.setMenuItems(menuItems);
  titleElement.appendChild(menu.element);
  titleElement.appendChild(headerTextContainer);
  titleElement.appendChild(helpButtonContainer);
}

/**
 * Set up the footer.
 */
function setUpFooter() {
  const footerElement = document.getElementById('footer');
  if (!footerElement) {
    console.error('Cannot find element with id of "footer".');
    return;
  }

  if (footerElement.children?.length > 0) {
    console.error('Second attempt made to setup footer ignored.');
    return;
  }
  const footerTextContainer = document.createElement('span');
  const devTag =
    BuildInfo.getMode().toUpperCase() !== 'PRODUCTION'
      ? `[${BuildInfo.getMode()}]`
      : '';

  footerTextContainer.innerHTML = `${BuildInfo.getProductName()} ${BuildInfo.getVersion()}${devTag} ${BuildInfo.getBuildDate()}`;

  footerElement.appendChild(footerTextContainer);
}

/**
 * Set up the headers and footers. The header includes a help button.
 * @param {module:utils/userIo/menu~MenuItemDefinition[]} menuItems
 */
export function setTitleBarAndFooter(menuItems) {
  setUpTitleBar(menuItems);
  setUpFooter();
}
