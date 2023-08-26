/**
 * @file Run post build operations.
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
 * @name "postbuild.js"
 * @global
 * @description
 * Utility script that runs postbuild scripts. What is run depends on the
 * current setting of PROJECT_INFO.buildMode.
 */

import * as postBuildUtils from './postbuild-utils.js';
import * as i18n from './i18n-build-tools.js';
import { CSS_TRANSFORMER, FileManager } from './file-utils.js';
import path from 'node:path';
import { PROJECT_INFO, PROJECT_TRANSFORMER } from '../project-info.js';

/**
 * master text file. This is generated from the source
 */
const MASTER_TRANSLATION_JSON_NAME = `${PROJECT_INFO.i18nMasterLanguage}.json`;
const I18N_ASSETS_SOURCE_DIR = path.join(
  PROJECT_INFO.sourceDir,
  PROJECT_INFO.i18nAssetsDirRelToSource
);

/*
 * Execute postbuild actions
 */

postBuildUtils
  .copyHtmlFileToBuildRoot('./src/launch.html')
  .then(() => postBuildUtils.copyHtmlFileToBuildRoot('./src/index.md'))
  .then(() => FileManager.makeDir(PROJECT_INFO.buildReportDir))
  .then(() =>
    i18n.extractI18nLiterals(
      PROJECT_INFO.bundleFilePath,
      path.join(I18N_ASSETS_SOURCE_DIR, MASTER_TRANSLATION_JSON_NAME)
    )
  )
  .then(() => postBuildUtils.transpile(PROJECT_INFO.bundleFilePath))
  .then(() =>
    postBuildUtils.compress(PROJECT_INFO.bundleFilePath, PROJECT_TRANSFORMER)
  )
  .then(() =>
    FileManager.copyFiles(
      path.join(PROJECT_INFO.sourceDir, PROJECT_INFO.assetsDirRelToSource),
      path.join(PROJECT_INFO.buildDistDir, PROJECT_INFO.assetsDirRelToSource),
      { filterRe: /^((?!\.test\.).)*$/, transformer: CSS_TRANSFORMER }
    )
  )
  .then(() => {
    FileManager.copyFile(
      './src/_config.yml',
      path.join(PROJECT_INFO.buildDistDir, '_config.yml')
    );
  })
  .then(() => {
    FileManager.copyFile(
      PROJECT_INFO.distributedLicencePath,
      path.join(
        PROJECT_INFO.buildDistDir,
        FileManager.getBasename(PROJECT_INFO.distributedLicencePath)
      ),
      PROJECT_TRANSFORMER
    );
  })
  .then(() => {
    return FileManager.createJsonDirListing(
      path.join(
        PROJECT_INFO.buildDistDir,
        PROJECT_INFO.i18nAssetsDirRelToSource
      ),
      path.join(PROJECT_INFO.buildDistDir, 'languages.json'),
      {
        metaData: {
          master: MASTER_TRANSLATION_JSON_NAME,
        },
        filterRe: /^[a-zA-Z]{2}(-[a-zA-Z]{2})?\.json$/,
      }
    );
  })
  .then(() => postBuildUtils.generateServiceWorker())
  .then(() =>
    FileManager.copyFiles(
      './src/_includes',
      path.join(PROJECT_INFO.buildDistDir, '_includes')
    )
  )
  .then(() =>
    i18n.validateAllJsonFiles(
      path.join(
        PROJECT_INFO.buildDistDir,
        PROJECT_INFO.i18nAssetsDirRelToSource
      ),
      MASTER_TRANSLATION_JSON_NAME,
      PROJECT_INFO.buildReportDir
    )
  );
