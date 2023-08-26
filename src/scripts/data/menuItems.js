/**
 * @file List of menu items
 *
 * @module data/menuItems
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
 */

import { showAllSettings } from '../utils/userIo/settings.js';
import { icons } from '../utils/userIo/icons.js';
import { Urls } from './urls.js';

/**
 * Get the main menu items.
 * @returns {module:utils/userIo/menu~MenuItemDefinition[]}
 */
export function getMainMenuItems() {
  return [
    {
      iconDetails: icons.settings,
      command: { execute: () => showAllSettings() },
    },
    { iconDetails: null, command: null },
    {
      iconDetails: icons.privacy,
      command: {
        execute: () => {
          window.open(Urls.PRIVACY, '_blank');
          return Promise.resolve();
        },
      },
    },
  ];
}
