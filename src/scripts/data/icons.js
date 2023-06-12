/**
 * @file HTML to embed icons
 *
 * @module data/icons
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

import { i18n } from '../libs/utils/i18n/i18n.js';

export const ICON_HTML = {
  OK: {
    content: '<i class="fa-solid fa-check"></i>',
    accessibleName: i18n`OK`,
  },
  CANCEL: {
    content: '<i class="fa-solid fa-xmark"></i>',
    accessibleName: i18n`Cancel`,
  },
  RESET_TO_FACTORY: {
    content:
      '<i class="fa-solid fa-caret-right"></i> <i class="fa-solid fa-industry"/></i>',
    accessibleName: i18n`Factory reset`,
  },
  YES: {
    content: '<i class="fa-solid fa-thumbs-up"></i>',
    accessibleName: i18n`Yes`,
  },
  NO: {
    content: '<i class="fa-solid fa-thumbs-down"></i>',
    accessibleName: i18n`No`,
  },
};
