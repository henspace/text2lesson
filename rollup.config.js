/**
 * @file Configuration for Rollup.
 * Where possible, all properties are obtained from the *ProjectInfo* object.
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

import { PROJECT_INFO } from './project-info.js';
import * as format from './tools/ansi-format.js';

const buildMode = PROJECT_INFO.buildMode;

console.log(format.toBigHeading(`Rollup operations in ${buildMode} mode.`));

export default {
  input: PROJECT_INFO.entryScript,
  output: {
    file: PROJECT_INFO.bundleFilePath,
    format: 'iife',
  },
  plugins: [],
};
