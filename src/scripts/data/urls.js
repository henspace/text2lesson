/**
 * @file Collection of urls.
 *
 * @module data/urls
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

import { embeddedLesson } from '../lessons/embeddedLesson.js';
import { NON_LOCAL_ROOT_URL, DOCS_ROOT_URL } from './rootUrl.js';

let rootUrl = embeddedLesson.hasLesson
  ? embeddedLesson.rootUrl
  : window.location.href.replace(/index\.html(\?.*)?$/, '');
if (!rootUrl.endsWith('/')) {
  rootUrl += '/'; // defensive
}

/**
 * @enum {string}
 */
export const Urls = {
  NON_LOCAL_ROOT: NON_LOCAL_ROOT_URL,
  ROOT: `${rootUrl}`,
  LOGO: `${rootUrl}assets/images/logo/bordered_logo_128.png`,
  HELP: `${DOCS_ROOT_URL}app-help.html`,
  PRIVACY: `${DOCS_ROOT_URL}privacy.html`,
  DOCS_HOME: `${DOCS_ROOT_URL}index.html`,
};
