/**
 * @file Handle screen resizing.
 *
 * @module utils/userIo/screenSizer
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
let throttleTimer = null;

/**
 * Set the vh variable. This allows for browsers that include the address bar
 * in the vh calculation.
 */
function setVhCssVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Add event listener to handle resizing of the window.
 */
window.addEventListener('resize', () => {
  if (throttleTimer !== null) {
    return; // it will get handled.
  }
  throttleTimer = window.setTimeout(() => {
    throttleTimer = null;
    setVhCssVariable();
  }, 200);
});

setVhCssVariable();
