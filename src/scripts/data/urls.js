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

const rootUrl = window.location.href.replace(/index\.html(\?.*)?$/, '');
// allow for the fact that markdown files are available as html files on GitHub pages.
const mdExtension = window.location.host.match(/^127\.0\.0\.1:808[0-2]/)
  ? 'md'
  : 'html';

/**
 * @enum {string}
 */
export const Urls = {
  HELP: `${rootUrl}assets/docs/help.${mdExtension}`,
  PRIVACY: `${rootUrl}assets/docs/privacy.${mdExtension}`,
};
