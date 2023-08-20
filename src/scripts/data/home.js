/**
 * @file Home message.
 *
 * @module data/home
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

/**
 * Implemented as function to prevent it being computed if module load
 * occurs before languages have been resolved.
 * @returns {string} Text for welcome message.
 */

import { i18n } from '../utils/i18n/i18n.js';

export const getHomeText = () => i18n`Welcome to $_PRODUCT_NAME_TXT_$.`;
