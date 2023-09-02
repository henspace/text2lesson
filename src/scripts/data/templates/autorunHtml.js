/**
 * @file Template for the autorun html template
 *
 * @module src/assets/templates/autorunHtml.js
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
import { Urls } from '../urls.js';

/**
 * Get the HTML for the autorun file.
 * @param {Object} data
 * @param {string} data.b64Title - lesson title in base64
 * @param {string} data.b64LessonData - lesson definition text in base64
 * @param {string} data.b64Translations - translations from i18 in base64
 */
export function getAutorunHtml(data) {
  let rootUrl = Urls.NON_LOCAL_ROOT; // scripts cannot run from localhost
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Text2Lesson</title>
      <link
        rel="icon"
        type="image/png"
        sizes="48x48"
        href="${rootUrl}assets/images/favicon.appiconset/favicon_48.png"
      />
      <link
        rel="apple-touch-icon"
        type="image/png"
        sizes="167x167"
        href="${rootUrl}assets/images/favicon.appiconset/favicon_167.png"
      />
      <link
        rel="apple-touch-icon"
        type="image/png"
        sizes="180x180"
        href="${rootUrl}assets/images/favicon.appiconset/favicon_180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="${rootUrl}assets/images/favicon.appiconset/favicon_192.png"
      />
  
      <link rel="stylesheet" href="${rootUrl}assets/styles/style.css" />
      <link
        href="${rootUrl}assets/third-party/font-awesome/css/fontawesome.min.css"
        rel="stylesheet"
      />
      <link
        href="${rootUrl}assets/third-party/font-awesome/css/brands.min.css"
        rel="stylesheet"
      />
      <link
        href="${rootUrl}assets/third-party/font-awesome/css/solid.min.css"
        rel="stylesheet"
      />
    </head>
  <script>
      window.text2LessonEmbeddedData = {
        title: "${data.b64Title}",
        source: "${data.b64LessonData}",
        translations: "${data.b64Translations}",
        rootUrl: "${rootUrl}",
      }    
  </script>
    <body>
      <div id="modal-mask"></div>
      <div id="title-bar"></div>
      <div id="content" class="container">
        <div id="stage">
          <p style="line-height: 100vh; text-align: center; opacity: 0.5">
            The application is loading. Please wait a few moments.
          </p>
        </div>
      </div>
      <div id="footer" class="container"></div>
      <script type="module" src="${rootUrl}text2lesson.js"></script>
      <noscript class="always-on-top">
        <p>
          Your browser does not support scripts and so this application cannot
          run. If you've disabled scripts, you will need to enable them to
          proceed. Sorry.
        </p>
      </noscript>
      <div id="browser-css-not-supported">
        <p>
          Sorry, but your browser does not support the features necessary to run
          this application. Try upgrading your browser to the latest version.
        </p>
      </div>
    </body>
  </html>
  `;
}
