/**
 * @file Simple test server
 *
 * @module tools/server/server.js
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

/**
 * @name "server.js"
 * @global
 * @description
 * Simple test server.
 * Usage server folder [port]
 */

/*global process */
import * as http from 'http';
import * as path from 'node:path';
import { existsSync, lstatSync } from 'node:fs';
import { RequestListener } from './requestListener.js';

if (process.argv.length < 3 || process.argv.length > 4) {
  throw new Error('Incorrect arguments.\nUsage server folder [port]');
}

const ROOT = path.join(process.cwd(), process.argv[2]);
const relativePath = path.relative(process.cwd(), ROOT);

if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
  throw new Error(
    `The test server can only serve files from within the current working folder.`
  );
}

if (!existsSync(ROOT)) {
  throw new Error(`The root folder ${ROOT} does not exist.`);
}

if (!lstatSync(ROOT).isDirectory()) {
  throw new Error(`The root ${ROOT} is not a folder.`);
}

const HOST = '127.0.0.1';
const PORT = process.argv[3] ?? 8080;
const reqListener = new RequestListener(ROOT);

http.createServer(reqListener.listener).listen(PORT, HOST, () => {
  console.log(
    `Server running on http://${HOST}:${PORT}.\nServing from ${ROOT}`
  );
});
