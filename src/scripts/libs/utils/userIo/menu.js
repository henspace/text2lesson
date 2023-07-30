/**
 * @file Menu io.
 * This module appends the menu HTML to the `body` element of the the document.
 * This is effectively a Singleton with the application containing one menu
 * which is always present.
 *
 * @module libs/utils/userIo/menu
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

import { ManagedElement } from '../dom/managedElement.js';
import { showModalMask, hideModalMask } from './modalMask.js';

/**
 * Definition of a menu item.
 * @typedef {Object} MenuItemDefinition
 * @property {string} text - the text displayed in the menu.
 * @property {module:libs/utils/command/commands#Command} command - command used to action
 * the menu selection.
 * If the command is not defined, the text property is ignored and a separator
 * is added.
 */

/**
 * Create the HTML for the menu.
 * This is added to the `body` element.
 */
function createMenuHtml() {
  const menuIconOpen = document.createElement('div');
  menuIconOpen.className = 'utils-menu utils-menu-icon-open fa-solid fa-bars';

  const menuIconClose = document.createElement('div');
  menuIconClose.className = 'utils-menu utils-menu-icon-close fa-solid fa-bars';

  const menuContent = document.createElement('div');
  menuContent.className = 'utils-menu utils-menu-content';

  document.body.appendChild(menuIconOpen);
  document.body.appendChild(menuContent);
  const menuItemsElement = document.createElement('div');
  menuItemsElement.className = 'utils-menu-items';
  menuContent.appendChild(menuItemsElement);
  menuContent.appendChild(menuIconClose);

  menuIconOpen.addEventListener('click', () => {
    showMenuItems();
  });

  menuIconClose.addEventListener('click', () => {
    hideMenuItems();
  });
}

/**
 * Show the menu items.
 */
function showMenuItems() {
  const content = document.querySelector('.utils-menu-content');
  content.style.transform = 'translateX(0)';
  showModalMask();
}

/**
 * Hide the menu items.
 */
function hideMenuItems() {
  const content = document.querySelector('.utils-menu-content');
  content.style.transform = 'translateX(-100%)';
  hideModalMask();
}

/**
 * Element to encapsulate a menu item.
 */
class MenuItem extends ManagedElement {
  /**
   * @param {string} label - inner HTML for the item.
   */
  constructor(label) {
    super('div');
    this.element.textContent = label;
  }
}

/**
 * Class to encapsulate the list of MenuItem objects that make up the full
 * menu. The function {@link createMenuHtml} must have been called first to
 * ensure the required html structure is in place.
 */
class MenuItems extends ManagedElement {
  constructor() {
    const parent = document.querySelector('.utils-menu-items');
    if (!parent) {
      throw 'Html structure not in place. createMenuHtml should have been called.';
    }
    super(parent);
    this.menuDefinition = null;
  }

  /**
   * Build the menu from the menu definition.
   * @param {MenuItemDefinition[]} menuDefinition
   */
  setMenuItems(menuDefinition) {
    if (this.menuDefinition) {
      this.remove();
    }
    this.menuDefinition = menuDefinition;
    this.menuDefinition.forEach((menuDef, index) => {
      let item;
      if (menuDef.command) {
        item = new MenuItem(menuDef.text);
        item.element.className = 'utils-menu-item';
        this.listenToEventOn('click', item, index);
      } else {
        item = new ManagedElement('hr');
      }
      this.appendChild(item);
    });
  }

  /**
   * Handle click on menu option
   * @param {Event} event
   * @param {string} eventId
   */
  handleClickEvent(event, eventId) {
    hideMenuItems();
    const index = parseInt(eventId);
    console.debug(`Handling event ${event.type} with id ${eventId}`);
    this.menuDefinition[index].command.execute().then((value) => {
      console.debug(`Finished handling menu option ${value}.`);
    });
  }
}

/**
 * Set the items for the menu.
 * @param {MenuItemDefinition[]} items
 */
export function setMenuItems(items) {
  menuItems.setMenuItems(items);
}

/**
 * Create the HTML including the menu items.
 *
 */
createMenuHtml();

/**
 * @type{MenuItems} - The items that comprise the menu.
 */
const menuItems = new MenuItems();
