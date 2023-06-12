/**
 * @file Test emojis
 *
 * @module lessons/emojiParser.test
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

import * as emoji from './emojiParser.js';
import { test, expect } from '@jest/globals';

test('All predefined emojis resolve to HTML code', () => {
  for (let key in emoji.PREDEFINED_EMOJIS) {
    key = key.toUpperCase(); // convert because all provided keys are converted to lowercase
    let code = emoji.PREDEFINED_EMOJIS[key];
    if (code.startsWith('@')) {
      code = emoji.PREDEFINED_EMOJIS[code.substring(1)];
    }
    expect(code).toMatch(/^(&#x[0-9a-fA-F]{4,};)+$/);
  }
});

test('getEmojiHtml handles named emoji', () => {
  for (const key in emoji.PREDEFINED_EMOJIS) {
    let code = emoji.PREDEFINED_EMOJIS[key];
    if (code.startsWith('@')) {
      code = emoji.PREDEFINED_EMOJIS[code.substring(1)];
    }
    expect(emoji.getEmojiHtml(key)).toBe(code);
  }
});

test('getEmojiHtml handles null emoji and returns a single space', () => {
  expect(emoji.getEmojiHtml(null)).toBe(' ');
});

test('getEmojiHtml handles unicode format emoji', () => {
  for (let n = 1; n < 0xfffff; n += 50) {
    const hex = n.toString(16).padStart(4, '0');
    const unicode = `U+${hex}`;
    const html = emoji.getEmojiHtml(unicode);
    expect(html).toBe(`&#x${hex.toUpperCase()};`);
  }
});

test('getEmojiHtml handles unicode format emoji with multiple characters', () => {
  for (let n = 1; n < 0xfffff; n += 50) {
    const hex = n.toString(16).padStart(4, '0');
    const hex2 = (n + 10).toString(16).padStart(4, '0');
    const unicode = `U+${hex}U+${hex2}`;
    const html = emoji.getEmojiHtml(unicode);
    expect(html).toBe(`&#x${hex.toUpperCase()};&#x${hex2.toUpperCase()};`);
  }
});
