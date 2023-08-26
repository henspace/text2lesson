/**
 * @file Gesture
 *
 * @module utils/userIo/gestures
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
import { ManagedElement } from './managedElement.js';

/** Flag showing whether the passive option is supported by listeners. */
var supportsPassive = false;

/**
 * Test to see if passive option supported.
 * @see {@link https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md}
 */
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function () {
      supportsPassive = true;
      return undefined;
    },
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (errorIgnored) {
  console.log('Passive option for listeners not supported.');
}

/**
 * Class to handle gestures
 */
export class Gesture extends ManagedElement {
  /**
   * @enum {number}
   */
  static Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
  };
  #startX;
  #startY;
  #distanceX;
  #distanceY;
  #gesturing = false;
  #startTime;
  #maxTimeMs = 500;
  #minRadius = 100;
  constructor(element) {
    super(element);
    let options = supportsPassive ? { passive: true } : undefined;
    this.listenToOwnEvent('touchstart', 'start', options);
    this.listenToOwnEvent('touchend', 'end');
    this.listenToOwnEvent('touchcancel', 'cancel');
  }

  /**
   * Handle the touchstart event.
   * @param {TouchEvent} event
   * @param {string} eventIdIgnored
   */
  handleTouchstartEvent(event, eventIdIgnored) {
    this.#gesturing = true;
    this.#startTime = new Date().getTime();
    this.#startX = event.touches[0].pageX;
    this.#startY = event.touches[0].pageY;
  }

  /**
   * Handle the touchend event. If a gesture is detected a `gesture` event
   * is dispatched with Gesture.Direction contained in the detail.
   * @param {TouchEvent} event
   * @param {string} eventIdIgnored
   */
  handleTouchendEvent(event, eventIdIgnored) {
    if (event.changedTouches.length > 1) {
      console.debug('Ignore multiple touches.');
      return;
    }
    this.#distanceX = event.changedTouches[0].pageX - this.#startX;
    this.#distanceY = this.#startY - event.changedTouches[0].pageY;
    this.#gesturing = false;
    const elapsedMs = new Date().getTime() - this.#startTime;
    if (elapsedMs > this.#maxTimeMs) {
      console.debug(`Gesture too slow at ${elapsedMs} ms`);
      return;
    }
    const radius = Math.sqrt(
      this.#distanceX * this.#distanceX + this.#distanceY * this.#distanceY
    );
    if (radius < this.#minRadius) {
      console.debug(`Gesture too short at ${radius} px`);
      return;
    }
    const angle = this.calcAngleInDeg(this.#distanceX, this.#distanceY);
    console.debug(`Direction ${angle} degrees`);
    let direction = this.getDirection(angle);
    this.element.dispatchEvent(
      new CustomEvent('gesture', { detail: direction })
    );
  }

  /**
   * Handle the touchcancel event.
   * @param {TouchEvent} eventIgnored
   * @param {string} eventIdIgnored
   */
  handleTouchcancelEvent(eventIgnored, eventIdIgnored) {
    this.#gesturing = false;
  }

  /**
   * Get the direction. Angle 0 is horizontal to the right.
   * @param {number} angleDeg - angle in degrees
   * @returns {Gesture.Direction}
   */
  getDirection(angle) {
    if (angle < 0) {
      angle += 360;
    }
    if (angle < 45) {
      return Gesture.Direction.RIGHT;
    } else if (angle < 135) {
      return Gesture.Direction.UP;
    } else if (angle < 225) {
      return Gesture.Direction.LEFT;
    } else if (angle < 315) {
      return Gesture.Direction.DOWN;
    } else {
      return Gesture.Direction.RIGHT;
    }
  }

  /**
   * Calculate the angle from (0, 0) to (x, y) in degrees.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  calcAngleInDeg(x, y) {
    return (Math.atan2(y, x) * 180) / Math.PI;
  }
}
