/**
 * @file Utility script to run an npm script with the process
 * variable *process.env.NODE_ENV* set either to *production* or *development*.
 * The default is *development*.
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
 * @name "run-in-dev.js"
 * @global
 * @description
 * Utility script that runs an npm script, setting the process
 * variable *process.env.NODE_ENV* set either to *production* or *development*.
 * The default is *development*.
 *
 * Usage:
 * run-in-env [-p|--prod|-d|--dev] scriptName
 * + -d, --dev: run in development mode (default)
 * + -p, --prod: run in production mode.
 * + scriptName: the script name in *package.json* scripts.
 *
 * The command will spawn the *npm* command with the *NODE_ENV* environment
 * set to the appropriate mode of 'development' or 'production'. Setting the
 * environment parameter is done in a cross platform manner.
 *
 * By spawing the script, the environment will remain valid for all scripts
 * invoked by the *npm* script.
 */

/*global process */
import * as format from './ansi-format.js';
import { spawn } from 'node:child_process';

/**
 * Test to see if running on windows.
 * @returns true if running on Windows.
 * @private
 */
function isWindows() {
  return process.platform.match(/^win32/i) ? true : false;
}

/**
 * Check if flag is set in the command line arguments. This should include the -
 * characters. E.g. -f.
 * @param {string} flag
 * @returns true if set.
 * @private
 */
function isFlagSet(flag) {
  return process.argv.indexOf(flag) > 1;
}

if (isFlagSet('-p') || isFlagSet('--prod')) {
  process.env.NODE_ENV = 'production';
} else if (isFlagSet('-d') || isFlagSet('--dev')) {
  process.env.NODE_ENV = 'development';
}

const npmScript = process.argv[process.argv.length - 1];
const npmCommand = isWindows() ? 'npm.cmd' : 'npm';

console.log(
  format.toBigHeading(
    `Spawning '${npmCommand} script ${npmScript}' with NODE_ENV set to ` +
      `'${process.env.NODE_ENV}'.`
  )
);

const child = spawn(npmCommand, ['run', npmScript]);

child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  //console.log(format.toError(`stderr: ${data}`));
  console.log(format.toError(data.toString()));
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}.`);
});
