/**
 * @file Sound manager
 *
 * @module utils/audio/soundManager
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
 * Array of sound urls. These must match the SoundManager.Enthusiasm indexes.
 * A null entry means no sound.
 */
const GOOD_SOUND_URLS = [
  null,
  'assets/audio/good1.mp3',
  'assets/audio/good2.mp3',
];
const BAD_SOUND_URLS = [null, 'assets/audio/bad1.mp3', 'assets/audio/bad2.mp3'];

/**
 * Measure of how enthusiastic audio is. When OFF there is no audio at all.
 * @enum {number}
 */
export const Enthusiasm = {
  OFF: 0,
  LOW: 1,
  HIGH: 2,
};

/**
 * Sound manager
 */
class SoundManager {
  /**
   * @type {Enthusiasm}
   */
  #enthusiasm;

  /**
   * @type {Audio}
   */
  #goodAudio;

  /**
   * @type {Audio}
   */
  #badAudio;

  /**
   * Construct
   */
  constructor() {
    this.#enthusiasm = Enthusiasm.OFF;
    this.#loadAudio();
  }

  get enthusiasm() {
    return this.#enthusiasm;
  }

  set enthusiasm(value) {
    if (isNaN(value) || value < Enthusiasm.OFF || value > Enthusiasm.HIGH) {
      console.error(
        `Attempt to set enthusiasm to invalid level of ${value} ignored.`
      );
      return;
    }
    if (value !== this.#enthusiasm) {
      this.#enthusiasm = value;
      this.#loadAudio();
    }
  }

  /**
   * Load the audio sounds.
   */
  #loadAudio() {
    this.#goodAudio = this.#createAudioIfNotNull(
      GOOD_SOUND_URLS[this.#enthusiasm]
    );
    this.#badAudio = this.#createAudioIfNotNull(
      BAD_SOUND_URLS[this.#enthusiasm]
    );
  }

  /**
   * Load the audio if not null
   * @param {string} url
   * @returns {Audio} new audio object or null if url is null.
   */
  #createAudioIfNotNull(url) {
    return url ? new Audio(url) : null;
  }

  /**
   * Play a good sound.
   */
  playGood() {
    this.#goodAudio?.play();
  }

  /**
   * Play a good sound.
   */
  playBad() {
    this.#badAudio?.play();
  }
}

export const soundManager = new SoundManager();
