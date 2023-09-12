/**
 * @file Test attribution reverser
 *
 * @module utils/text/attributionReverser.test
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

import { reverseAttributions } from './attributionsReverser.js';
import { test, expect } from '@jest/globals';

test('Reverse Wikimedia Commons embedded code', () => {
  const embed = `<a title="National Portrait Gallery
  , Public domain, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Elizabeth_of_York_from_Kings_and_Queens_of_England.jpg"><img width="256" alt="Elizabeth of York from Kings and Queens of England" src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Elizabeth_of_York_from_Kings_and_Queens_of_England.jpg/256px-Elizabeth_of_York_from_Kings_and_Queens_of_England.jpg"></a>`;

  const result = reverseAttributions(embed);
  const expected =
    `![Elizabeth of York from Kings and Queens of England]` +
    '(https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Elizabeth_of_York_from_Kings_and_Queens_of_England.jpg/256px-Elizabeth_of_York_from_Kings_and_Queens_of_England.jpg' +
    ' "' +
    'Elizabeth of York from Kings and Queens of England: ' +
    'National Portrait Gallery|' +
    'https://commons.wikimedia.org/wiki/File:Elizabeth_of_York_from_Kings_and_Queens_of_England.jpg|' +
    '|' +
    'Public domain|' +
    '|' +
    'via Wikimedia Commons' +
    '")';
  expect(result).toBe(expected);
});

test('Reverse Wikimedia structure', () => {
  const title = 'my title';
  const licenceName = 'A LICENCE';
  const licenceUrl = 'https://licenceurl';
  const sourceUrl = 'http://sourceUrl';
  const authors = '';
  const altText = 'some alt text';
  const imageUrl = 'https://imageUrl';
  const notes = 'via Wikimedia Commons';

  const embed = `<a title="${title}, ${licenceName} &lt;${licenceUrl}&gt;, via Wikimedia Commons" href="${sourceUrl}"><img width="256" alt="${altText}" src="${imageUrl}"></a>`;

  const result = reverseAttributions(embed);
  expect(result).toBe(
    `![${altText}](${imageUrl} "${altText}: ${title}` +
      `|${sourceUrl}|${authors}|${licenceName}|${licenceUrl}|${notes}")`
  );
});

test('Reverse Wikimedia Commons embedded code with CC licence', () => {
  const embed = `<a title="AndyScott, CC BY-SA 4.0 &lt;https://creativecommons.org/licenses/by-sa/4.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Pearly_Kings_and_Queens_Harvest_Festival_2019,_maypole_dance_(5).jpg"><img width="512" alt="Pearly Kings and Queens Harvest Festival 2019, maypole dance (5)" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Pearly_Kings_and_Queens_Harvest_Festival_2019%2C_maypole_dance_%285%29.jpg/512px-Pearly_Kings_and_Queens_Harvest_Festival_2019%2C_maypole_dance_%285%29.jpg"></a>`;

  const result = reverseAttributions(embed);
  const expected =
    `![Pearly Kings and Queens Harvest Festival 2019, maypole dance (5)]` +
    '(https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Pearly_Kings_and_Queens_Harvest_Festival_2019%2C_maypole_dance_%285%29.jpg/512px-Pearly_Kings_and_Queens_Harvest_Festival_2019%2C_maypole_dance_%285%29.jpg' +
    ' "' +
    'Pearly Kings and Queens Harvest Festival 2019, maypole dance (5): ' +
    'AndyScott|' +
    'https://commons.wikimedia.org/wiki/File:Pearly_Kings_and_Queens_Harvest_Festival_2019,_maypole_dance_(5).jpg|' +
    '|' +
    'CC BY-SA 4.0|' +
    'https://creativecommons.org/licenses/by-sa/4.0|' +
    'via Wikimedia Commons' +
    '")';
  expect(result).toBe(expected);
});

test('Reverse Wikimedia structure with new lines', () => {
  const title = 'my\ntitle';
  const expectedTitle = 'my title';
  const licenceName = 'A LICENCE';
  const licenceUrl = 'https://licenceurl';
  const sourceUrl = 'http://sourceUrl';
  const authors = '';
  const altText = 'some alt text';
  const imageUrl = 'https://imageUrl';
  const notes = 'via Wikimedia Commons';

  const embed = `<a \ntitle="${title},\n ${licenceName} &lt;${licenceUrl}&gt;, via Wikimedia Commons" href="${sourceUrl}"><img width="256" alt="${altText}" src="${imageUrl}"></a>`;

  const result = reverseAttributions(embed);
  expect(result).toBe(
    `![${altText}](${imageUrl} "${altText}: ${expectedTitle}` +
      `|${sourceUrl}|${authors}|${licenceName}|${licenceUrl}|${notes}")`
  );
});
