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
import './utils/polyfills/string.js';
import { BuildInfo } from './data/constants.js';
import { getSettingDefinitions } from './data/settingDefinitions.js';
import { getMainMenuItems } from './data/menuItems.js';
import { lessonManager } from './lessons/lessonManager.js';

import { ModalDialog } from './utils/userIo/modalDialog.js';
import { registerServiceWorker } from './utils/serviceWorkers/serviceWorkersUtilities.js';
import { loadSettingDefinitions } from './utils/userIo/settings.js';
import { persistentData } from './utils/userIo/storage.js';
import { i18n } from './utils/i18n/i18n.js';
import { getLanguages } from './utils/i18n/languageLoader.js';
import { StageManager } from './lessons/presenters/stageManager.js';
import { PresenterFactory } from './lessons/presenters/presenterFactory.js';
import { setHeaderAndFooter } from './headerAndFooter.js';
import { showFirstUseMessageIfAppropriate } from './data/firstTimeMessage.js';
import { toast } from './utils/userIo/toast.js';
import './utils/userIo/modalMask.js';
import './utils/userIo/screenSizer.js';
import { embeddedLesson } from './lessons/embeddedLesson.js';
import { Presenter } from './lessons/presenters/presenter.js';
import { addMathMlCssFallback } from './utils/text/mathml.js';

/**
 * Display a fatal error.
 * This is shown in the console, written to the page's content. Nothing else is
 * used as it may not be safe to call complex functions such as ModalDialog
 * routines.
 * @param {Error} error
 */
function showFatalError(error) {
  const html = `<h1>Whoops!</h1>
  <p>An error has occurred from which I can't recover on my own.</p>
  <ul>
  <li>Name: ${error.name}</li>
  <li>Cause: ${error.cause}</li>
  <li>Message: ${error.message}</li>
  </ul>
  <p>Try reloading the application.</p>
  `;
  console.error(error);
  document.getElementById('content').innerHTML = html; // in case dialog cannot be shown.
}

/**
 * Handle a failure to load the libraries. A message is shown explaining the
 * issue and recommending changing the library setting.
 * @param {Error} error - the details of the error.
 * @returns {Promise<undefined>}
 */
function handleLibraryLoadFailure(error) {
  const paragraphs = [
    i18n`A problem has occurred while trying to load the libraries.`,
    i18n`Hopefully, this is just a temporary issue and reloading the application will solve the problem.`,
    i18n`In the meantime, local libraries should still be available.`,
    '<br><br>',
    i18n`Full details of the error are given below:`,
    '<br><br>',
    error.message ?? error,
  ];
  return ModalDialog.showError(paragraphs.join(' '));
}

/**
 * Handle a failure to load the libraries. A message is shown explaining the
 * issue and recommending changing the library setting.
 * @param {Error} error - the details of the error.
 * @returns {Promise<undefined>}
 */
function handleLibraryLoadContentFailure(error) {
  const paragraphs = [
    i18n`A problem has occurred while trying to load the library content.`,
    i18n`If the problem persists, go to the settings and change the selected library.`,
    i18n`<br><br>`,
    i18n`Hopefully, this is just a temporary issue and reloading the application will solve the problem.`,
    i18n`In the meantime, local libraries should still be available.`,
    '<br><br>',
    i18n`Full details of the error are given below:`,
    '<br><br>',
    error.message ?? error,
  ];
  return ModalDialog.showError(paragraphs.join(' '));
}

/**
 * Load the application
 * @returns {Promise} fulfils to undefined.
 */
function loadApplication() {
  console.info('Launching application.');
  persistentData.setStorageKeyPrefix(
    `LR_${BuildInfo.getBundleName().replace('.', '_')}`
  );

  const librariesLocation = BuildInfo.isBuilt()
    ? 'assets/lessons/libraries.json'
    : 'assets/lessons/lessons.test.data/libraries.test.json';
  return getLanguages(embeddedLesson.translations)
    .then(() => lessonManager.loadAllLibraries(librariesLocation))
    .then((error) => {
      return error ? handleLibraryLoadFailure(error) : null;
    })
    .then(() => loadSettingDefinitions(getSettingDefinitions()))
    .then(() => {
      const language = i18n`language::`;
      if (language !== '') {
        console.info(`Language ${language}`);
        document.documentElement.setAttribute('lang', language);
      }
      return true;
    })
    .then(() => setHeaderAndFooter(getMainMenuItems()))
    .then(() => lessonManager.loadAllLibraryContent())
    .then((error) => {
      return error ? handleLibraryLoadContentFailure(error) : null;
    })
    .then(() =>
      toast(
        '<span style="font-size:3rem;">&#x1F642;</span>' +
          i18n`Welcome to Text2Lesson &mdash; the fastest way to create your lessons from plain old text.`,
        true
      )
    )
    .then(() => showFirstUseMessageIfAppropriate())
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
      showFatalError(error);
      ModalDialog.showFatal(error).then(() => window.location.reload());
    });
}

/**
 * Register the service worker if the application has been built. If running
 * directly from source, no service worker is registered.
 */
function registerServiceWorkerIfBuilt() {
  if (BuildInfo.isBuilt()) {
    registerServiceWorker();
  }
}

/**
 * Warn if about to leave the page. It only warns if there is an element with the
 * `Presenter.DO_NOT_CLOSE_CLASS_NAME`.
 */
function addExitWarning() {
  window.addEventListener('beforeunload', (event) => {
    if (document.querySelector(`.${Presenter.DO_NOT_CLOSE_CLASS_NAME}`)) {
      event.preventDefault();
      return (event.returnValue = '');
    }
  });
}

/**
 * Once the page has loaded, launch the application.
 */
window.addEventListener('load', () => {
  try {
    registerServiceWorkerIfBuilt();
    addMathMlCssFallback();
    addExitWarning();
    return loadApplication();
  } catch (error) {
    showFatalError(error);
  }
});
