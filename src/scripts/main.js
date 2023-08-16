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

import { BuildInfo } from './data/constants.js';
import { getSettingDefinitions } from './data/settingDefinitions.js';
import { getMainMenuItems } from './data/menuItems.js';
import { getWelcome } from './data/welcome.js';
import { lessonManager } from './lessons/lessonManager.js';

import { ModalDialog } from './utils/userIo/modalDialog.js';
import { registerServiceWorker } from './utils/serviceWorkers/serviceWorkersUtilities.js';
import { resolveLanguages } from './utils/i18n/i18FileResolver.js';
import { loadSettingDefinitions } from './utils/userIo/settings.js';
import { persistentData } from './utils/userIo/storage.js';
import { i18n } from './utils/i18n/i18n.js';
import { StageManager } from './lessons/presenters/stageManager.js';
import { PresenterFactory } from './lessons/presenters/presenterFactory.js';
import { toast } from './utils/userIo/toast.js';
import { setTitleBarAndFooter } from './setTitleBarAndFooter.js';
import './utils/userIo/modalMask.js';
import './utils/userIo/screenSizer.js';
/**
 * Get the language files required for the application.
 * If the application has not been build, the application just returns a fulfilled
 * Promise.
 * @returns {Promise} Fulfils to undefined.
 */
function getLanguages() {
  if (!BuildInfo.isBuilt()) {
    return Promise.resolve(undefined);
  }
  return resolveLanguages('./languages.json')
    .then(() => {
      console.info(
        `Build information: ${
          BuildInfo.getBundleName
        } ${BuildInfo.getVersion()} ${BuildInfo.getMode()}`
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

if (BuildInfo.isBuilt()) {
  registerServiceWorker(BuildInfo.getMode());
}

window.addEventListener('load', () => {
  persistentData.setStorageKeyPrefix(
    `LR_${BuildInfo.getBundleName().replace('.', '_')}`
  );
  return getLanguages()
    .then(() => lessonManager.loadAllLibraries('assets/lessons/libraries.json'))
    .then(() => loadSettingDefinitions(getSettingDefinitions()))
    .then(() => {
      const language = i18n`language::`;
      if (language !== '') {
        console.info(`Language ${language}`);
        document.documentElement.setAttribute('lang', language);
      }
      return true;
    })
    .then(() => setTitleBarAndFooter(getMainMenuItems()))
    .then(() => {
      toast('Debug message for testing');
      return ModalDialog.showInfo(getWelcome(), i18n`Welcome`);
    })
    .then(() => lessonManager.loadAllLibraryContent())
    .then(() => {
      const stage = document.getElementById('stage');
      return new StageManager(stage).startShow(PresenterFactory.getInitial());
    })
    .then(() => {
      console.warn('Did not expect to get here.');
      ModalDialog.showInfo(
        i18n`The application has finished. It will now start again.`
      ).then(() => window.location.reload());
    })
    .catch((error) => {
      console.error(error);
      ModalDialog.showFatal(error).then(() => window.location.reload());
    });
});
