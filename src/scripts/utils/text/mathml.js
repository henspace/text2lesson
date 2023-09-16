/**
 * @file Support for MathMl
 *
 * @module utils/text/mathml
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
import { NON_LOCAL_ROOT_URL } from '../../data/rootUrl.js';

const FALLBACK_TESTING = false;

/**
 * Parse a MathML block. All we need to do is sanitise it.
 * Any href tag is replaced. This removes xlink hrefs as well.
 * @param {string} html - a MathML block that has already been escaped.
 * @param {module:parsingWarden.ParsingWarden} warden
 * @returns {string} original data with MathML block protected by warden.
 */
function parseMathMlBlock(html, warden) {
  html = html.replace(/href\s*="[^"]*"/g, '');
  html = html.replace(/<(?!semantics|annotation|[m/])/g, '&lt;'); // escape all non-mathML tags
  if (FALLBACK_TESTING) {
    html = html.replace(/^<math/g, '<div class = "mathml-fallback-test"');
    html = html.replace(/<\/math>$/g, '</div>');
  }
  return warden.protect(html);
}

/**
 * Parse MathML.
 * @param {string} data - text that might contain MathML blocks. These should
 * not have been escaped.
 * @param {module:parsingWarden.ParsingWarden} warden
 * @returns {string} original data with all MathML blocks protected by warden.
 */
export function parseMathMl(data, warden) {
  return data.replace(/<math[^>]*?>.*<\/math>/gs, (match) => {
    return parseMathMlBlock(match, warden);
  });
}

/**
 * Checks to see if MathMl is supported. If not the fallback css is loaded.
 * Use of mspace test derived from [Fred Wang mspace](https://github.com/fred-wang/mathml.css/blob/gh-pages/mspace.js)
 */
export function addMathMlCssFallback() {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  const testWidth = 100;
  const testHeight = 20;
  const mathTag = FALLBACK_TESTING ? 'mathfallback' : 'math';
  container.innerHTML = `<${mathTag} xmlns="http://www.w3.org/1998/Math/MathML"><mspace width="${testWidth}px" height="${testHeight}px"></mspace></${mathTag}>`;
  document.body.appendChild(container);
  if (
    container.offsetWidth < testWidth ||
    container.offsetHeight < testHeight
  ) {
    console.debug('MathMl not supported so loading fallback CSS');
    const cssLink = document.createElement('link');
    cssLink.href = `${NON_LOCAL_ROOT_URL}assets/styles/mathml.css`; // can't load local css if autorun file.
    cssLink.rel = 'stylesheet';
    document.head.appendChild(cssLink);
  } else {
    console.debug('MathMl supported by browser');
  }
  container.remove();
}

/**
 * Replace display attribute in math tag with inline version.
 * @param {string} html
 * @returns {string}
 */
export function setMathsMlInline(html) {
  return html.replace(/<math[^>]*?>/g, (match) => {
    return match.replace(/display\s*=\s*"\w*"/, 'display="inline"');
  });
}
