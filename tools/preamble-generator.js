/**
 * @file Create a preamble comment block
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

import { PROJECT_INFO, PROJECT_TRANSFORMER } from '../project-info.js';
import { readFileSync } from 'node:fs';

/**
 * Create a comment block for embedding in bundled files as a preamble.
 * $_BUILD_YEAR_$ is replace with the current year. The text source is assumed
 * not to be plain text and not formatted as a JavaScript comment. The
 * formatting is added automatically.
 * @param {string} licencePath - path to the licence to use
 * @returns {string} - JavaScript comment block.
 */
export function createCommentBlock(licencePath) {
  var buffer = readFileSync(licencePath);
  buffer = PROJECT_TRANSFORMER.transform(buffer, 'TXT');
  const content = buffer.toString('utf8');
  return (
    `/**\n * ${PROJECT_INFO.appName} ${PROJECT_INFO.appVersion}\n` +
    `${content.replaceAll(/^/gm, ' * ')}\n */`
  );
}
