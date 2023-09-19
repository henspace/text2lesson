/**
 * @file Handle messaged for first time use.
 *
 * @module data/firstTimeMessage
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

import { persistentData } from '../utils/userIo/storage.js';
import { ModalDialog } from '../utils/userIo/modalDialog.js';
import { i18n } from '../utils/i18n/i18n.js';
import { BuildInfo } from '../data/constants.js';
import { parseMarkdown } from '../utils/text/textProcessing.js';
import { Urls } from './urls.js';

/**
 * If this is the first time the application has been used, as defined by the
 * flag, a welcome message including privacy information is displayed.
 * The flag is set false once the dialog has been closed.
 * @returns {Promise} fulfils to undefined
 */
export function showFirstUseMessageIfAppropriate() {
  const FIRST_TIME_USE_KEY = 'showFirstUseMessage';
  const firstUse = persistentData.getFromStorage(FIRST_TIME_USE_KEY, true);
  if (firstUse) {
    const appName = BuildInfo.getProductName();
    const privacyLinkLabel = i18n`Privacy`;
    const privacyLink = `[${privacyLinkLabel}](${Urls.PRIVACY})`;
    const gplLink =
      '[GNU General Public License](https://www.gnu.org/licenses/gpl-3.0.en.html#license-text)';
    const message = [
      i18n`${appName} has been designed to allow you to create lessons and quizzes quickly and easily by just writing simple, plain text.`,
      i18n`As this is your first time using the application, here are some important details.`,
      '',
      i18n`This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.`,
      i18n`See the ${gplLink} for more details.`,
      i18n`### Data use by ${appName}`,
      i18n`- ${appName} holds no account details or personal information.`,
      i18n`- The only data stored are your preferences for using the application and any lessons you create.`,
      i18n`- No information that you enter when answering questions in a quiz is ever stored or transmitted to the server.`,
      i18n`- Data are stored on your device using your browser's localStorage.`,
      i18n``,
      i18n`The site is hosted by GitHub.`,
      i18n`Details of all privacy policies can be found in the ${privacyLink} information.`,
    ].join('\n');
    return ModalDialog.showInfo(parseMarkdown(message), i18n`Welcome`).then(
      () => persistentData.saveToStorage(FIRST_TIME_USE_KEY, false)
    );
  } else {
    return Promise.resolve();
  }
}
