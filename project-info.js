/**
 * @file Constants that are available for all scripts.
 * @module
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

/*global process */
import path from 'node:path';
import * as format from './tools/ansi-format.js';
import { StringTransformer } from './tools/file-utils.js';

/**
 * Get the package property with the name. Property name is in the form
 * config.prop or version. The dot is replaced by _ and preceeded by
 * npm_package_to create the property that is included in process.env.
 * @param {*} propName property name
 * @returns value of the property
 * @throws {Error} thrown if the property does not exist.
 */
function getPackageProperty(propName) {
  const envPropertyName = `npm_package_${propName.replaceAll('.', '_')}`;
  const value = process.env[envPropertyName];
  if (value === undefined) {
    const message =
      `Unable to find process.env.${envPropertyName}.\n` +
      `Have you set the ${propName} in package.json and are you running this ` +
      'as an npm script?';
    console.log(format.toBigError(message));
    throw new Error(message);
  }
  return value;
}

/**
 * Get the current build mode from the process environment.
 *
 * @returns Either 'production' or 'development'. Defaults to 'development'.
 */
function getBuildMode() {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  } else {
    return 'development';
  }
}

const appName = getPackageProperty('config.appName');
let buildDistDir;
if (getBuildMode() === 'production') {
  buildDistDir = getPackageProperty('config.buildPublishDir');
} else {
  buildDistDir = getPackageProperty('config.buildDevDir');
}
const bundleName = `${appName}.js`;
const bundleFilePath = path.join(buildDistDir, bundleName);
const buildDate = new Date();
const formattedBuildDate = buildDate
  .toISOString()
  .replace(/(\d{4}-\d{2}-\d{2})T(\d+?:\d+?:\d+?)(?:\.\d*)(.*)/, '$1 $2$3');
const sourceDir = getPackageProperty('config.sourceDir');

/**
 * @typedef {object} PROJECT_INFO
 * @property {string} appName - the name of the app.
 * Taken from package.json *config.appName*.
 * @property {string} appVersion - the application version. This is the same
 *  as the package version.
 * @property {string} assetsDirRelToSource
 * @property {string} buildDate - the date object for when the build started.
 * @property {string} buildDistDir - the path to the directory for build output
 * Taken from package.json *config.buildDistDir*.
 * @property {string} buildMode - production or development.
 * @property {string} buildReportDir - the path to the directory for build reports
 * Taken from package.json *config.buildReportDir*.
 * @property {string} bundleFilePath - the path to the bundle.
 * Derived from PROJECT_INFO.buildDistDir and PROJECT_INFO.bundleName.
 * @property {string} bundlePreamble - the path to the licence text used
 * for adding as a preamble to the compiled JavaScript bundle.
 * Taken from package.json *config.bundlePreamble*.
 * @property {string} bundleName - the appName, including the extension for the
 *  bundled js.
 * @property {string} cacheId - prefix suitable for service worker caches.
 * Derived from PROJECT_INFO.appName.
 * @property {string} distributedLicencePath - path to the licence file that should
 * be added to the root.
 * @property {string} entryScript - path to the js file used as the entry point
 *  for building. This built from  package.json *config.sourceDir* and
 * *config.entryScriptRelToSource* options.
 * @property {string} formattedBuildDate - the build date in simplified ISO format.
 * @property {string} i18nMasterLanguage - RFC 5646 identifying tag.
 * @property {string} i18nAssetsDirRelToSource - path to the directory
 * containing assets relative to the *sourceDir*.
 * @property {string} productName - title of app. Typically used as HTML title.
 *  Taken to package.json *config.productName*.
 * @property {string} sourceDir - path to the source directory.
 */
export const PROJECT_INFO = {
  appName: appName,
  appVersion: getPackageProperty('version'),
  assetsDirRelToSource: getPackageProperty('config.assetsDirRelToSource'),
  buildDate: new Date(),
  buildDistDir: buildDistDir,
  buildMode: getBuildMode(),
  bundleFilePath: bundleFilePath,
  buildReportDir: getPackageProperty('config.buildReportDir'),
  bundlePreamble: getPackageProperty('config.bundlePreamble'),
  bundleName: bundleName,
  cacheId: appName.replace(/[^\w]+/g, '_'),
  distributedLicencePath: getPackageProperty('config.distributedLicencePath'),
  entryScript: path.join(
    sourceDir,
    getPackageProperty('config.entryScriptRelToSource')
  ),
  formattedBuildDate: formattedBuildDate,
  i18nMasterLanguage: getPackageProperty(
    'config.i18nMasterLanguage'
  ).toLowerCase(),
  i18nAssetsDirRelToSource: getPackageProperty(
    'config.i18nAssetsDirRelToSource'
  ),
  productName: getPackageProperty('config.productName'),
  sourceDir: sourceDir,
};

/**
 * Transformer that can be used to replace placeholders with PROJECT_INFO
 * properties.
 *  @type {StringTransformer}
 */
export const PROJECT_TRANSFORMER = new StringTransformer([
  {
    search: /\$_APP_VERSION_TXT_\$/g,
    sub: PROJECT_INFO.appVersion,
    filetype: ['HTML', 'JS', 'TXT', 'MD'],
  },
  {
    search: /\$_BUILD_DATE_TXT_\$/g,
    sub: formattedBuildDate,
    filetype: ['HTML', 'JS', 'TXT', 'MD'],
  },
  {
    search: /\$_BUILD_MODE_TXT_\$/g,
    sub: PROJECT_INFO.buildMode,
    filetype: ['HTML', 'JS', 'TXT', 'MD'],
  },

  {
    search: /\$_BUNDLE_NAME_TXT_\$/g,
    sub: PROJECT_INFO.bundleName,
    filetype: ['HTML', 'JS', 'TXT', 'MD'],
  },
  {
    search: /\$_BUILD_YEAR_\$/g,
    sub: PROJECT_INFO.buildDate.getFullYear(),
    filetype: ['HTML', 'JS', 'TXT', 'MD'],
  },
  {
    search: /\$_PRODUCT_NAME_TXT_\$/g,
    sub: PROJECT_INFO.productName,
    filetype: ['HTML', 'JS', 'TXT', 'MD'],
  },
]);

export default PROJECT_INFO;
