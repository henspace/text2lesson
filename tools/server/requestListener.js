/**
 * @file Simple base request listener
 *
 * @module tools/server/requestListener.js
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

import * as fsPromise from 'node:fs/promises';
import * as url from 'node:url';
import * as path from 'node:path';

/**
 * Escape sequences for terminal output. Key/value pais
 * @type {Object<string, string>}
 */
const Escape = {
  BG_BLACK: '\x1b[40m',
  BG_RED: '\x1b[41m',
  BG_WHITE: '\x1b[47m',
  FG_BLACK: '\x1b[30m',
  FG_RED: '\x1b[31m',
  FG_WHITE: '\x1b[37m',
  RESET: '\x1b[0m',
};

/**
 * Enumerated status codes.
 * @enum {number}
 */
const StatusCode = {
  OK: 200,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

/**
 * @typedef {Object} HeaderInfo
 * @property {string} name
 * @property {string} value
 */

/**
 * Header keys for arrays of {@link HeaderInfo} objects.
 * @type {Object<string, HeaderInfo[]> }
 */
const HEADERS = {
  css: [{ name: 'Content-Type', value: 'text/css' }],
  csv: [
    { name: 'Content-Type', value: 'text/csv' },
    { name: 'Content-Disposition', value: 'attachment;filename=__filename__' },
  ],
  cur: [{ name: 'Content-Type', value: 'image/x-icon' }],
  gif: [{ name: 'Content-Type', value: 'image/gif' }],
  html: [{ name: 'Content-Type', value: 'text/html' }],
  ico: [{ name: 'Content-Type', value: 'image/x-icon' }],
  jpeg: [{ name: 'Content-Type', value: 'image/jpeg' }],
  jpg: [{ name: 'Content-Type', value: 'image/jpeg' }],
  json: [{ name: 'Content-Type', value: 'application/json' }],
  js: [{ name: 'Content-Type', value: 'text/javascript' }],
  map: [{ name: 'Content-Type', value: 'application/json' }],
  md: [{ name: 'Content-Type', value: 'text/markdown' }],
  mp3: [{ name: 'Content-Type', value: 'audio/mpeg' }],
  mp4: [{ name: 'Content-Type', value: 'video/mp4' }],
  mpeg: [{ name: 'Content-Type', value: 'video/mpeg' }],
  png: [{ name: 'Content-Type', value: 'image/png' }],
  svg: [{ name: 'Content-Type', value: 'image/svg+xml' }],
  ttf: [{ name: 'Content-Type', value: 'font/ttf' }],
  txt: [{ name: 'Content-Type', value: 'text/plain' }],
  woff: [{ name: 'Content-Type', value: 'font/woff' }],
  woff2: [{ name: 'Content-Type', value: 'font/woff2' }],
};

/**
 *
 * @param {*} pathname
 * @returns {HeaderInfo[]}
 */
function getHeadersForPath(pathname) {
  const extension = path.extname(pathname);
  return HEADERS[extension.substring(1).toLowerCase()];
}

/**
 * @typedef {Object} ResponseDetail
 * @property {number} status
 * @property {HeaderInfo[]} headers
 * @property {string | Buffer} content
 */

/**
 * Get response details for an plain text message. This is normally used for
 * 404 or 500 messages.
 * @returns {ResponseDetail}
 */
function getTextResponseDetails(status, message) {
  console.log(
    `${Escape.BG_RED}${Escape.FG_WHITE}Status: ${status}. Message: ${message}${Escape.RESET}`
  );
  return {
    status: status,
    headers: [{ name: 'Content-Type', value: 'text/plain' }],
    content: message,
  };
}

/**
 * Get details for the response.
 * @param {string} root - the root path
 * @param {URL} requestedUrl - the requested path
 * @returns {ResponseDetail}
 */
function getResponseDetail(root, requestedUrl) {
  let detail = {};
  let pathname = decodeURIComponent(requestedUrl.pathname);
  if (pathname === '' || pathname === '/') {
    pathname = 'index.html';
  }
  const fullpath = path.join(root, pathname);
  const relativePath = path.relative(root, fullpath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return Promise.resolve(
      getTextResponseDetails(
        StatusCode.FORBIDDEN,
        `Access to path ${pathname} is forbidden.`
      )
    );
  }
  const filename = path.basename(pathname);
  detail.headers = getHeadersForPath(pathname);
  if (!detail.headers) {
    return Promise.resolve(
      getTextResponseDetails(
        StatusCode.SERVER_ERROR,
        `Filetype for ${filename} is not currently supported by the test server.`
      )
    );
  }
  detail.headers.forEach((header) => {
    header.value.replace('__filename__', filename);
  });

  return fsPromise
    .readFile(fullpath)
    .then((fileContent) => {
      detail.status = StatusCode.OK;
      detail.content = fileContent;
      return detail;
    })
    .catch((error) => {
      return getTextResponseDetails(StatusCode.NOT_FOUND, error.message);
    });
}

/**
 * RequestListener for use by http server.
 */
export class RequestListener {
  #root;
  /**
   * Listener for hander
   * @param {string} root - path from where files are served
   */
  constructor(root) {
    if (!root) {
      throw new Error('No root folder provided');
    }
    this.#root = root;
  }

  /**
   * Get a listener fuction for use with the http server.
   * @returns {function(ClientRequest, ServerResponse)}
   */
  get listener() {
    return (req, res) => {
      const requestedUrl = url.parse(req.url);
      const filename = path.basename(requestedUrl.pathname);
      console.log(
        `Request. path="${requestedUrl.pathname}", filename="${filename}"`
      );
      getResponseDetail(this.#root, requestedUrl).then((detail) => {
        detail.headers.forEach((header) => {
          res.setHeader(header.name, header.value);
        });
        res.writeHead(detail.status);
        res.end(detail.content);
      });
    };
  }
}
