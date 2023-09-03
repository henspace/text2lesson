/**
 * @file Parser for a light version of Markdown
 *
 * @module utils/text/textProcessing
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

import { parseMaths } from './maths.js';

/**
 * @typedef {Object} Replacement
 * @property {RegExp} re - the expression to match.
 * @property {string | function(match, ...captures): string} rep - replacement. If a function is
 * passed, it is provided with the string that matched followed by the captured
 * groups.
 */

/**
 * Block replacements (flow). {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories}
 * When processing the Markdown, blocks are created. These are defined as blocks
 * of text separated by at least one blank line. The following replacements
 * are used for code which should be treated as independent blocks. To ensure
 * post processing is correct, they should insert two newlines at the end to
 * create an independent block.
 * @type {Replacement[]}
 */
const blockReps = [
  /** Setext heading 1 */
  {
    re: /(?:(.+)\n=+\n)/g,
    rep: '\n\n<h1>$1</h1>\n\n',
  },
  /** Setext heading 2 */
  {
    re: /(?:(.+)\n-+\n)/g,
    rep: '\n\n<h2>$1</h2>\n\n',
  },
  /** ATX heading. Any level. */
  {
    re: /^(#+)(?: *)(.+?)(?:#*)[ \t]*$/gm,
    rep: (matched, hashes, txt) => {
      const level = Math.min(hashes.length, 6);
      return `\n\n<h${level}>${txt.trim()}</h${level}>\n`;
    },
  },
  /** block quote */
  reAllLinesStartWith('>[ \t]*', {
    blockPrefix: '<blockquote>',
    blockSuffix: '</blockquote>',
  }),
  /** code block */
  reAllLinesStartWith('(?: {4}|\t)', {
    blockPrefix: '<pre><code>',
    blockSuffix: '</code></pre>',
    trimContents: true,
  }),
  /** horizontal rule. This must come before unordered lists to prevent interpretation of - as bullet */
  {
    re: /^(?:[*_-] *){3,}\s*$/gm,
    rep: '\n\n<hr>\n\n',
  },
  /** unordered list */
  reAllLinesStartWith(' {0,3}[*+-][ \t]*', {
    blockPrefix: '<ul>',
    blockSuffix: '</ul>',
    linePrefix: '<li>',
    lineSuffix: '</li>',
  }),
  /** ordered list */
  reAllLinesStartWith(' {0,3}\\d+\\.[ \t]*', {
    blockPrefix: '<ol>',
    blockSuffix: '</ol>',
    linePrefix: '<li>',
    lineSuffix: '</li>',
  }),
  /**
   * Maths equation
   */
  {
    re: /^\s*maths?:\s*(.+?)\s*$/gm,
    rep: (match, equation) => parseMaths(equation, false),
  },
  /** paragraphs of elements not in blocks */
  {
    re: /(?:(?:^|\n{2,})(?!<\w+>))((?:.(?:\n(?!\n))?)+)/g,
    rep: '\n\n<p>$1</p>\n\n',
  },
  /** tidy up */
  {
    re: /\n{2,}/g,
    rep: '\n\n',
  },
];

/**
 * Span replacements used for Markdown.
 * @type {Replacement[]}
 */
const spanReps = [
  /** inline maths
   */
  {
    re: /{maths?}(.+){maths?}/gm,
    rep: (match, equation) => parseMaths(equation, true),
  },
  /** image */
  {
    re: /!\[(.*)\]\((https?:\/\/[-\w@:%.+~#=/]+)(?: +"(.*)")?\)/gm,
    rep: `<img alt="$1" src="$2" title="$3"/>`,
  },
  /** link */
  {
    re: /\[(.*)\]\((https?:\/\/[-\w@:%.+~#=/]+)(?: +"(.*)")?\)/gm,
    rep: `<a target="_blank" href="$2" title="$3">$1</a>`,
  },
  /** automatic link */
  {
    re: /(?:&lt;|<)(https?:\/\/[-\w@:%.+~#=/]+)>/gm,
    rep: '<a target="_blank" href="$1">$1</a>',
  },
  /** automatic email */
  {
    re: /(?:&lt;|<)(\w+(?:[.-]?\w+)*@\w+(?:[.-]?\w+)*(?:\.\w{2,4})+)>/gm,
    rep: (match, address) => {
      const encoded = encodeToEntities(address);
      return `<a href="${encoded}">${encoded}</a>`;
    },
  },
  /** code */
  {
    re: /(?:`{2,}(.*?)`{2,}|`(.*?)`)/gm,
    rep: (match, codeA, codeB) => `<code>${codeA ?? codeB}</code>`,
  },
  /** emphasis */
  {
    re: /\*\*([^\s])(.*?)([^\s])\*\*/gm,
    rep: '<strong>$1$2$3</strong>',
  },
  {
    re: /__([^\s])(.*?)([^\s])__/gm,
    rep: '<strong>$1$2$3</strong>',
  },
  {
    re: /\*([^\s])(.*?)([^\s])\*/gm,
    rep: '<em>$1$2$3</em>',
  },
  {
    re: /_([^\s])(.*?)([^\s])_/gm,
    rep: '<em>$1$2$3</em>',
  },
];

/**
 * Escape replacements used for Markdown
 * @type {Replacement[]}
 */
const markdownEscReps = [
  {
    re: /\\([\\`*_{}[\]()#+.!-])/g,
    rep: (match, chr) => encodeCharToEntity(chr),
  },
];

/**
 * Replacements for security reasons.
 */
const securityReps = [
  {
    re: '\0',
    rep: '\ufffd',
  },
];

/**
 * Escape HTML
 * @type {Replacement}
 */
const htmlEscIgnoringBrReps = [
  {
    re: /&(?![\w#]+?;)/gm,
    rep: '&amp;',
  },
  {
    re: /<(?!\/?(?:br|sub|sup)>)/gim,
    rep: '&lt;',
  },
];

/**
 * Escape HTML
 * @type {Replacement}
 */
const htmlEscAllReps = [
  {
    re: /&(?![\w#]+?;)/gm,
    rep: '&amp;',
  },
  {
    re: /</gim,
    rep: '&lt;',
  },
];

/**
 * Clean up HTML
 */
const htmlCleanUpReps = [
  {
    re: /^\s*$/gm,
    rep: '',
  },
  {
    re: /<(?:p|div)>\s*?<\/(?:p|div)>/gim,
    rep: '',
  },
];

/**
 * Parse data using replacements.
 * @param {string} data - text to be parsed.
 * @param {Replacement} replacements - replacements to apply.
 * @returns {string}
 */
function processReplacements(data, replacements) {
  if (!data) {
    return data;
  }
  replacements.forEach((sub) => {
    data = data.replaceAll(sub.re, sub.rep);
  });
  return data;
}

/**
 * Create Replacement for consecutive block of lines that all begin with the
 * specified character. This will form part of a regular expression so should be
 * escaped if special characters are to be matched.
 * @param {string} reStart - expression to match at start of each line. NB. if this
 * is a group, it must be non-capturing.
 * @param {Object} [options] - options for the block formation.
 * @param {string} options.blockPrefix - characters placed at the beginning of the resulting block.
 * @param {string} options.blockSuffix - characters placed at the end of the resulting block.
 * @param {string} options.linePrefix - characters placed at the beginning of each resulting line.
 * @param {string} options.lineSuffix - characters placed at the end of each resulting line.
 * @param {boolean} options.trimContents - if true, leading and trailing newlines and carriage returns are stripped
 * from the block's contents
 * @returns {Replacement}
 */
function reAllLinesStartWith(reStart, options) {
  const reBlockSearchRe = new RegExp(
    `(?:^|\\n)${reStart}(?:.|\\n)*?(?:(\\n(?!${reStart}))|$)`,
    'g'
  );
  const lineReplacementRe = new RegExp(`^${reStart}(\\s*.*)$`, 'gm');
  const lineReplacement = `${options?.linePrefix ?? ''}$1${
    options?.lineSuffix ?? ''
  }`;
  return {
    re: reBlockSearchRe,
    rep: (match) => {
      let blockContents = match.replaceAll(lineReplacementRe, lineReplacement);
      if (options.trimContents) {
        blockContents = blockContents.replace(/^[\n\r]*/, '').trimEnd();
      }
      return `\n\n${options?.blockPrefix ?? ''}${blockContents}${
        options?.blockSuffix ?? ''
      }\n\n`;
    },
  };
}

/**
 * Encode character to HTML entity
 * @param {string} chr - character to encode. Although accepting a string, only the first
 * character is encoded.
 * @returns{string} HTML entity for first character.
 */
function encodeCharToEntity(chr) {
  return `&#${chr.charCodeAt(0).toString()};`;
}
/**
 * Encode a string to html entities.
 * @param {string} data
 * @returns {string}
 */
export function encodeToEntities(data) {
  let result = '';
  for (const chr of data) {
    result += encodeCharToEntity(chr);
  }
  return result;
}

/**
 * Decode html hex entities to string
 * @param {string} data
 * @returns {string}
 */
export function decodeFromEntities(data) {
  return data.replaceAll(/&#([0-9]{1,4});/g, (match, value) =>
    String.fromCharCode(parseInt(value))
  );
}

/**
 * Convert the Markdown data into HTML.
 * Before parsing the Markdown, any HTML special characters are escaped.
 * Note that note all Markdown is supported and there are some limitations.
 *
 * + Blockquotes: Lazy blockquotes are not supported. Each line must be preceded
 * by >. Also nested blockquotes are not supported.
 * + lists: only simple lists are supported. Blockquotes, code blocks and other
 * block elements cannot be included.
 * + Html: Inline HTML is not supported. This is not safe when merging HTML
 * generated from Markdown into existing elements and so, with the exception of
 * HTML entities and <br>, all HTML is escaped.
 * Entities such as &amp;copy; and line breaks <br> will not be escaped.
 * + Reference links: These are not supported.
 * + Automatic links: Markdown uses less than and greater than characters to
 * surround automatic links. However, the greater than character is converted to
 * an HTML entity before parsing the Markdown. This means that <...> or &lt;...>
 * will be interpreted as automatic links. If you want to prevent the contents
 * being interpreted as an automatic link, use the &gt; entity for the closing
 * tag.
 *
 *
 * @param {string} data
 * @param {Object} options - additional processing options.
 * @param {Replacement[]} options.pre - an array of Replacement objects which
 * are applied before any other processing is applied
 * @param {Replacement[]} options.post - an array of Replacement objects
 * which are applied after the markdown replacements have been made.
 * @returns Resulting html.
 */
export function parseMarkdown(data, options) {
  var result = data.replaceAll(/\r/g, ''); // normalise line endings
  result = processReplacements(result, securityReps);
  if (options?.pre) {
    result = processReplacements(result, options.pre);
  }
  result = processReplacements(result, htmlEscIgnoringBrReps);
  result = processReplacements(result, markdownEscReps);
  result = processReplacements(result, blockReps);
  result = processReplacements(result, spanReps);
  result = processReplacements(result, htmlCleanUpReps);

  if (options?.post) {
    result = processReplacements(result, options.post);
  }
  return result;
}

/**
 * Escapes html. No markdown is processed.
 * @param {string} data
 * @returns {string}
 */
export function escapeHtml(data) {
  data = processReplacements(data, securityReps);
  return processReplacements(data, htmlEscAllReps);
}

/**
 * Convert html into plain text
 * @param {string} html
 * @returns {string} the plain text
 */
export function getPlainTextFromHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
}
