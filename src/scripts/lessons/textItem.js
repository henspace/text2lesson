/**
 * @file Base item parser for a problem item.
 *
 * @module lessons/textItem
 *
 * @license GPL-3.0-or-later
 * Rapid Q and ACreate quizzes and lessons from plain text files.
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

import * as textProcessing from '../utils/text/textProcessing.js';
import { getEmojiHtml } from './emojiParser.js';
import { getErrorAttributeHtml } from '../utils/errorHandling/errors.js';
import { i18n } from '../utils/i18n/i18n.js';
import { ManagedElement } from '../utils/userIo/managedElement.js';

/**
 * Safe classes for items. This prevents users providing a class that might corrupt
 * the presentation of data. Class names in the array must be in lowercase.
 * @type {string[]}
 */
const SAFE_CLASSES = [
  'big',
  'bigger',
  'biggest',
  'small',
  'smaller',
  'smallest',
];

/**
 * Get a safe class from the array of SAFE_CLASSES. The requested class is
 * case insensitive. If the `requestedClass` is not safe, an empty string is
 * returned.
 * @param {string} requestedClass
 * @returns {string}
 */
function makeClassSafe(requestedClass) {
  if (!requestedClass) {
    return '';
  }
  const index = SAFE_CLASSES.indexOf(requestedClass.toLowerCase());
  return index < 0 ? '' : SAFE_CLASSES[index];
}

/**
 * Replacement class that allows retention of items that have been replaced.
 * This is primarily used for tracking missing words.
 */
class TrackedReplacements {
  /** list of missing words in the order they appeared in the source. */
  #missingWords;

  /**
   * Replacements used for converting source.
   * @type {module:libs/utils/text/textProcessing~Replacement[]}
   */
  #replacements;

  /**
   * @returns {string[]} copy of the missing words.
   */
  get missingWords() {
    return [...this.#missingWords];
  }

  /**
   * Get the replacements to use.
   * @returns {module:libs/utils/text/textProcessing~Replacement[]}
   */
  get replacements() {
    return this.#replacements;
  }

  /**
   * @param {Metadata} [metadata] - Metadata used in substitutions
   */
  constructor(metadata) {
    this.#missingWords = [];
    const tracker = this;
    this.#replacements = [
      {
        re: /\\>/g,
        rep: '&gt;',
      },
      getItemReplacement('[.]{3}', (match, startChr, word) => {
        tracker.#missingWords.push(word);
        return `${startChr}<span class="missing-word" data-missing-word="${ManagedElement.encodeString(
          word
        )}"></span>`;
      }),
      getItemReplacement('emoji:', (match, startChr, word, emojiClass) => {
        let requiredClasses = 'emoji';
        emojiClass = makeClassSafe(emojiClass);
        if (emojiClass) {
          requiredClasses = `${requiredClasses} ${emojiClass}`;
        }
        return `${startChr}<span class="${requiredClasses}">${getEmojiHtml(
          word
        )}</span>`;
      }),
      getItemReplacement('meta:', (match, startChr, word) => {
        const metavalue = metadata?.getValue(word);
        if (!metavalue) {
          const errorAttribute = getErrorAttributeHtml(
            i18n`Cannot find metadata ${word}`
          );
          return `${startChr}<span ${errorAttribute}>${word}</span>`;
        }
        return `${startChr}${metavalue}`;
      }),
    ];
  }
}

/**
 * Basic lesson text item.
 */
export class TextItem {
  /**
   * flag to mimic private constructor.
   */
  static #isConstructing = false;
  /**
   * Parsed source to create html.
   * @type {string}
   */
  #html = '';

  /**
   * Missing words.
   * @type {string[]}
   */
  #missingWords = [];

  /**
   * Metadata used in substitutions.
   * @type {Metadata}
   */
  #metadata;

  /**
   * @param {Metadata} metadata - Metadata used for substitutions.
   */
  constructor(metadata) {
    if (!TextItem.#isConstructing) {
      throw new Error('Private constructor. Use createTextItem');
    }
    this.#metadata = metadata;
  }

  /**
   * Get the html.
   * @returns{string}
   * */
  get html() {
    return this.#html;
  }

  /**
   * Get a plain text version
   */
  get plainText() {
    return this.#html
      .replace(/<(?:[^>]*missing-word[^>]*)>/g, '...')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Get the missing words.
   * @returns {string[]}
   * */
  get missingWords() {
    return this.#missingWords;
  }

  /**
   * Create a TextItem from the source.
   * @param {string} source - source text using the light version of Markdown.
   * @param {Metadata}  [metadata] - metadata
   * @returns {TextItem}
   */
  static createFromSource(source, metadata) {
    TextItem.#isConstructing = true;
    const textItem = new TextItem();
    TextItem.#isConstructing = false;
    if (source) {
      const tracker = new TrackedReplacements(metadata);
      textItem.#html = textProcessing.parseMarkdown(source, {
        post: tracker.replacements,
      });
      textItem.#missingWords = tracker.missingWords;
    }
    return textItem;
  }

  /**
   * Extract the first word from the item.
   * @returns {string} empty string if no word found.
   */
  get firstWord() {
    const match = this.#html?.match(
      /^(?:\s*(?:<\/?[^\r\n\f\t]*?>)*\s*)*([^\s<]*)/
    );
    if (match) {
      return match[1]; // get the first word
    } else {
      return '';
    }
  }
}

/**
 * Create a `Replacement` object for finding lession items in the source.
 * Important: any groups contained within `prefix`
 * *must be non-capturing*. The regex provides a number of capture groups.
 * The format of and item expression is expected to be as follows:
 *
 * + prefixWORD>class
 *
 * Note: WORD and >class are optional. If the > character is provided without a
 * following class, the class will be empty.
 *
 * + $1 - the character preceding the prefix. This should normally be restored by the replacement.
 * + $2 - the *WORD* following the prefix.
 * + $3 - the *class* without the preceding *>* character.
 *
 * The item must be on a word boundary. As the text could be enclosed within
 * HTML tags, the starting word boundary is the start of a line, a whitespace
 * character or a `>` character. The ending word boundary is the end of a line,
 * a whitespace character, standard punctuation (,;:.!?) or any closing HTML tag.
 *
 * @param {string} prefix - string which forms part of RegExp constructor to identify
 * the start of the item. This should not include any capturing groups.
 * @param {*} replace - function or replacement string.
 * @returns {module:libs/utils/text/textProcessing~Replacement}
 */
export function getItemReplacement(prefix, replace) {
  const startCapture = '(^|[ >])';
  const wordCapture = '((?:&#?[a-zA-Z0-9]+?;|[^\\s<>])+?)?';
  const classCapture = '(?:>([a-zA_Z]*))?';
  const endLookAhead = '(?=[\\s,;:.?!]|$|</.+?>)';

  const re = new RegExp(
    `${startCapture}${prefix}${wordCapture}${classCapture}${endLookAhead}`,
    'gmi'
  );
  return {
    re: re,
    rep: replace,
  };
}
