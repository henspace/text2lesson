/**
 * @file CssVariables class allowing JavaScript to access CSS
 * properties.
 *
 * @module libs/utils/color/cssVariables
 *
 * @license GPL-3.0-or-later
 * Lesson RunnerCreate quizzes and lessons from plain text files.
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

const root = document.querySelector(':root');
/**
 * Get the property value for the specified property from the :root element.
 * @param {string} propertyName property name
 * @returns {string}
 */
export function getProperty(propertyName) {
  const rootStyles = getComputedStyle(root);
  return rootStyles.getPropertyValue(propertyName);
}

/**
 * Set the value of the specified property.
 * @param {string} propertyName - the property to modify.
 * @param {string} propertyValue - the new value.
 */
export function setProperty(propertyName, propertyValue) {
  root.style.setProperty(propertyName, propertyValue);
}
