/**
 * @file Constants used by the application. In most cases these are items which
 * are replaced with the appropriate values during the build process.
 *
 * @module data/constants
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
 */

/**
 * Build information. All values are provided via functions to allow the
 * application to be viewed with a server on the source *index.html* file
 * prior to build. The use of functions prevents constant replacements during build process.
 * @property {function():boolean} isBuilt - has the code been built.
 * This distinguishes versions which are being viewed directly from the source.
 * @property {function():string} mode - production or development
 * @property {function():string} version - build version
 * @property {function():string} bundleName - final bundle name including the extension
 */
export const BuildInfo = {
  isBuilt: () => BuildInfo.getMode().indexOf('$') < 0,
  getBuildDate: () => '$_BUILD_DATE_TXT_$',
  getBundleName: () => '$_BUNDLE_NAME_TXT_$',
  getProductName: () => '$_PRODUCT_NAME_TXT_$',
  getMode: () => '$_BUILD_MODE_TXT_$',
  getVersion: () => '$_APP_VERSION_TXT_$ ',
};
