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
import * as modalMask from './modalMask.js';

/**
 * Definition of a menu item.
 * @typedef {Object} MenuItemDefinition
 * @property {module:utils/userIo/icons~IconDetails} iconDetails - the button definition for the menu item.
 * @property {module:libs/utils/command/commands#Command} command - command used to action
 * the menu selection.
 * If the command is not defined, the text property is ignored and a separator
 * is added.
 */

/**
 * Create a managed element for the menu. The element itself is the open button.
 */
export class Menu extends ManagedElement {
  /**
   * @type {Element}
   */
  #menuContent;
  /**
   * @type {MenuItems}
   */
  #menuItems;

  /**
   * create the menu.
   */
  constructor() {
    super('button');
    this.setAttribute('aria-haspopup', true);
    icons.applyIconToElement(icons.openMenu, this, { hideText: true });
    this.classList.add('utils-menu-icon-open', 'icon-only-button');
    this.#createMenuContentHtml();
    this.#menuItems = new MenuItems();
  }

  /**
   * Create the HTML for the menu.
   * The menu added to the `body` element.
   * @param {Element | module:utils/userIo/managedElement.ManagedElement} container
   */
  #createMenuContentHtml() {
    const menuTitleBar = new ManagedElement('div');
    menuTitleBar.classList.add('utils-menu-title');

    this.#menuContent = new ManagedElement('div', 'utils-menu-content');
    this.#menuContent.style.visibility = 'hidden';

    document.body.insertBefore(
      this.#menuContent.element,
      document.getElementById('modal-mask').nextSibling
    );

    const menuItemsElement = new ManagedElement('div');
    menuItemsElement.classList.add('container', 'utils-menu-items');
    menuItemsElement.setAttribute('aria-role', 'menu');
    this.#menuContent.appendChild(menuTitleBar);
    this.#menuContent.appendChild(menuItemsElement);
    this.listenToOwnEvent('click', 'OPEN');
    this.listenToEventOn('click', this.#menuContent, 'CONTENT-ACTION');
    this.listenToEventOn('keydown', this.#menuContent, 'CONTENT-ACTION');
  }
  /**
   * Set the items for the menu.
   * @param {MenuItemDefinition[]} items
   */
  setMenuItems(items) {
    this.#menuItems.setMenuItems(items);
  }
  /**
   * Show the menu items.
   */
  #showMenuItems() {
    modalMask.showMask();
    this.style.visibility = 'hidden';
    this.#menuContent.classList.add('modal');
    this.#menuContent.style.visibility = 'visible';
    this.#menuContent.style.transform = 'translateX(0)';
    this.#menuContent.querySelector('button.utils-menu-item').focus();
  }

  /**
   * Hide the menu items.
   */
  #hideMenuItems() {
    modalMask.hideMask();
    this.style.visibility = 'visible';
    this.#menuContent.style.transform = 'translateX(-100%)';
    this.#menuContent.style.visibility = 'hidden';
    this.#menuContent.classList.remove('modal');
    focusManager.findBestFocus();
  }
  /**
   * @override
   */
  handleClickEvent(eventIgnored, eventId) {
    switch (eventId) {
      case 'OPEN':
        this.#showMenuItems();
        break;
      default:
        this.#hideMenuItems();
    }
  }

  /**
   * @override
   */
  handleKeydownEvent(event, eventIdIgnored) {
    if (event.key === 'Escape') {
      this.#hideMenuItems();
    }
  }
}

/**
 * Element to encapsulate a menu item.
 * @extends module:utils/userIo/managedElement.ManagedElement
 */
class MenuItem extends ManagedElement {
  /**
   * @param {module:utils/userIo/icons~IconDetails} iconDetail - icon to apply to button.
   */
  constructor(iconDetails) {
    super('button', 'utils-menu-item');
    icons.applyIconToElement(iconDetails, this);
    this.setAttributes({
      'aria-role': 'menuitem',
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
        item = new MenuItem(menuDef.iconDetails);
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
    const index = parseInt(eventId);
    if (isNaN(index)) {
      return;
    }
    console.debug(`Handling event ${event.type} with id ${eventId}`);
    this.menuDefinition[index].command.execute().then((value) => {
      console.debug(`Finished handling menu option ${value}.`);
    });
  }
}
