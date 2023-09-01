/**
 * @file Tools for handling FontAwesome icons
 *
 * @module lessons/fontAwesomeTools
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
const FAMILY = 'fa-solid';

/**
 * Get the html to display the iconName
 * @param {string} iconName - the Fontawesome icon name. It does not need the
 * 'fa' prefix, but it will still work even if that is included. An illegal name
 * results in a notdef icon being returned.
 * @param {string} additionalClass - an additional class to add. if it includes any
 * characters other that a-zA-Z_ or -, it is ignored.
 * @returns {string}
 */
export function getHtmlForIconName(iconName, additionalClass = '') {
  iconName = iconName?.toLowerCase();
  const matches = iconName.match(/^(?:fa-)?([a-z-]{2,})$/);
  const iconClass = matches ? matches[1] : 'notdef';
  additionalClass = /^[a-zA-Z_-]{2,}$/.test(additionalClass)
    ? ` ${additionalClass}`
    : '';
  return `<i class="${FAMILY} fa-${iconClass}${additionalClass}"></i>`;
}
