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

import { PRIVACY } from './privacy.js';
import { i18n } from '../libs/utils/i18n/i18n.js';
import { showAllSettings } from '../libs/utils/userIo/settings.js';
import { ModalDialog } from '../libs/utils/userIo/modalDialog.js';

/**
 * Get the main menu items.
 * @returns {module:utils/userIo/menu~MenuItemDefinition[]}
 */
export function getMainMenuItems() {
  return [
    { text: i18n`Settings`, command: { execute: () => showAllSettings() } },
    { text: '', command: null },
    {
      text: i18n`Privacy`,
      command: { execute: () => ModalDialog.showInfo(PRIVACY) },
    },
  ];
}
