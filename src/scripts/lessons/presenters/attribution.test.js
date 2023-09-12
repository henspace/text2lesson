/**
 * @file Test attributions
 *
 * @module lessons/presenters/attribution.test
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

import { beforeEach, test, expect } from '@jest/globals';
import { getAttributions } from './attributions.js';
import { parseMarkdownSpanOnly } from '../../utils/text/textProcessing.js';

beforeEach(() => {
  document.body.innerHTML = '';
});

test('Complete image parsed', () => {
  const altText = 'alt text';
  const imageUrl = 'https://image.png';
  const title = 'my title';
  const sourceUrl = 'https://source.png';
  const authors = 'henspace, et al';
  const licenceName = 'A LICENCE';
  const licenceUrl = 'https://licence.md';
  const notes = 'image cropped';

  const image = document.createElement('img');
  image.setAttribute('src', imageUrl);
  image.setAttribute('alt', altText);
  image.setAttribute(
    'title',
    `${title}|${sourceUrl}|${authors}|${licenceName}|${licenceUrl}|${notes}`
  );
  document.body.appendChild(image);

  const attributions = getAttributions(document.body).element;

  expect(attributions.outerHTML).toMatch(
    /^<ul class="attributions">\s*<li class="attribution">.+<\/li>\s*<\/ul>$/
  );
  expect(attributions.outerHTML).toMatch(
    `<span>` +
      `<a href="${sourceUrl}" target="_blank">${title}</a>` +
      `<span class="printable-link for-print-only">(${sourceUrl})</span>` +
      `</span>`
  );
  expect(attributions.outerHTML).toMatch(`<span> by ${authors}</span>`);
  expect(attributions.outerHTML).toMatch(
    `<span>` +
      `, licence: <a href="${licenceUrl}" target="_blank">${licenceName}</a>` +
      `<span class="printable-link for-print-only">(${licenceUrl})</span>` +
      `</span>`
  );
  expect(attributions.outerHTML).toMatch(`<span> [${notes}]</span>`);
});

test('Image with just title and source parsed', () => {
  const altText = 'alt text';
  const imageUrl = 'https://image.png';
  const title = 'my title';
  const sourceUrl = 'https://source.png';
  const authors = undefined;
  const licenceName = undefined;
  const licenceUrl = undefined;
  const notes = undefined;

  const image = document.createElement('img');
  image.setAttribute('src', imageUrl);
  image.setAttribute('alt', altText);
  image.setAttribute(
    'title',
    `${title}|${sourceUrl}|${authors}|${licenceName}|${licenceUrl}|${notes}`
  );
  document.body.appendChild(image);

  const attributions = getAttributions(document.body).element;

  expect(attributions.outerHTML).toMatch(
    /^<ul class="attributions">\s*<li class="attribution">.+<\/li>\s*<\/ul>$/
  );
  expect(attributions.outerHTML).toMatch(
    `<span>` +
      `<a href="${sourceUrl}" target="_blank">${title}</a>` +
      `<span class="printable-link for-print-only">(${sourceUrl})</span>` +
      `</span>`
  );
});

test('Image with just plain title parsed as markdown', () => {
  const title = 'my **title** in bold';
  const expectedTitle = parseMarkdownSpanOnly(title);

  const image = document.createElement('img');
  image.setAttribute('src', 'https://someurl');
  image.setAttribute('alt', 'some alt text');
  image.setAttribute('title', title);
  document.body.appendChild(image);

  const attributions = getAttributions(document.body).element;

  expect(attributions.outerHTML).toMatch(
    /^<ul class="attributions">\s*<li class="attribution">.+<\/li>\s*<\/ul>$/
  );
  expect(attributions.outerHTML).toMatch(`<span>${expectedTitle}</span>`);
});
