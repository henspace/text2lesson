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

export function getAutoRunHtml(b64Title, b64LessonData) {
  const rootUrl = window.location.href.replace(/index\.html(\?.*)?$/, '');
  const loaderUrl = `${rootUrl}session-data-builder.html`;
  const appUrl = `${rootUrl}index.html`;

  return `<!DOCTYPE html>
<!-- 
This file embeds the session-data-builder in an iframe and then 
builds up the lesson in session storage as base64 encoded data.
Once fully loaded, the iframe src is replaced by the full text2lesson application.
-->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>$_PRODUCT_NAME_TXT_$: Embedded lesson runner</title>
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      html {
        height: -webkit-fill-available; 
      }
      body {
        overflow: hidden;
      }
      #progress {
        padding: 1em;
        position: absolute;
        width: 60vw;
        margin-top: 50vh;
        left: 0;
        top: 0;
        z-index: 10;
      }
      iframe {
        border: 0;
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <iframe id="data-loader"></iframe>
    <div id="progress">Loading $_PRODUCT_NAME_TXT_$:</div>
  </body>
  <script>
    const LESSON_TITLE_B64 = "${b64Title}";
    const LESSON_SOURCE_B64 = "${b64LessonData}";

    const LOADER_URL = '${loaderUrl}';
    const APPLICATION_URL = '${appUrl}';
    const loader = document.getElementById('data-loader');
    const progress = document.getElementById('progress');
    const dataChunks = LESSON_SOURCE_B64.match(/.{1,1800}/g);
    let index = -1;
    loaded = false;
    const eventListener = loader.addEventListener('load', () => {
      if (loaded) {
        return;
      }
      progress.innerHTML += ' .';
      if (index < dataChunks.length) {
        if (index < 0) {
          loader.src = \`\${LOADER_URL}?title=\${encodeURI(LESSON_TITLE_B64)}\`;
          index++;
        } else {
          loader.src = \`\${LOADER_URL}?data=\${encodeURI(dataChunks[index++])}\`;
        }
      } else {
        loader.src = APPLICATION_URL;
        loaded = true;
        progress.style.display = 'none';
      }
    });
    loader.src = \`\${LOADER_URL}\`;
  </script>
</html>
`;
}
