/**
 * @file Create a mask to cover elements on the page. The mask is automatically
 * added to the page.
 *
 * @module libs/utils/userIo/modalMask
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

let hideTimer;

/** Show the modal mask */
export function showModalMask() {
  clearTimeout(hideTimer);
  const mask = document.getElementById('utils-window-mask');
  mask.style.visibility = 'visible';
  mask.style.opacity = 0.9;
}

/** Show the modal mask */
export function hideModalMask() {
  const mask = document.getElementById('utils-window-mask');
  mask.style.opacity = 0;
  hideTimer = setTimeout(() => (mask.style.visibility = 'hidden'), 500);
}

let mask = document.createElement('div');
mask.setAttribute('id', 'utils-window-mask');
document.body.appendChild(mask);
