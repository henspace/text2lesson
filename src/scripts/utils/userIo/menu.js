/**
 * @file Menu io.
 * This module appends the menu HTML to the `body` element of the the document.
 * This is effectively a Singleton with the application containing one menu
 * which is always present.
 *
 * @module utils/userIo/menu
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

import { ManagedElement } from '../userIo/managedElement.js';
import { icons } from './icons.js';
import { focusManager } from './focusManager.js';
import { ArrayIndexer } from '../arrayIndexer.js';

/**
 * @type {Element}
 */
let menuIconOpen;

/**
 * @type {Element}
 */
let menuContent;

/**
 * Definition of a menu item.
 * @typedef {Object} MenuItemDefinition
 * @property {string} text - the text displayed in the menu.
 * @property {string} itemClass - name of an item class. This will be prefixed by
 * .utils-li-marker-' and is used to set additional styling.
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
  menuIconOpen = document.createElement('button');
  menuIconOpen.setAttribute('aria-haspopup', true);
  icons.applyIconToElement(icons.openMenu, menuIconOpen, { hideText: true });
  menuIconOpen.classList.add('utils-menu-icon-open', 'icon-only-button');

  const menuTitleBar = document.createElement('div');
  menuTitleBar.classList.add('utils-menu-title');

  menuContent = document.createElement('div');
  menuContent.classList.add('utils-menu-content');
  menuContent.style.visibility = 'hidden';
  menuContent.addEventListener('focusout', (event) => {
    if (!menuContent.contains(event.relatedTarget)) {
      // hideMenuItems();
    }
  });

  document.body.insertBefore(
    menuContent,
    document.getElementById('modal-mask').nextSibling
  );
  document.getElementById('action-buttons').appendChild(menuIconOpen);

  const menuItemsElement = document.createElement('ul');
  menuItemsElement.classList.add('container', 'utils-menu-items');
  menuItemsElement.setAttribute('aria-role', 'menu');
  menuContent.appendChild(menuTitleBar);
  menuContent.appendChild(menuItemsElement);

  menuIconOpen.addEventListener('click', () => {
    showMenuItems();
  });
}

/**
 * Show the menu items.
 */
function showMenuItems() {
  menuItems.resetNavigation();
  menuIconOpen.style.visibility = 'hidden';
  menuContent.classList.add('modal');
  menuContent.style.visibility = 'visible';
  menuContent.style.transform = 'translateX(0)';
  menuContent.querySelector('li').focus();
}

/**
 * Hide the menu items.
 */
function hideMenuItems() {
  menuIconOpen.style.visibility = 'visible';
  menuContent.style.transform = 'translateX(-100%)';
  menuContent.style.visibility = 'hidden';
  menuContent.classList.remove('modal');
  focusManager.findBestFocus();
}

/**
 * Element to encapsulate a menu item.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
class MenuItem extends ManagedElement {
  /**
   * @param {string} label - inner HTML for the item.
   * @param {string} itemClass - name of styling class. This will be automatically
   * prefixed by .utils-li-marker-';
   */
  constructor(label, itemClass) {
    super('li', 'utils-menu-item');
    this.textContent = label;
    this.classList.add('selectable');
    if (itemClass) {
      this.classList.add(`utils-li-marker-${itemClass}`);
    }
    this.setAttributes({
      'aria-role': 'menuitem',
      tabindex: '-1',
    });
  }
}

/**
 * Class to encapsulate the list of MenuItem objects that make up the full
 * menu. The function {@link createMenuHtml} must have been called first to
 * ensure the required html structure is in place.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
class MenuItems extends ManagedElement {
  static CLOSE_EVENT_ID = 'close';

  /**
   * @type {module:utils/arrayIndexer.ArrayIndexer}
   */
  #navigator;
  /**
   * @type{Element}
   */
  #menuIconClose;
  /**
   * Construct the menu
   */
  constructor() {
    const parent = document.querySelector('.utils-menu-items');
    if (!parent) {
      throw 'Html structure not in place. createMenuHtml should have been called.';
    }
    super(parent);
    this.setAttributes({
      'aria-role': 'menu',
    });
    this.menuDefinition = null;
    this.#menuIconClose = new ManagedElement('button');
    icons.applyIconToElement(icons.closeMenu, this.#menuIconClose, {
      hideText: true,
    });
    this.#menuIconClose.classList.add(
      'utils-menu-icon-close',
      'icon-only-button'
    );
    document
      .querySelector('.utils-menu-title')
      .appendChild(this.#menuIconClose.element);
    this.listenToEventOn(
      'keydown',
      this.#menuIconClose,
      MenuItems.CLOSE_EVENT_ID
    );
    this.listenToEventOn(
      'click',
      this.#menuIconClose,
      MenuItems.CLOSE_EVENT_ID
    );
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
    const commandItems = [this.#menuIconClose];
    this.menuDefinition.forEach((menuDef, index) => {
      let item;
      if (menuDef.command) {
        item = new MenuItem(menuDef.text, menuDef.itemClass);
        this.listenToEventOn('click', item, index);
        this.listenToEventOn('keydown', item, index);
        commandItems.push(item);
      } else {
        item = new ManagedElement('hr');
      }
      this.appendChild(item);
      this.#navigator = new ArrayIndexer(commandItems);
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
    if (isNaN(index)) {
      return;
    }
    console.debug(`Handling event ${event.type} with id ${eventId}`);
    this.menuDefinition[index].command.execute().then((value) => {
      console.debug(`Finished handling menu option ${value}.`);
    });
  }

  /**
   * Handle key down event to allow up and down arrows to navigate list.
   * @param {Event} event
   * @param {string} eventId
   */
  handleKeydownEvent(event, eventId) {
    const index = parseInt(eventId);
    console.debug(`Key ${event.key} down for index ${index}`);
    switch (event.key) {
      case 'Tab':
        if (event.shiftKey) {
          this.#navigator.decrement().focus();
        } else {
          this.#navigator.increment().focus();
        }
        event.preventDefault();
        break;
      case 'Escape':
        hideMenuItems();
        break;
      case ' ':
      case 'Enter':
        this.handleClickEvent(event, eventId);
        break;
    }
  }

  resetNavigation() {
    this.#navigator.reset();
    this.#navigator.increment().focus(); // this is because the first item is the close button but we start on the first menu item.
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
