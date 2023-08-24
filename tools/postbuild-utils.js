/**
 * @file Post build operations.
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

import { PROJECT_INFO, PROJECT_TRANSFORMER } from '../project-info.js';
import { generateSW } from 'workbox-build';
import { minify } from 'terser';
import * as format from './ansi-format.js';
import { FileManager } from './file-utils.js';
import path from 'node:path';
import * as fsPromises from 'node:fs/promises';
import { createCommentBlock } from './preamble-generator.js';
import * as babel from '@babel/core';

console.log(
  format.toBigHeading(`Post build operations in ${process.env.NODE_ENV} mode.`)
);

/**
 * Compress and replace tags in the JavaScript file. The file is overwritten
 * with the modified version so this should only be performed on the build file.
 * The function will make sure filePath is in the PROJECT_INFO.buildDistDir.
 * If provided with a BufferTransformer, the transformation will be applied
 * before compression.
 * @param {string} filePath
 * @param {transformer} [transformer] - transformer to apply
 * @return {Promise} Fulfills to undefined on success.
 */
export function compress(filePath, transformer) {
  const relativePath = path.relative(PROJECT_INFO.buildDistDir, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return Promise.reject(
      new Error(
        `Cannot compress ${filePath} as it is ` +
          `not in the build directory ${PROJECT_INFO.buildDistDir}`
      )
    );
  }
  console.log(`Compressing ${filePath} in ${PROJECT_INFO.buildMode} mode.`);
  const options = {
    format: {
      preamble: createCommentBlock(PROJECT_INFO.bundlePreamble),
      comments: false,
      max_line_len: PROJECT_INFO.buildMode === 'production' ? false : 80,
    },
    compress: {
      defaults: true,
      keep_classnames: true,
    },
    mangle: false,
  };

  fsPromises
    .readFile(filePath)
    .then((buffer) => {
      if (transformer) {
        return transformer.transform(buffer, FileManager.getFileType(filePath));
      } else {
        return buffer;
      }
    })
    .then((buffer) => minify(buffer.toString('utf8'), options))
    .then((minifiedContents) =>
      fsPromises.writeFile(filePath, minifiedContents.code, 'utf8')
    );
}

/**
 * Generate a service worker.
 * @returns {Promise} Fulfills to true on success
 * @private
 */
export function generateServiceWorker() {
  console.log('Generating service worker.');

  // These are some common options, and not all are required.
  // Consult the docs for more info.
  generateSW({
    cacheId: PROJECT_INFO.cacheId,
    globDirectory: PROJECT_INFO.buildDistDir,
    swDest: path.join(PROJECT_INFO.buildDistDir, 'sw.js'),
    globPatterns: ['**/*.{html,css,js}'],
    mode: PROJECT_INFO.buildMode,
  }).then(() => {
    console.log('Service worker generated.');
    return true;
  });
}

/**
 * Get a {@link module:tools/file-utils~Replacement} object suitable for replacing
 * the script name in a script tag. Note the script name is used for the search
 * but the entire path will be replaced.
 * @param {string} scriptName - name to find and replace
 * @param {string} replacementName - the substitution name
 * @param {string} filetype - the filetype this substitution will be applied to.
 * @returns {module:tools/file-utils~Replacement}
 */
export function getScriptReplacement(scriptName, replacementName, filetype) {
  const scriptNameEscaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchRe = new RegExp(
    `(<script .*?src\\s*=\\s*["']).*?${scriptNameEscaped}(["'].*?>)`,
    'gi'
  );
  const sub = `$1${replacementName}$2`;
  return {
    search: searchRe,
    sub: sub,
    filetype: filetype,
  };
}

/**
 * Copy HTML file to the build folder.
 * References to the entry script are replaced by the bundled script name.
 * @param {string} htmlFilePath - path to the html file to copy.
 * @return {Promise} Fulfills to the target path of the resulting file.
 */
export function copyHtmlFileToBuildRoot(htmlFilePath) {
  const basename = FileManager.getBasename(htmlFilePath);
  const scriptName = FileManager.getBasename(PROJECT_INFO.entryScript);
  const filetype = FileManager.getFileType(basename);

  const transformer = PROJECT_TRANSFORMER;
  transformer.replacements.push(
    getScriptReplacement(scriptName, PROJECT_INFO.bundleName, filetype)
  );
  return FileManager.copyFile(
    htmlFilePath,
    path.join(PROJECT_INFO.buildDistDir, basename),
    transformer
  );
}

/** Extract a header block from the content. The header block is the first
 * javascript comment block that begins with /**. Each line is expected to start
 * with a * character as with normal JSDoc blocks.
 * @param {string} content - the text to search
 * @returns {string} the header.
 */
export function extractHeader(content) {
  const lines = content.split('\n');
  const HEADER_STATES = {
    searching: 'searching',
    building: 'building',
    complete: 'complete',
  };

  const header = [];
  let headerState = HEADER_STATES.searching;

  for (const line of lines) {
    const matches = line.match(/^\s*(\/\*\*|\*\/|\*) ?(.*)$/);
    if (matches) {
      switch (matches[1]) {
        case '/**':
          headerState = HEADER_STATES.building;
          if (matches[2] !== '') {
            header.push(matches[2]);
          }
          break;
        case '*':
          if (headerState === HEADER_STATES.building) {
            header.push(matches[2]);
          }
          break;
        case '*/':
          headerState = HEADER_STATES.complete;
          break;
      }
    }
    if (headerState === HEADER_STATES.complete) {
      break;
    }
  }
  return header.join('\n');
}

/**
 * Transpile the code using Babel. Configuration options are picked up from
 * 'babel.config.json' file by Babel.
 * @param {string} filepath
 * @returns {Promise} fulfils to undefined.
 */
export function transpile(filepath) {
  return babel
    .transformFileAsync(filepath)
    .then((result) => fsPromises.writeFile(filepath, result.code, 'utf-8'));
}
