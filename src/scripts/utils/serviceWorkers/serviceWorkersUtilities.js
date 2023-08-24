/**
 * @file Support the Workbox service worker
 *
 * @module utils/serviceWorkers/serviceWorkersUtilities
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

/**
 * Perform the actual registration.
 * @param {string} buildMode - production or development.
 */
function performRegistrationIfPossible(buildMode) {
  if (buildMode === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((registration) => {
          console.info('SW registered: ', registration);
          let controller = navigator.serviceWorker.controller;
          console.info(`Page controlled by ${controller}.`);
        })
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError);
        });
    });
  }
}

/**
 * Register the service worker if in production mode.
 * @param {string} buildMode - production or development.
 */
export function registerServiceWorker(buildMode) {
  try {
    performRegistrationIfPossible(buildMode);
  } catch (error) {
    console.error('Error during service worker registration', error);
  }
}
