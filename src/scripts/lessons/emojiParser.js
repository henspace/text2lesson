/**
 * @file Convert an emoji to html representation.
 *
 * @module lessons/emojiParser
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

import { i18n } from '../libs/utils/i18n/i18n.js';
import { getErrorAttributeHtml } from '../libs/utils/errorHandling/errors.js';

/**
 * Array of predefined emojis. All keys must be in lowercase. Do not use underscores
 * as these could be misconstrued as emphasis characters.
 */
export const PREDEFINED_EMOJIS = {
  GRINNING: '&#x1F600;',
  ')': '@GRINNING',
  '-)': '@GRINNING',
  SMILEY: '@GRINNING',
  SMILING: '@GRINNING',
  HAPPY: '@GRINNING',

  WORRIED: '&#x1F61F;',
  SAD: '@WORRIED',

  LAUGHING: '&#x1F602;',
  LAUGH: '@LAUGHING',

  CRYING: '&#x1F622;',
  TEAR: '@CRYING',

  FROWNING: '&#x1F641;',
  '(': '@FROWNING',
  '-(': '@FROWNING',

  NEUTRAL: '&#x1F610;',

  ANGRY: '&#x1F620;',
  GRUMPY: '@ANGRY',

  WINK: '&#x1F609;',
  WINKY: '@WINK',
  WINKING: '@WINK',

  WARNING: '&#x26A0;&#xFE0F;',
  ALERT: '@WARNING',
  ERROR: '@WARNING',

  'WHITE-QUESTION-MARK': '&#x2754;',
};

/**
 * Get emojis as HTML characters. If a blank string or null is passed in, the
 * function returns a single space.
 * @param {string} originalDefinition - definition for the emoji. This can be
 * a named emoji in the {@link PREDEFINED_EMOJIS} or a sequence of Unicode
 * characters in the format U+xxxxx. The definition is not case sensitive.
 * @returns {string}
 */
export function getEmojiHtml(originalDefinition) {
  if (!originalDefinition) {
    console.log('blank emoji');
    return ' ';
  }
  const definition = originalDefinition.toUpperCase();
  if (definition.startsWith('U+')) {
    return definition.replaceAll(/U\+([A-F0-9]+)/g, '&#x$1;');
  } else {
    let code = PREDEFINED_EMOJIS[definition];
    if (code?.startsWith('@')) {
      code = PREDEFINED_EMOJIS[code.substring(1)];
    }
    if (!code) {
      const errorAttribute = getErrorAttributeHtml(
        i18n`Cannot find emoji ${originalDefinition}`
      );
      return `<span ${errorAttribute}>${PREDEFINED_EMOJIS['WHITE-QUESTION-MARK']}</span>`;
    }
    return code;
  }
}
