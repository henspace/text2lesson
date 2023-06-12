/**
 * @file Test file for project info.
 * @module
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

/*global test, expect */
import { PROJECT_INFO, PROJECT_TRANSFORMER } from './project-info.js';
import path from 'node:path';

/** Custom matcher for paths. As file-utils could be using relative or
 * absolute paths, this checks that the paths resolve to the same location.
 * The expected path can take more than one compenent which will be joined to
 * create the expectedPath.
 * @param {string} actualPath
 * @param {string} expectedPathsToJoin
 *
 * @returns {{message:function, pass: boolean}}
 */
function toMatchPath(actualPath, ...expectedPathsToJoin) {
  const expectedPath = path.join(...expectedPathsToJoin);
  const message = () =>
    `expected ${this.utils.printReceived(actualPath)} ` +
    `to match ${this.utils.printReceived(expectedPath)}`;
  console.log(message());
  const pass = path.relative(actualPath, expectedPath).length === 0;
  return {
    message: message,
    pass: pass,
  };
}

expect.extend({
  toMatchPath,
});

test('PROJECT_INFO properties should match standard build structure.', () => {
  expect(PROJECT_INFO.appName).toBe('rapid-qanda');
  expect(PROJECT_INFO.appVersion).toMatch(/\d+\.\d+\.\d+/);
  expect(PROJECT_INFO.assetsDirRelToSource).toBe('assets');
  expect(PROJECT_INFO.buildDate instanceof Date).toBe(true);
  expect(PROJECT_INFO.buildDistDir).toMatchPath('./build/dist');
  expect(PROJECT_INFO.buildMode).toMatch(/(production|development)/);
  expect(PROJECT_INFO.buildReportDir).toMatchPath('./build/reports');
  expect(PROJECT_INFO.bundleFilePath).toMatchPath(
    PROJECT_INFO.buildDistDir,
    `${PROJECT_INFO.appName}.js`
  );
  expect(PROJECT_INFO.bundleName).toBe(`${PROJECT_INFO.appName}.js`);
  expect(PROJECT_INFO.cacheId).toMatch(/\w_/);
  expect(PROJECT_INFO.distributedLicencePath).toMatch(
    /\.\/licenses\/[a-zA-Z0-9-]+\.md/
  );
  expect(PROJECT_INFO.entryScript).toMatchPath('./src/scripts/main.js');
  expect(PROJECT_INFO.formattedBuildDate).toMatch(
    /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}Z/
  );
  expect(PROJECT_INFO.i18nMasterLanguage).toBe('en');
  expect(PROJECT_INFO.i18nAssetsDirRelToSource).toBe('assets/i18n');
  expect(PROJECT_INFO.productName).toBe('Lesson Runner');
  expect(PROJECT_INFO.sourceDir).toBe('./src');
});

test('PROJECT_TRANSFORMER transforms standard placeholders.', () => {
  expect(
    PROJECT_TRANSFORMER.transform(
      Buffer.from('$_APP_VERSION_TXT_$'),
      'TXT'
    ).toString('utf-8')
  ).toBe(PROJECT_INFO.appVersion);
  expect(
    PROJECT_TRANSFORMER.transform(
      Buffer.from('$_BUILD_DATE_TXT_$'),
      'TXT'
    ).toString('utf-8')
  ).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}Z/);
  expect(
    PROJECT_TRANSFORMER.transform(
      Buffer.from('$_BUILD_MODE_TXT_$'),
      'TXT'
    ).toString('utf-8')
  ).toBe(PROJECT_INFO.buildMode);
  expect(
    PROJECT_TRANSFORMER.transform(
      Buffer.from('$_BUNDLE_NAME_TXT_$'),
      'TXT'
    ).toString('utf-8')
  ).toBe(PROJECT_INFO.bundleName);
  expect(
    PROJECT_TRANSFORMER.transform(
      Buffer.from('$_BUILD_YEAR_$'),
      'TXT'
    ).toString('utf-8')
  ).toBe(PROJECT_INFO.buildDate.getFullYear().toString());
  expect(
    PROJECT_TRANSFORMER.transform(
      Buffer.from('$_PRODUCT_NAME_TXT_$'),
      'TXT'
    ).toString('utf-8')
  ).toBe(PROJECT_INFO.productName);
});
