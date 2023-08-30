/**
 * @file Create confetti
 *
 * @module effects/confetti
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

import { Random } from '../utils/random.js';

const MAX_CONFETTI = 20;
const CONFETTI_CLASSES = ['square', 'heart', 'star'];
const MIN_FALL_TIME_MS = 3000;
const MAX_FALL_TIME_MS = 6000;
const MIN_ROTATION_DEG = -45;
const MAX_ROTATION_DEG = 45;

export function generateConfetti() {
  for (let n = 0; n < MAX_CONFETTI; n++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    const pieceContent = document.createElement('div');
    pieceContent.style.transform = `rotate(${Random.between(
      MIN_ROTATION_DEG,
      MAX_ROTATION_DEG
    )}deg)`;
    piece.appendChild(pieceContent);
    piece.classList.add(Random.itemFrom(CONFETTI_CLASSES));
    piece.style.animationDuration = `${Random.between(
      MIN_FALL_TIME_MS,
      MAX_FALL_TIME_MS
    )}ms`;
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => {
      console.debug('remove confetti');
      piece.remove();
    });
    piece.addEventListener('animationcancel', () => {
      console.debug('remove confetti');
      piece.remove();
    });
    const width = document.body.getBoundingClientRect().width;
    const pieceWidth = piece.getBoundingClientRect().width;
    piece.style.left = `${Random.between(pieceWidth, width - pieceWidth)}px`;
  }
}
