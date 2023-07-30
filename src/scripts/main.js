/**
 * @file Main entry point for the application.
 *
 * @module main
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
 *
 */

import { BUILD_INFO } from './data/constants.js';
import { getSettingDefinitions } from './data/settingDefinitions.js';
import { getMainMenuItems } from './data/menuItems.js';
import { WELCOME } from './data/welcome.js';
import { lessonManager } from './lessons/lessonManager.js';

import { setMenuItems } from './libs/utils/userIo/menu.js';
import { ModalDialog } from './libs/utils/userIo/modalDialog.js';
import { registerServiceWorker } from './libs/utils/serviceWorkers/serviceWorkersUtilities.js';
import { resolveLanguages } from './libs/utils/i18n/i18FileResolver.js';
import { loadSettingDefinitions } from './libs/utils/userIo/settings.js';
import { setStorageKeyPrefix } from './libs/utils/userIo/settings.js';
import { i18n } from './libs/utils/i18n/i18n.js';
import { ManagedElement } from './libs/utils/dom/managedElement.js';
import { LibraryPresenter } from './lessons/presenters/libraryPresenter.js';

/**
 * Get the language files required for the application.
 * If the application has not been build, the application just returns a fulfilled
 * Promise.
 * @returns {Promise} Fulfils to undefined.
 */
function getLanguages() {
  if (!BUILD_INFO.isBuilt()) {
    return Promise.resolve(undefined);
  }
  return resolveLanguages('./languages.json')
    .then(() => {
      console.info(
        `Build information: ${
          BUILD_INFO.bundleName
        } ${BUILD_INFO.version()} ${BUILD_INFO.mode()}`
      );
      return;
    })
    .catch((error) => {
      const fetchSummary = error.fetchSummary;
      if (fetchSummary && fetchSummary.length > 0 && fetchSummary[0].read) {
        console.error(`${error}\nUsing translation ${fetchSummary[0].url}`);
      } else {
        console.error(error.message);
        return Promise.reject(error);
      }
      return;
    });
}

if (BUILD_INFO.isBuilt()) {
  registerServiceWorker(BUILD_INFO.mode());
}

window.addEventListener('load', () => {
  setStorageKeyPrefix(`LR_${BUILD_INFO.bundleName().replace('.', '_')}`);
  getLanguages()
    .then(() => lessonManager.loadLibraries('assets/lessons/libraries.json'))
    .then(() => loadSettingDefinitions(getSettingDefinitions()))
    .then(() => {
      const language = i18n`language::`;
      if (language !== '') {
        console.info(`Language ${language}`);
        document.documentElement.setAttribute('lang', language);
      }
      return true;
    })
    .then(() => setMenuItems(getMainMenuItems()))
    .then(() => {
      return ModalDialog.showInfo(WELCOME);
    })
    .then(() => lessonManager.loadCurrentLibrary())
    .then(() => {
      return runPresentationLoop();
    })
    .catch((error) => {
      console.error(error);
      ModalDialog.showFatal(error).then(() => window.location.reload());
    });
});

/**
 * The main pesentation loop.
 */
async function runPresentationLoop() {
  const stage = new ManagedElement(document.getElementById('stage'));
  let presenter = new LibraryPresenter();
  for (;;) {
    presenter = await presenter.presentOnStage(stage);
    stage.removeChildren();
  }
}
