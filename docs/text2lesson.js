(function () {
  'use strict';

  /**
   * @file Polyfill for String.replaceAll
   *
   * @module utils/polyfills/string
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

  /**
   * Implement replaceAll function if not already implemented.
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll}
   *
   * @param {string} str - the source string
   * @param {string | RegExp} pattern - the pattern to look for in the source string
   * @param {string} replacement - the replacement
   */

  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function stringReplaceAll(
      pattern,
      replacement
    ) {
      if (pattern instanceof RegExp) {
        if (pattern.flags.indexOf('g') < 0) {
          throw new TypeError(
            'String.prototype.replaceAll called with a non-global RegExp argument'
          );
        }
        return this.replace(pattern, replacement);
      } else {
        return this.replace(new RegExp(pattern, 'g'), replacement);
      }
    };
  }

  /**
   * @file Constants used by the application. In most cases these are items which
   * are replaced with the appropriate values during the build process.
   *
   * @module data/constants
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  /**
   * Build information. All values are provided via functions to allow the
   * application to be viewed with a server on the source *index.html* file
   * prior to build. The use of functions prevents constant replacements during build process.
   * @property {function():boolean} isBuilt - has the code been built.
   * This distinguishes versions which are being viewed directly from the source.
   * @property {function():string} mode - production or development
   * @property {function():string} version - build version
   * @property {function():string} bundleName - final bundle name including the extension
   */
  const BuildInfo = {
    isBuilt: () => BuildInfo.getMode().indexOf('$') < 0,
    getBuildDate: () => '$_BUILD_DATE_TXT_$',
    getBundleName: () => '$_BUNDLE_NAME_TXT_$',
    getProductName: () => '$_PRODUCT_NAME_TXT_$',
    getMode: () => '$_BUILD_MODE_TXT_$',
    getVersion: () => '$_APP_VERSION_TXT_$ ',
  };

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
      re: /<(?!br>)/gim,
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
        return `\n\n${options?.blockPrefix ?? ''}${match.replaceAll(
        lineReplacementRe,
        lineReplacement
      )}${options?.blockSuffix ?? ''}\n\n`;
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
  function encodeToEntities(data) {
    let result = '';
    for (const chr of data) {
      result += encodeCharToEntity(chr);
    }
    return result;
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
  function parseMarkdown(data, options) {
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
  function escapeHtml(data) {
    data = processReplacements(data, securityReps);
    return processReplacements(data, htmlEscAllReps);
  }

  /**
   * Convert html into plain text
   * @param {string} html
   * @returns {string} the plain text
   */
  function getPlainTextFromHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
  }

  /**
   * @file Base 64 functions
   *
   * @module utils/text/base64
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

  /**
   * Converts string to base64 represention. Note that the string is first encoded
   * so the base64 result represents the encoded version and not the original string.
   * @param {string} str - string to encode.
   * @returns {string}
   */
  function stringToBase64(str) {
    return window.btoa(encodeURIComponent(str));
  }

  /**
   * converts base64 string to a string.
   * It is assumed that the original string used to create the base64 version
   * was first encoded using encodeURIComponent.
   * As such the resulting base64 conversion is decoded using
   * decodeURIComponent before returning.
   * @param {string} base64
   * @returns {string}
   */
  function base64ToString(base64) {
    return decodeURIComponent(window.atob(base64));
  }

  /**
   * @file Localisation routines.
   *
   * @module utils/i18n/i18n
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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


  /**
   * @typedef {Object<string, string>} Translations - key: value pair. The key is
   * a unique identification for the translation.
   *
   * @type {Translations}
   */
  let activeTranslations = null;

  /**
   * @type {Translations}
   */
  let fallbackTranslations = null;

  /**
   * Set the active translation. If an activeTranslation has already been set,
   * the existing entry is moved into the fallbackTranslations. So normally usage
   * would be to call setActiveTranslations with the master language and then call
   * setActiveTranslations again with the user's preferred language.
   * @param {Translations} translations - translations to use.
   */
  function setActiveTranslations(translations) {
    sanitiseTranslations(translations);
    if (activeTranslations) {
      fallbackTranslations = activeTranslations;
    }
    activeTranslations = translations;
  }

  /**
   * Escape the translation to prevent script injection via translation.
   * @param {Translations} translations
   */
  function sanitiseTranslations(translations) {
    for (const key in translations) {
      translations[key] = escapeHtml(translations[key]);
    }
  }
  /**
   * Complete the template. Replacement values are inserted in the template at
   * locations marked with ${n}, where n is the index of the replacement provided
   * in the values. If n is omitted or is not a number, the index used is
   * derived from it's position in the template. So these are equivalent:
   * ```
   * 'This is my ${0} replacement ${1} string'
   * 'This is my ${} replacement ${} string'
   * 'This is my ${BUILD-INFO.date()} replacement ${BUILD-INFO.mode()} string'
   * ```
   * This means it is only necessary to amend the original placeholders if it is
   * necessary to rearrange the position of the strings.
   * @param {string} template template using ${} placeholders.
   * @param {string[]} values results of the replacement expressions from the original
   *  string literal.
   * @returns Completed template. HTML is escaped to prevent injection via tranlations.
   */
  function completeTemplate(template, values) {
    let defaultIndex = 0;
    return template.replace(/\${(.*?)}/g, (match, index) => {
      index = parseInt(index);
      if (isNaN(index)) {
        index = defaultIndex++;
      }
      if (index < values.length) {
        return values[index];
      } else {
        console.error(`Cannot find {${index}} for "${template}"`);
        return '${?}';
      }
    });
  }

  /**
   * Tag function routine for template literals.
   * Translations are picked up from the activeTranslations if they exist.
   *
   * The template literal to which the tag function is applied should start with a
   * keyword like this:
   * ```
   * i18n`keyword::the normal ${varA} use ${varB}.`
   * ```
   * In the translations, ${varA} and ${varB} are referenced as ${0} ${1}.
   *
   * @see completeTemplate for more information about referencing the original
   * expression results.
   *
   * Do not use in constants defined at the module level as these could be
   * resolved prior to resolution of the language files. Use a function instead.
   *
   * @param {string[]} strings
   * @param  {...any} values
   * @returns resulting string.
   */
  function i18n(strings, ...values) {
    const keyMatch = strings[0].match(/(\w+?)::(.*)/);
    let keyword = '';
    let result = [];
    if (keyMatch) {
      keyword = keyMatch[1];
      result.push(keyMatch[2]);
    } else {
      result.push(strings[0]);
    }

    let template = activeTranslations ? activeTranslations[keyword] : null;
    if (!template) {
      template = fallbackTranslations ? fallbackTranslations[keyword] : null;
    }

    let output;
    if (template) {
      output = completeTemplate(template, values);
    } else {
      // just return default template literal as was.
      values.forEach((value, i) => {
        result.push(value);
        result.push(strings[i + 1]);
      });
      output = result.join('');
    }
    return output;
  }

  /**
   *
   * @returns the preferred language as defined in navigator.languages.
   */
  function getPreferredLanguages() {
    return navigator.languages;
  }

  /**
   * @typedef {Object} LanguageSubTags
   * @property {string} language - the primary language
   * @property {string} extlang - the first extended languages. Note that these
   * are not split, so multiple extended languages are concatenated but separated
   * by hyphens.
   * @property {string} script - the script
   * @property {string} region - the region
   */
  /**
   * Decode an RFC5646 language tag.
   *
   * The tag is converted to lowercase first, so all subtags are in lowercase.
   * @param {string} languageTag - tag conforming to RFC5646
   * @returns {LanguageSubTags} the decoded language tag.
   */
  function extractLanguageSubTags(languageTag) {
    languageTag = languageTag.toLowerCase();
    var language = '';
    var extlang = '';
    var script = '';
    var region = '';

    const matches = languageTag.match(
      /^([a-z]{2,3})(-[a-z]{3}(?:-[a-z]{3}){0,2})?(-[a-z]{4})?(-(?:[a-z]{2}|[0-9]{3}))?([-].{5,})?$/
    );
    if (matches) {
      language = matches[1];
      extlang = matches[2] ? matches[2].substring(1) : '';
      script = matches[3] ? matches[3].substring(1) : '';
      region = matches[4] ? matches[4].substring(1) : '';
    }

    return {
      language: language,
      extlang: extlang,
      script: script,
      region: region,
    };
  }

  /**
   * Compares an array of preferred languages against an array of language files
   * and returns the best match. When comparing, the language subtag must always
   * match. A more specific match is normally preferred, with the region being
   * more important than the script subtag. However, the order of languages will
   * affect this. The closer a language is to the beginning of the
   * preferredLanguages array, the more important it is. Matching a language
   * closer to the start of the array, will out rank a more specific match to a
   * language further down the array.
   *
   * @param {string[]} preferredLanguages - array of preferred languages.
   * @param {string[]} availableLanguageFiles - array of file names. The file names
   * should follow be in the form of [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646)
   * tags followed by '.json'.
   * @returns the matching file name. Null if no match.
   */
  function getBestLanguageFile(
    preferredLanguages,
    availableLanguageFiles
  ) {
    const availableSubTags = availableLanguageFiles.map((entry) => {
      const languageTag = entry.toLowerCase().replace(/\.json$/i, '');
      return extractLanguageSubTags(languageTag);
    });
    const preferredSubTags = preferredLanguages.map((entry) => {
      return extractLanguageSubTags(entry);
    });

    let bestMatch = {
      weight: 0,
      file: null,
    };
    preferredSubTags.forEach((prefSubTag, prefIndexIgnored) => {
      const languageIndex = preferredSubTags.findIndex(
        (element) => element.language === prefSubTag.language
      );
      const prefSubTagRank = preferredSubTags.length - languageIndex;
      availableSubTags.forEach((availSubTag, availIndex) => {
        let weight = 0;
        if (prefSubTag.language === availSubTag.language) {
          weight += 100 * prefSubTagRank;
          if (
            prefSubTag.region !== '' &&
            prefSubTag.region === availSubTag.region
          ) {
            weight += 10;
          }
          if (
            prefSubTag.script !== '' &&
            prefSubTag.script === availSubTag.script
          ) {
            weight += 1;
          }
          if (weight > bestMatch.weight) {
            bestMatch.weight = weight;
            bestMatch.file = availableLanguageFiles[availIndex];
          }
        }
      });
    });
    return bestMatch.file;
  }

  /**
   * Get the translations. This is primarily for exporting.
   * @returns {{active: Translations, fallback: Translations}}
   */
  function getBase64Translations() {
    return stringToBase64(
      JSON.stringify({
        active: activeTranslations,
        fallback: fallbackTranslations,
      })
    );
  }

  /**
   * @file Utilities for managing dynamic palettes.
   *
   * @module utils/color/colorConversions
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  /**
   * @class
   * Encapsulate an RGB color.
   * @param {number} red - the red color. 0 to 255.
   * @param {number} green - the green color. 0 to 255.
   * @param {number} blue - the blur color. 0 to 255.
   */
  function RGB(red, green, blue) {
    /**
     * Red setting
     * @type{number}
     */
    this.red = red;
    /**
     * Green setting
     * @type{number}
     */
    this.green = green;
    /**
     * Blue setting
     * @type{number}
     */
    this.blue = blue;
  }

  /**
   * @class
   * Encapsulate an HSL color.
   * @param {number} hue - hue value. 0 to 360.
   * @param {number} saturation - saturation value. 0 to 100.
   * @param {number} luminance - luminance value. 0 to 100.
   */
  function HSL(hue, saturation, luminance) {
    /**
     * Colour's hue.
     * @type{number}
     */
    this.hue = hue;
    /**
     * Colour's saturation.
     * @type{number}
     */
    this.saturation = saturation;
    /**
     * Colour's luminance.
     * @type{number}
     */
    this.luminance = luminance;
  }

  /**
   * Calculate the relativeLuminance using the
   * [WCAG 2.x relative luminance](https://www.w3.org/WAI/GL/wiki/Relative_luminance)
   * definition. Note that in this function, variables are named to match the
   * equations in the WCAG defintion, and break the normal JavaScript style
   * guides.
   *
   * @param {RGB} rgbColor - color to convert
   * @returns {number} relative luminance. 0 to 100%. Although the WCAG
   * calculation normally returns a value from 0 to 1, this function returns a
   * value as a percentage to match the requirements of CSS.
   */
  function relativeLuminance(rgbColor) {
    const RsRGB = rgbColor.red / 255.0;
    const GsRGB = rgbColor.green / 255.0;
    const BsRGB = rgbColor.blue / 255.0;

    const R = RsRGB <= 0.03928 ? RsRGB / 12.92 : ((RsRGB + 0.055) / 1.055) ** 2.4;
    const G = GsRGB <= 0.03928 ? GsRGB / 12.92 : ((GsRGB + 0.055) / 1.055) ** 2.4;
    const B = BsRGB <= 0.03928 ? BsRGB / 12.92 : ((BsRGB + 0.055) / 1.055) ** 2.4;

    const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return L * 100;
  }

  /**
   * Test if the colour should be treated as dark.
   * @param {module:utils/color/colorConversions.RGB} rgbColor
   * @returns true if relative luminance is less than 50%.
   */
  function isDark(rgbColor) {
    return relativeLuminance(rgbColor) < 50;
  }

  /**
   * Convert RGB values to HSL.
   * See [Math behind colorspace conversions](https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/)
   * @param {RGB} rgbValue - color to convert.
   * @returns {HSL} - HSL value.
   * Hue: 0 to 360; saturation: 0 to 100; luminance: 0 to 100. Values are rounded
   * to integers.
   */
  function rgbToHsl(rgbValue) {
    const RsRGB = rgbValue.red / 255.0;
    const GsRGB = rgbValue.green / 255.0;
    const BsRGB = rgbValue.blue / 255.0;

    const minChannelValue = Math.min(RsRGB, GsRGB, BsRGB);
    const maxChannelValue = Math.max(RsRGB, GsRGB, BsRGB);
    const channelRange = maxChannelValue - minChannelValue;

    const luminance = (minChannelValue + maxChannelValue) / 2.0;

    if (Math.abs(channelRange) < 0.001) {
      return {
        hue: 0,
        saturation: 0,
        luminance: Math.round(luminance * 100),
      };
    }

    let saturation = 0;
    if (luminance <= 0.5) {
      saturation = channelRange / (minChannelValue + maxChannelValue);
    } else {
      saturation = channelRange / (2.0 - maxChannelValue - minChannelValue);
    }

    let hue = 0;
    if (channelRange !== 0) {
      if (Math.abs(maxChannelValue - RsRGB) < 0.001) {
        hue = (GsRGB - BsRGB) / channelRange;
      } else if (Math.abs(maxChannelValue - GsRGB) < 0.001) {
        hue = 2.0 + (BsRGB - RsRGB) / channelRange;
      } else {
        hue = 4.0 + (RsRGB - GsRGB) / channelRange;
      }
    }
    hue *= 60.0;
    if (hue < 0) {
      hue += 360;
    }

    return {
      hue: Math.round(hue),
      saturation: Math.round(saturation * 100),
      luminance: Math.round(luminance * 100),
    };
  }

  /**
   * Conversion of HSL value to RGB. Conversion from
   * [Wikipedia HSL and HSV](https://en.wikipedia.org/wiki/HSL_and_HSV).
   * Variable names are chosen to follow as closely as possible the equations
   * on WikiPedia rather than conforming to JavaScript style conventions. For
   * example `Htick` is equivalent to `H'`.
   * @param {HSL} hslValue - HSL value to convert
   * @param {*} saturation - 0 to 100
   * @param {*} luminance  - 0 to 100
   * @returns {RGB} RGB value.
   */
  function hslToRgb(hslValue) {
    const S = hslValue.saturation / 100.0;
    const L = hslValue.luminance / 100.0;

    const C = (1 - Math.abs(2.0 * L - 1.0)) * S;
    const Htick = hslValue.hue / 60.0;
    const X = C * (1 - Math.abs((Htick % 2) - 1));
    let RGBtick = {};
    if (0 <= Htick && Htick < 1) {
      RGBtick = { red: C, green: X, blue: 0 };
    } else if (Htick < 2) {
      RGBtick = { red: X, green: C, blue: 0 };
    } else if (Htick < 3) {
      RGBtick = { red: 0, green: C, blue: X };
    } else if (Htick < 4) {
      RGBtick = { red: 0, green: X, blue: C };
    } else if (Htick < 5) {
      RGBtick = { red: X, green: 0, blue: C };
    } else {
      RGBtick = { red: C, green: 0, blue: X };
    }

    const m = L - C / 2.0;
    return new RGB(
      Math.round(255.0 * (RGBtick.red + m)),
      Math.round(255.0 * (RGBtick.green + m)),
      Math.round(255.0 * (RGBtick.blue + m))
    );
  }

  /**
   * Get a darker version of a color.
   * @param {RGB} rgbColor - the RGB color
   * @param {number} delta - the amount by which to shift the luminance.
   * @returns {RGB}
   */
  function getDarker(rgbColor, delta) {
    const hslColor = rgbToHsl(rgbColor);
    hslColor.luminance -= delta;
    hslColor.luminance = Math.max(hslColor.luminance, 0);
    return hslToRgb(hslColor);
  }

  /**
   * Get a lighter version of a color.
   * @param {RGB} rgbColor - the RGB color
   * @param {number} delta - the amount by which to shift the luminance.
   * @returns {RGB}
   */
  function getLighter(rgbColor, delta) {
    const hslColor = rgbToHsl(rgbColor);
    hslColor.luminance += delta;
    hslColor.luminance = Math.min(hslColor.luminance, 100);
    return hslToRgb(hslColor);
  }

  /**
   * Get the contrast between color A and B. The contrast is alway >= 1.
   * @param {RGB} rgbColorA
   * @param {RGB} rgbColorB
   * @returns {number} contrast
   */
  function getContrast$1(rgbColorA, rgbColorB) {
    const relLuminanceA = relativeLuminance(rgbColorA) / 100.0;
    const relLuminanceB = relativeLuminance(rgbColorB) / 100.0;
    const contrast = (relLuminanceA + 0.05) / (relLuminanceB + 0.05);
    return contrast < 1 ? 1.0 / contrast : contrast;
  }

  /**
   * Adjust rgbColor to ensure minimum contrast
   * @param {*} rgbColor - color to adjust
   * @param {*} rgbColorReference - color against which contrast is required.
   * @param {*} minContrast - minimum constrast
   */
  function ensureContrast(rgbColor, rgbColorReference, minContrast) {
    const refIsDark = isDark(rgbColorReference);
    const deltaL = 5;
    let loopLimit = Math.floor(100 / deltaL);
    while (
      loopLimit-- &&
      getContrast$1(rgbColor, rgbColorReference) < minContrast
    ) {
      rgbColor = refIsDark
        ? getLighter(rgbColor, deltaL)
        : getDarker(rgbColor, deltaL);
    }
    return rgbColor;
  }

  /**
   * Rotate hue around the color wheel.
   * @param {RGB} rgbValue color
   * @param {number} degrees - rotation.
   * @returns {RGB} adjusted color.
   */
  function shiftHue(rgbValue, degrees) {
    const hsl = rgbToHsl(rgbValue);
    hsl.hue;
    hsl.hue += degrees;
    hsl.hue %= 360;
    if (hsl.hue < 0) {
      hsl.hue += 360;
    }
    return hslToRgb(hsl);
  }

  /**
   * Convert a color to a CSS string representation.
   * @param {RGB} rgbColor color to convert
   * @returns {string}
   */
  function rgbToCss(rgbColor) {
    return `rgb(${rgbColor.red}, ${rgbColor.green}, ${rgbColor.blue})`;
  }

  /**
   * @file CssVariables class allowing JavaScript to access CSS
   * properties.
   *
   * @module utils/color/cssVariables
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  const root = document.querySelector(':root');

  /**
   * Set the value of the specified property.
   * @param {string} propertyName - the property to modify.
   * @param {string} propertyValue - the new value.
   */
  function setProperty(propertyName, propertyValue) {
    root.style.setProperty(propertyName, propertyValue);
  }

  /**
   * @file Tools to assist with creation of color palettes.
   *
   * @module utils/color/colorPalettes
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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


  /**
   * PaletteEntry details
   * @class
   * @param {RGB} base - the base color.
   * @param {RGB} contrast - the contrast color for items on the base.
   * @param {RBG} highlight - a 10% lighter or darker color.
   */
  function PaletteEntry(base, contrast, highlight) {
    this.base = base;
    this.contrast = contrast;
    this.highlight = highlight;
  }

  /**
   * Palette details
   * @class
   * @param {object} config - configuration of the Palette
   * @param {PaletteEntry} config.primary - main color for elements
   * @param {PaletteEntry} config.secondary - secondary color for contrast
   * @param {PaletteEntry} config.tertiary - tertiary color. Rarely used.
   * @param {PaletteEntry} config.background - background for user entry and
   *    scrollable elements.
   * @param {PaletteEntry} config.window - for the main window;
   * @param {PaletteEntry} config.error - for error panels
   */
  function Palette(config) {
    this.primary = config.primary;
    this.secondary = config.secondary;
    this.tertiary = config.tertiary;
    this.background = config.background;
    this.window = config.window;
    this.error = config.error;
  }

  /**
   * Get a contrasting colour of either white or black based on whether the
   * colour is regarded as dark. @See isDark.
   * @param {*} rgbColor
   * @returns {module:utils/color/colorConversions.RGB} white or black.
   */
  function getContrast(rgbColor) {
    if (isDark(rgbColor)) {
      return { red: 255, green: 255, blue: 255 };
    } else {
      return { red: 0, green: 0, blue: 0 };
    }
  }

  /** Create a palette entry for the color.
   * @param {RGB} the main color for the entry.
   * @returns {PaletteEntry}
   */
  function getPaletteEntry(rgbColor) {
    const tintShadeAdjustment = 10;
    let highlight;
    if (isDark(rgbColor)) {
      highlight = getLighter(rgbColor, tintShadeAdjustment);
    } else {
      highlight = getDarker(rgbColor, tintShadeAdjustment);
    }
    const contrastColor = getContrast(rgbColor);
    rgbColor = ensureContrast(rgbColor, contrastColor, 7.5);
    return new PaletteEntry(rgbColor, contrastColor, highlight);
  }

  /**
   * @typedef {object}  Palette
   * @property {PaletteEntry} primary
   * @property {PaletteEntry} secondary
   * @property {PaletteEntry} tertiary
   */

  /**
   * @typedef {Object} PaletteSettings
   * @property {number} hue 0 to 360
   * @property {number} saturation  - 0 to 100
   * @property {number} spread - 0 to 180. The separation between the primary color
   * and the secondary and tertiary colors.
   * @property {boolean} dark - true if dark palette required.
   */
  /**
   * Create a palette based on the primary color.
   * @param {PaletteSettings} - settings used to configure the paletted.
   * @return {Palette}
   */
  function createPalette(settings) {
    const primaryHsl = new HSL(
      settings.hue,
      settings.saturation,
      settings.dark ? 70 : 30
    );
    const primaryRgb = hslToRgb(primaryHsl);
    const colors = [primaryRgb];
    let complementA = shiftHue(primaryRgb, settings.spread);
    let complementB = shiftHue(primaryRgb, -settings.spread);

    colors.push(complementA, complementB);
    colors.sort((a, b) => {
      const relLuminanceA = relativeLuminance(a);
      const relLuminanceB = relativeLuminance(b);
      if (relLuminanceA > relLuminanceB) {
        return 1;
      } else if (relLuminanceA < relLuminanceB) {
        return -1;
      }
      return 0;
    });
    // by sorting colors by lightest to darkest we can ensure our luminance shift
    // increases contrast rather than decreasing it.
    colors[0] = getDarker(colors[0], 5);
    colors[2] = getLighter(colors[0], 5);

    const errorHsl = new HSL(0, settings.saturation, 50);
    const backgroundHsl = new HSL(
      settings.hue,
      0,
      settings.dark ? 5 : 95
    );
    const windowHsl = new HSL(
      settings.hue,
      0,
      settings.dark ? 0 : 100
    );

    return new Palette({
      primary: getPaletteEntry(primaryRgb),
      secondary: getPaletteEntry(complementA),
      tertiary: getPaletteEntry(complementB),
      background: getPaletteEntry(hslToRgb(backgroundHsl)),
      window: getPaletteEntry(hslToRgb(windowHsl)),
      error: getPaletteEntry(hslToRgb(errorHsl)),
    });
  }

  /**
   * Set a CSS value
   * @param {string} key - property name
   * @param {PaletteEntry} paletteEntry - details fo the entry
   */
  function setCssFromPaletteEntry(key, paletteEntry) {
    for (const subkey in paletteEntry) {
      (relativeLuminance(paletteEntry.base) + 0.05) /
        (relativeLuminance(paletteEntry.contrast) + 0.05);

      setProperty(
        `--${key}-${subkey}`,
        rgbToCss(paletteEntry[subkey])
      );
    }
  }

  /**
   * Set the CSS variables to the palette settings.
   * @param {Palette} palette
   */
  function setCssFromPalette(palette) {
    for (const entryKey in palette) {
      setCssFromPaletteEntry(entryKey, palette[entryKey]);
    }
  }

  /**
   * @file Json utilities
   *
   * @module utils/jsonUtils/json
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  /**
   * Fetch json file.
   * @param {string} url path to the json file.
   * @returns {Promise} Fulfills to JavaScript object as a result of parsing the
   * file. On error, rejects with Error.
   */
  function fetchJson(url) {
    return fetchFile(url, 'json');
  }

  /**
   * Fetch text file.
   * @param {string} url path to the json file.
   * @returns {Promise} Fulfills to text. On error, rejects with Error.
   */
  function fetchText(url) {
    return fetchFile(url, 'text');
  }

  /**
   * Fetch file.
   * @param {string} url path to the json file.
   * @param {string} responseType - text or json.
   * @returns {Promise} Fulfills to text or JavaScript object as a result of
   * parsing the file. On error, rejects with Error.
   */
  function fetchFile(url, responseType) {
    console.debug(`Fetch ${url}`);
    return fetch(url).then((response) => {
      if (!response.ok) {
        return Promise.reject(
          new Error(`${response.status}: ${response.statusText}; ${url}`)
        );
      }
      if (responseType.toLocaleLowerCase() === 'json') {
        return response.json();
      }
      return response.text();
    });
  }

  /**
   * @file Cached lesson
   *
   * @module lessons/cachedLesson
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

  /**
   * @typedef {Object} CachedLesson - Retrieved lesson.
   * @property {module:lessons/lessonManager~LessonInfo} info
   * @property {string} content
   */

  class CachedLesson {
    #info;
    #content;
    /**
     * Create the cached lesson.
     * @param {module:lesson/lessonManager~LessonInfo} info - basic build information
     * @param {string} content - the lesson markdown content
     */
    constructor(info, content) {
      this.#info = info;
      this.#content = content;
    }

    /**
     * Set the lesson content.
     * @param {string} content - the markdown for the lesson.
     */
    set content(content) {
      this.#content = content;
    }

    /**
     * @returns {string} the content
     */
    get content() {
      return this.#content;
    }

    /**
     * @returns {module:lessons/lessonManager~LessonInfo} the info
     */
    get info() {
      return this.#info;
    }

    /**
     * Factory method to create `CachedLesson` by cloning.
     * @param {CachedLesson} other
     */
    static clone(other) {
      const cloned = new CachedLesson(null);
      cloned.#info = { ...other.info };
      cloned.#content = other.content;
      return cloned;
    }
  }

  /**
   * @file Simple managed element. This simplifies clean up of elements and
   * attached listeners.
   *
   * @module utils/userIo/managedElement
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


  /**
   * ManagedElement class. This wraps a DOM element which is accessible via the
   * element property. The remove method unregisters any listeners and calls remove
   * on all children. It also removes itself from the DOM if it created the element
   * itself. If it was passed an existing element, this is left in the DOM.
   * @class
   */
  class ManagedElement {
    /**
     * Underlying element.
     * @type {Element}
     */
    #element;

    /**
     * Targets which the element is listening to.
     * @type {ManagedElement[]}
     */
    #listeningTargets;

    /**
     * Children
     * @type {ManagedElement[]}
     */
    #managedChildren;

    /**
     * Flag whether the underlying element should be removed from the DOM on calls
     * to `remove`.
     * @type {boolean}
     */
    #elementRemovable;

    /**
     * Create a managed element.If passed a tag, a new element is created. If
     * passed an Element, the element is assumed to already exist.
     * @param {string | Element} tagOrElement
     * @param {string} className
     */
    constructor(tagOrElement, className) {
      if (tagOrElement instanceof Element) {
        this.#element = tagOrElement;
        this.#elementRemovable = false;
      } else {
        this.#element = document.createElement(tagOrElement);
        this.#elementRemovable = true;
      }
      if (className) {
        this.#element.className = className;
      }
      this.#listeningTargets = [];
      this.#managedChildren = [];
    }

    /**
     * Get the underlying element from either a ManagedElement or Element
     * @param {Element | module:utils/userIo/managedElement.ManagedElement} item - the Element or ManagedElement
     */
    static getElement(item) {
      return item instanceof ManagedElement ? item.element : item;
    }

    /**
     * Shorthand to get the underlying element from either a ManagedElement or Element
     * @param {Element | module:utils/userIo/managedElement.ManagedElement} item - the Element or ManagedElement
     */
    static $(item) {
      return item instanceof ManagedElement ? item.element : item;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get the underlying element
     * @returns {Element}
     */
    get element() {
      return this.#element;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Shorhand to get the underlying element
     * @returns {Element}
     */
    get $() {
      return this.#element;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement}
     * Get the disabled property of the underlying element.
     * @return {boolean}
     */
    get disabled() {
      return this.#element.disabled;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/HTMLButtonElement}
     * Set the disabled property of the underlying element.
     */
    set disabled(value) {
      this.#element.disabled = value;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get the id of the underlying element.
     * @return {string}
     */
    get id() {
      return this.#element.id;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Set the id of the underlying element.
     * @param {string} value
     */
    set id(value) {
      this.#element.id = value;
    }

    /**
     * Get the children
     * @returns {ManagedElement[]}
     */
    get managedChildren() {
      return this.#managedChildren;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get the inner element's classList
     */
    get classList() {
      return this.#element.classList;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get the inner element's className
     */
    get className() {
      return this.#element.className;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Set the inner element's className
     */
    set className(value) {
      this.#element.className = value;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement}
     * Get the inner element's checked.
     * @returns {boolean}
     */
    get checked() {
      return this.#element.checked;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement}
     * Set the inner element's value.
     * @param {boolean} state - content
     */
    set checked(state) {
      this.#element.checked = state;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get the children
     * @returns {NodeList}
     */
    get children() {
      return this.#element.children;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * @returns {string} the inner element's html.
     */
    get innerHTML() {
      return this.#element.innerHTML;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Sets the inner element's html.
     * @param {string} data - the content.
     */
    set innerHTML(data) {
      this.#element.innerHTML = data;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get last child element
     * @returns {Node}
     */
    get lastElementChild() {
      return this.#element.lastElementChild;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get offsetHeight
     * @returns {number}
     */
    get offsetHeight() {
      return this.#element.offsetHeight;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get offsetWidth
     * @returns {number}
     */
    get offsetWidth() {
      return this.#element.offsetWidth;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Get parentElement
     * @returns {Node}
     */
    get parentElement() {
      return this.#element.parentElement;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * @returns {CSSStyleDeclaration} the element's style
     */
    get style() {
      return this.#element.style;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * @returns {string} the element's tagname
     */
    get tagName() {
      return this.#element.tagName;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * @returns {string} the inner element's textContent
     */
    get textContent() {
      return this.#element.textContent;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Set the inner element's textContent.
     * @param {string} data - content
     */
    set textContent(data) {
      this.#element.textContent = data;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement}
     * Get the inner element's value.
     * @returns {*}
     */
    get value() {
      return this.#element.value;
    }
    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement}
     * Set the inner element's value.
     * @param {*} data - content
     */
    set value(data) {
      this.#element.value = data;
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Implement append child. These are removed when this is removed.
     * @param {module:utils/userIo/managedElement.ManagedElement} managedElement
     * @param {string | number} childId - id for child/
     * @returns {module:utils/userIo/managedElement.ManagedElement} element as received to allow chaining
     */
    appendChild(managedElement) {
      this.#element.appendChild(managedElement.element);
      this.#managedChildren.push(managedElement);
      return managedElement;
    }

    /**
     * Add an element to another existing DOM element. The child is added to a list of
     * elements that are removed when this element is removed. The parent, as it
     * is prexisting, is not touched on removal.
     * @param {module:utils/userIo/managedElement.ManagedElement | Element} managedElement
     * @param {Element} parent - parent to which the element is added.
     */
    appendChildTo(managedElement, parent) {
      parent.appendChild(managedElement.element ?? managedElement);
      this.#managedChildren.push(managedElement);
    }

    /**
     * Add this element to another existing DOM element.
     * @param {Element} parent - parent to which the element is added.
     */
    appendTo(parent) {
      parent.appendChild(this.#element);
    }
    /**
     * Shorthand way to create an element with content and append to this.
     * Create a managed element.
     * The html is not escaped so the caller must ensure there is no script injection.
     * @param {string | Element} tagName - the tag name for the new Element.
     * @param {?string} [cssClass]
     * @param {!string} html
     * @returns {ManagedElement} - the new element.
     */
    createAndAppendChild(tagName, cssClass, html) {
      const managedElement = new ManagedElement(tagName);
      if (cssClass) {
        managedElement.classList.add(cssClass);
      }
      if (html) {
        managedElement.innerHTML = html;
      }
      this.appendChild(managedElement);
      return managedElement;
    }

    /** Decode a value that was previously encoded.
     * @param {string} value encoded value;
     * @returns {string} the decoded value
     */
    static decodeString(value) {
      return base64ToString(value);
    }

    /**
     * Encode a value to make it safe for attributes.
     * @param {*} value
     */
    static encodeString(value) {
      return stringToBase64(value);
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Implement dispatchEvent
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent}
     * @param {Event} event
     * @returns {boolean}
     */
    dispatchEvent(event) {
      return this.#element.dispatchEvent(event);
    }

    /**
     * Fade out the element. This is done by applying the fade-out class and removing
     * the fade-in class.
     */
    fadeOut() {
      this.#element.classList.remove('fade-in');
      this.#element.classList.add('fade-out');
    }

    /**
     * Fade in the element. This is done by applying the fade-in class and removing
     * the fade-out class.
     */
    fadeIn() {
      this.#element.classList.remove('fade-out');
      this.#element.classList.add('fade-in');
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Give focus to the element
     */
    focus() {
      this.#element.focus();
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Implement getBoundingClientRect
     * @returns {DOMRect}
     */
    getBoundingClientRect() {
      return this.#element.getBoundingClientRect();
    }

    /**
     * Gets an attribute previous set by setSafeAttribute.
     * Unlike the instance method, this retrieves it from a Element. This
     * is normally used when handling DOM events where the ManagedElement is not
     * available.
     * @param {Element} element
     * @param {string} name
     * @returns {string}
     */
    static getSafeAttribute(element, name) {
      return ManagedElement.decodeString(element.getAttribute(name));
    }

    /**
     * Handle event for which this object has been registered as a listener.
     * @param {Event} event
     */
    handleEvent(event) {
      console.debug(
        `Event ${event.type} fired on <${event.currentTarget.tagName}>: class ${event.target.className}.`
      );

      const handlerName =
        'handle' +
        event.type.charAt(0).toUpperCase() +
        event.type.substring(1) +
        'Event';
      const eventId = event.currentTarget.getAttribute('data-event-id');
      this[handlerName]?.(event, eventId);
    }

    /**
     * Hide the element
     */
    hide() {
      this.#element.style.display = 'none';
    }
    /**
     * Append child. These are removed when this is removed.
     * @param {module:utils/userIo/managedElement.ManagedElement} managedElement
     * @param {string | number} childId - id for child/
     * @returns {module:utils/userIo/managedElement.ManagedElement | Element} element as received to allow chaining
     */
    insertChildAtTop(managedElement) {
      this.#element.insertBefore(
        managedElement.element ?? managedElement,
        this.#element.firstChild
      );
      this.#managedChildren.push(managedElement);
      return managedElement;
    }
    /**
     * Add event listener to own element.
     * This is just a convenience method that calls listenToEventOn(eventType, this, eventId);
     * @param {string} eventType - type of event.
     * @param {string | number | function} eventIdOrHandler - if a string or number
     * is provide, this is the id that will be returned to event handlers.
     * This is done by adding a data-event-id attribute to the element. If it is
     * a function, then that function will be called.
     * @param {?Object | boolean} options - boolean flag for useCapture or object primarily
     * for use with the passive flag for touch events.
     */
    listenToOwnEvent(eventType, eventIdOrHandler, options) {
      this.listenToEventOn(eventType, this, eventIdOrHandler, options);
    }
    /**
     * Add event listener to the target element.
     * This just adds an event listener for which this is the handler.
     * When this element is removed, any listeners are also removed.
     * @param {string} eventType
     * @param {module:utils/userIo/managedElement.ManagedElement} target
     * @param {string | number | function} eventIdOrHandler - if a string or number
     * is provide, this is the id that will be returned to event handlers.
     * This is done by adding a data-event-id attribute to the element. If it is
     * a function, then that function will be called.
     * @param {?Object | boolean} options - boolean flag for useCapture or object primarily
     * for use with the passive flag for touch events.
     */
    listenToEventOn(eventType, target, eventIdOrHandler, options) {
      if (!(target instanceof ManagedElement)) {
        throw new Error('Expect ManagedElement');
      }

      this.#listeningTargets.push({
        managedElement: target,
        eventType: eventType,
        options: options,
      });

      if (eventIdOrHandler instanceof Function) {
        target.$.addEventListener(eventType, eventIdOrHandler, options);
      } else {
        if (eventIdOrHandler !== null && eventIdOrHandler !== undefined) {
          target.setAttribute('data-event-id', eventIdOrHandler);
        }
        target.$.addEventListener(eventType, this, options);
      }
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Implement querySelector
     * @param {string} selectors - selectors to match
     * @returns {}
     */
    querySelector(selectors) {
      return this.#element.querySelector(selectors);
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Implement querySelectorAll
     * @param {string} selectors - selectors to match
     * @returns {NodeList}
     */
    querySelectorAll(selectors) {
      return this.#element.querySelectorAll(selectors);
    }

    /**
     * Remove the element from the DOM if it was created from a tag passed to the
     * constructor. If an existing element was passed in, the element is not removed.
     * In all cases, all children and listeners are removed.
     */
    remove() {
      this.removeListeners();
      this.removeChildren();
      if (this.#elementRemovable) {
        this.#element.remove();
      }
    }

    /**
     * Remove children only.
     * This calls replaceChildren on the element after removing any managed
     * elements to ensure the anything added via a direct call to the element's
     * innerHTML is also removed.
     */
    removeChildren() {
      this.#managedChildren.forEach((child) => {
        child.remove();
      });
      this.#managedChildren = [];
      while (this.#element.firstChild) {
        this.#element.removeChild(this.#element.lastChild);
      }
    }

    /**
     * Remove listeners only. Listeners on the children are also removed
     */
    removeListeners() {
      this.#listeningTargets.forEach((target) => {
        const element = target.managedElement.element;
        element.removeEventListener(target.eventType, this, target.options);
      });
      this.#managedChildren.forEach((child) => {
        child.removeListeners();
      });
      this.#listeningTargets = [];
    }

    /**
     * Sets an attribute on the element. The value is encoded to ensure it cannot
     * corrupt any html and to prevent script injection.
     * @param {string} name
     * @param {string} value
     */
    setSafeAttribute(name, value) {
      this.#element.setAttribute(name, ManagedElement.encodeString(value));
    }

    /**
     * @link {https://developer.mozilla.org/en-US/docs/Web/API/Element}
     * Implement setAttribute on the element. These are not encoded and the method is
     * typically used for adding aria elements.
     * If an item's value is null, undefined or an empty string, it is ignored.
     * @param {string} name - name
     * @param {string} value - value
     */
    setAttribute(name, value) {
      return this.#element.setAttribute(name, value);
    }

    /**
     * Show or unhide the element
     */
    show() {
      this.#element.style.display = 'unset';
    }

    /**
     * Gets an attribute previous set by setSafeAttribute.
     * @param {string} name
     * @returns {string}
     */
    getSafeAttribute(name) {
      return ManagedElement.decodeString(this.#element.getAttribute(name));
    }

    /**
     * Set attributes on the element. These are not encoded and the method is
     * typically used for adding aria elements.
     * If an item's value is null, undefined or an empty string, it is ignored.
     * @param {Object.<string, string>} attributes
     */
    setAttributes(attributes) {
      for (const key in attributes) {
        const value = attributes[key];
        if (value != null && value != undefined && value !== '') {
          this.#element.setAttribute(key, value);
        }
      }
    }
  }

  /**
   * @file Configuration data for icons
   *
   * @module utils/userIo/icons
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


  /**
   * HTML semantic roles for tagnames.
   * The key is the element's tagName and the string is the role in lower case.
   * @type{Object<string, string>}
   */
  const HTML_SEMANTIC_ROLES = {
    A: 'link',
    BUTTON: 'button',
  };

  /**
   * @typedef {Object} IconDetails
   * @property {string} content - Html that will displays the icon
   * @property {string} accessibleName - accessible name
   */

  /**
   * @typedef {Object} IconConfig
   * @property {boolean} hideText - if true, the text is hidden. If not set, the system setting is used.
   * @property {string} overrideText - if set, this overrides the button's normal label*
   * @property {string} role - the aria role.
   */

  /**
   * icons. Note that getter functions are used to prevent module imports
   * resolving i18n strings prior to the resolution of languages.
   */
  class IconGenerator {
    #cache = new Map();
    #hideText;

    /**
     * Get whether text should be hidden
     * @returns {boolean}
     */
    get hideText() {
      return this.#hideText;
    }

    /**
     * Set whether text should be hidden
     * @param {boolean} value
     */
    set hideText(value) {
      this.#hideText = value;
    }

    /**
     * Get the icon key from css
     * @returns html for icon or !? if not found.
     */
    #getIconHtml(key) {
      if (!this.#cache.has(key)) {
        let cssValue = getComputedStyle(
          document.documentElement
        ).getPropertyValue(key);
        cssValue = cssValue.trim(); //iPhone includes leading whitespace
        this.#cache.set(
          key,
          cssValue.substring(1, cssValue.length - 1).replace(/\\"/g, `"`)
        );
      }
      return this.#cache.get(key) ?? '!?';
    }
    /** @returns {IconDetails} information for icon */
    get addLesson() {
      return {
        content: this.#getIconHtml('--icon-add-lesson-html'),
        accessibleName: i18n`Add lesson`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get back() {
      return {
        content: this.#getIconHtml('--icon-back-nav-html'),
        accessibleName: i18n`Back`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get cancel() {
      return {
        content: this.#getIconHtml('--icon-cancel-html'),
        accessibleName: i18n`Cancel`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get closeEditor() {
      return {
        content: this.#getIconHtml('--icon-close-editor-html'),
        accessibleName: i18n`Close editor`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get closeMenu() {
      return {
        content: this.#getIconHtml('--icon-close-menu-html'),
        accessibleName: i18n`Close menu`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get delete() {
      return {
        content: this.#getIconHtml('--icon-delete-html'),
        accessibleName: i18n`Delete`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get edit() {
      return {
        content: this.#getIconHtml('--icon-edit-html'),
        accessibleName: i18n`Edit`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get error() {
      return {
        content: this.#getIconHtml('--icon-error-html'),
        accessibleName: i18n`Open menu`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get exit() {
      return {
        content: this.#getIconHtml('--icon-exit-html'),
        accessibleName: i18n`Exit to main site`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get export() {
      return {
        content: this.#getIconHtml('--icon-export-html'),
        accessibleName: i18n`Export lesson`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get exportAutoRun() {
      return {
        content: this.#getIconHtml('--icon-export-autorun-html'),
        accessibleName: i18n`Export autorun`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get fatal() {
      return {
        content: this.#getIconHtml('--icon-fatal-html'),
        accessibleName: i18n`Open menu`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get flag() {
      return {
        content: this.#getIconHtml('--icon-flagged-html'),
        accessibleName: i18n`Flag`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get openFolder() {
      return {
        content: this.#getIconHtml('--icon-open-folder-html'),
        accessibleName: i18n`Open folder`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get forward() {
      return {
        content: this.#getIconHtml('--icon-forward-nav-html'),
        accessibleName: i18n`Forward`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get help() {
      return {
        content: this.#getIconHtml('--icon-help-html'),
        accessibleName: i18n`Help`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get home() {
      return {
        content: this.#getIconHtml('--icon-home-html'),
        accessibleName: i18n`Home`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get import() {
      return {
        content: this.#getIconHtml('--icon-import-html'),
        accessibleName: i18n`Import file`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get info() {
      return {
        content: this.#getIconHtml('--icon-info-html'),
        accessibleName: i18n`Flag`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get selectLesson() {
      return {
        content: this.#getIconHtml('--icon-lesson-html'),
        accessibleName: i18n`Select lesson`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get library() {
      return {
        content: this.#getIconHtml('--icon-library-html'),
        accessibleName: i18n`Open library`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get load() {
      return {
        content: this.#getIconHtml('--icon-load-html'),
        accessibleName: i18n`Open file`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get nextProblem() {
      return {
        content: this.#getIconHtml('--icon-next-problem-html'),
        accessibleName: i18n`Continue`,
      };
    }

    /** @returns {IconDetails} information for icon */
    get no() {
      return {
        content: this.#getIconHtml('--icon-no-html'),
        accessibleName: i18n`No`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get ok() {
      return {
        content: this.#getIconHtml('--icon-ok-html'),
        accessibleName: i18n`OK`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get pause() {
      return {
        content: this.#getIconHtml('--icon-pause-html'),
        accessibleName: i18n`Pause`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get play() {
      return {
        content: this.#getIconHtml('--icon-play-html'),
        accessibleName: i18n`Play`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get playLesson() {
      return {
        content: this.#getIconHtml('--icon-play-html'),
        accessibleName: i18n`Play lesson`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get privacy() {
      return {
        content: this.#getIconHtml('--icon-privacy-html'),
        accessibleName: i18n`Privacy`,
      };
    }

    /** @returns {IconDetails} information for icon */
    get question() {
      return {
        content: this.#getIconHtml('--icon-question-html'),
        accessibleName: i18n`Flag`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get repeatLesson() {
      return {
        content: this.#getIconHtml('--icon-repeat-lesson-html'),
        accessibleName: i18n`Repeat lesson`,
      };
    }

    /** @returns {IconDetails} information for icon */
    get resetToFactory() {
      return {
        content: this.#getIconHtml('--icon-reset-to-factory-html'),
        accessibleName: i18n`Factory reset`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get save() {
      return {
        content: this.#getIconHtml('--icon-save-html'),
        accessibleName: i18n`Save`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get settings() {
      return {
        content: this.#getIconHtml('--icon-settings-html'),
        accessibleName: i18n`Settings`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get skip() {
      return {
        content: this.#getIconHtml('--icon-skip-html'),
        accessibleName: i18n`Skip`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get submitAnswer() {
      return {
        content: this.#getIconHtml('--icon-submit-answer-html'),
        accessibleName: i18n`Check answer`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get openMenu() {
      return {
        content: this.#getIconHtml('--icon-open-menu-html'),
        accessibleName: i18n`Open menu`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get warning() {
      return {
        content: this.#getIconHtml('--icon-warning-html'),
        accessibleName: i18n`Open menu`,
      };
    }
    /** @returns {IconDetails} information for icon */
    get yes() {
      return {
        content: this.#getIconHtml('--icon-yes-html'),
        accessibleName: i18n`Yes`,
      };
    }

    /**
     *
     * @param {Element} element - the element to check
     * @param {string} role - the required role. If empty, null or undefine, any
     * element fulfils the role.
     * @returns true if the natural role for the Element's tagName addressesses the
     * required role.
     */
    semanticsAddressRole(element, role) {
      if (!role) {
        return true;
      }
      const htmlSemanticRole = HTML_SEMANTIC_ROLES[element.tagName];
      return htmlSemanticRole[element.tagName] == role;
    }

    /**
     * Apply the icon to an element.
     * If the element is a button or link, aria components are not added as HTML
     * semantics are regarded as sufficient. However, if the text is hidden, the
     * aria-label will still be added.
     * @param {IconDetails} icon
     * @param {Element | module:utils/userIo/managedElement.ManagedElement} item - element or ManagedElement to which the icon is added.
     * @param {IconConfig} options

     */
    applyIconToElement(icon, item, options = {}) {
      const hideText = options.hideText ?? this.#hideText;
      const label = options.overrideText ?? icon.accessibleName;
      const element = ManagedElement.getElement(item);
      const role = options.role?.toLowerCase();
      element.innerHTML = icon.content;
      if (icon.accessibleName && !hideText) {
        element.innerHTML += `&nbsp;${label}`;
      } else {
        element.title = label;
      }
      if (this.semanticsAddressRole(element, role)) {
        // semantics match role but still add aria-label if text hidden.
        if (options.hideText) {
          element.setAttribute('aria-label', label);
        }
        return; // semantics match role.
      }
      element.setAttribute('role', role);
      element.setAttribute('aria-label', label);
    }
  }

  const icons = new IconGenerator();

  /**
   * @file Manage focusing of elements.
   *
   * @module utils/userIo/focusManager
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

  class FocusManager {
    constructor() {
      window.addEventListener('focus', (event) => {
        console.debug(
          `Window has focus. Restore focus to active element. Active element ${document.activeElement.tagName} ${document.activeElement.className}`,
          document.activeElement,
          event.relatedTarget
        );
        if (document.activeElement !== document.body) {
          document.activeElement.focus();
        } else {
          this.findBestFocus();
        }
      });
    }
    /**
     * Move the focus to the first possible element within the containingElement
     * @param {Element | module:utils/userIo/managedElement.ManagedElement} [containingElement=document.body] - where to look
     * @returns {boolean} true if success.
     */
    focusWithin(containingElement = document.body) {
      const element = containingElement.element ?? containingElement;
      const candidates = element.querySelectorAll(
        'button,select,input,.selectable'
      );
      for (const candidate of candidates.values()) {
        if (
          candidate.style.display !== 'none' &&
          candidate.style.visibility !== 'hidden'
        ) {
          candidate.focus();
          return true;
        }
      }
      console.debug(
        `Couldn't find anything to focus on within ${element?.tagName}:${element?.className}`
      );
      return false;
    }

    /** Best effort to restore focus */
    findBestFocus() {
      let element = document.querySelector('.selectable.always-on-top');
      if (element) {
        element.focus();
        return;
      }
      element = document.querySelector('.modal');
      if (element) {
        this.focusWithin(element);
      } else {
        element = document.querySelector('#content');
        this.focusWithin(element);
      }
    }

    /**
     * Sets focus to the element.
     * Unlike the standard Element focus method, this return whether or not
     * it succeeded.
     * @param {*} element
     * @returns {boolean} true if successfully moved focus to the element.
     */
    setFocus(element) {
      element.focus();
      return document.activeElement === element;
    }
  }

  const focusManager = new FocusManager();

  /**
   * @file Popup message.
   *
   * @module utils/dialog/toast
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


  /**
   * Popup message.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class Toast extends ManagedElement {
    /**
     *
     * @param {string} message - message to display. This can contain HTML and as
     * such is vulnerable to code injection.  As such the user should sanitise the
     * data.
     * @param {boolean} rawHtml - if true, raw HTML can be provided.
     */
    constructor(message, rawHtml) {
      super('div', 'utils-toast');
      this.classList.add('selectable', 'always-on-top');
      this.setAttributes({
        'aria-role': 'alert',
        tabindex: '0',
      });
      const content = new ManagedElement('div', 'container');
      const icon = new ManagedElement('div');
      icons.applyIconToElement(icons.closeMenu, icon.element, { hideText: true });
      this.appendChild(content);
      this.appendChild(icon);

      if (rawHtml) {
        content.innerHTML = message;
      } else {
        content.textContent = message;
      }

      this.listenToOwnEvent('click', '');
      this.listenToOwnEvent('keydown', '');
    }

    /**
     * Get rid of the toast message.
     */
    #dismiss() {
      this.style.opacity = 0;
      this.remove();
      focusManager.findBestFocus();
    }
    /**
     * Handle the toast click event.
     * Remove the toast.
     * @param {Event} event - triggering event
     * @param {string} eventId - event id. Currently unused.
     */
    handleClickEvent(eventIgnored) {
      this.#dismiss();
    }

    /**
     * Handle the keydown event.
     * Remove the toast if Escape, Space or Enter pressed.
     * @param {Event} event - triggering event
     * @param {string} eventId - event id. Currently unused.
     */
    handleKeydownEvent(event) {
      console.debug(`Key ${event.key}`);
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
        this.#dismiss();
      }
    }
  }

  /**
   * Pop up a message.
   * @param {string} message.
   * @param {boolean} rawHtml True if raw html can be provided.
   */
  function toast(message) {
    const toast = new Toast(message, true);
    document.body.appendChild(toast.element);
    setTimeout(() => {
      toast.style.top = '45vh';
      toast.focus();
    });
  }

  /**
   * @file Functions to handle storage for settings.
   *
   * @module utils/userIo/storage
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

  /**
   * Storage manager. This manages storage that conforms the the WebApi Storage interface.
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
   */
  class DataStoreManager {
    /**
     * @type{Storage}
     */
    #storage;
    /**
     * String appended to keys to make storage unique when testing locally.
     * If running a server on the unbuilt source, the {@link module:data/constants.BuildInfo.getBundleName} is
     * not unique, so a prefix of 'LR' is also appended. This should be modified
     * for each application.
     * @type{string}
     */
    #keyPrefix = 'app';

    /**
     * Construct store
     * @param {Storage} storage - the underlying storage that supports the WebApi Storage interface.
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
     */
    constructor(storage) {
      this.#storage = storage;
    }

    /**
     * Create a unique key for the storage. To do this, this.#keyPrefix is
     * added to the front of the key.
     * @param {string} key
     * @returns {string} the unique key.
     */
    createStorageKey(key) {
      return `${this.#keyPrefix}${key}`;
    }

    /**
     * Get setting from storage
     * @param {string} key - saved item key. NB. this is prefixed by
     * LOCAL_STORAGE_ID to prevent clashes with local debugging.
     * @param {*} defaultValue
     * @returns {*}
     */
    getFromStorage(key, defaultValue) {
      key = this.createStorageKey(key);
      const value = this.#storage.getItem(key);
      if (value) {
        try {
          const parsedValue = JSON.parse(value);
          if (parsedValue === null || parsedValue === undefined) {
            return defaultValue;
          } else {
            return parsedValue;
          }
        } catch (error) {
          console.error(error);
        }
      }
      return defaultValue;
    }
    /**
     * Save setting to local storage
     * @param {string} key
     * @param {*} value
     * @throws {Error} if underlying storage fails.
     */
    saveToStorage(key, value) {
      key = this.createStorageKey(key);
      try {
        this.#storage.setItem(key, JSON.stringify(value));
      } catch (error) {
        toast(i18n`Unable to save data. ${error.message}`);
      }

      return;
    }

    /**
     * Remove setting from storage
     * @param {string} key
     */
    removeFromStorage(key) {
      key = this.createStorageKey(key);
      this.#storage.removeItem(key);
    }

    /**
     * Set the prefix for the storage key. This is primarily used to stop apps
     * from the the same domain sharing the same storage values.
     * @param {string} prefix
     */
    setStorageKeyPrefix(prefix) {
      this.#keyPrefix = prefix;
    }
  }

  /**
   * DataStoreManager for the localStorage.
   */
  const persistentData = new DataStoreManager(localStorage);

  /**
   * @file Utilities for handling errors.
   *
   * @module utils/errorHandling/errors
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


  /**
   * Escape content so that it is safe to include in an attribute.
   * This is primarily to prevent translations corrupting the HTML.
   * @param {string} content
   * @returns {string}
   */
  function escapeAttribute(content) {
    return stringToBase64(content);
  }

  /**
   * Get string for `data-error` attribute suitable for inserting into an HTML tag.
   * The return is `data-error="escapedMessage"`
   * @param {string} message
   * @returns {string}
   */
  function getErrorAttributeHtml(message) {
    return `data-error="${escapeAttribute(message)}"`;
  }

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


  /**
   * Array of predefined emojis. All keys must be in lowercase. Do not use underscores
   * as these could be misconstrued as emphasis characters.
   */
  const PREDEFINED_EMOJIS = {
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
  function getEmojiHtml(originalDefinition) {
    if (!originalDefinition) {
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

  /**
   * @file Base item parser for a problem item.
   *
   * @module lessons/textItem
   *
   * @license GPL-3.0-or-later
   * Text2Lesson: create quizzes and lessons from plain text files.
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
  class TextItem {
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
      const elidedHtml = this.#html.replace(
        /<(?:[^>]*missing-word[^>]*)>/g,
        '...'
      );
      return getPlainTextFromHtml(elidedHtml);
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
        textItem.#html = parseMarkdown(source, {
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
  function getItemReplacement(prefix, replace) {
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

  /**
   * @file Parse meta data which is information at the start of a file.
   *
   * @module lessons/metadata
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

  /**
   * Encapsulate the metadata
   */
  class Metadata {
    static #isConstructing = false;

    /**
     * Collection of meta data keys.
     * @type {Object<string, string>}
     */
    #map = new Map();

    constructor() {
      if (!Metadata.#isConstructing) {
        throw new Error('Private constructor. Use createMetaData');
      }
    }

    /**
     * Get the value associated with the key.
     * @param {string} key - key to lookup.
     * @param {string} defaultValue - returned if key not found.
     * @returns {string}
     */
    getValue(key, defaultValue) {
      const value = this.#map.get(key.toUpperCase());
      return value ?? defaultValue;
    }

    /**
     * Create the a `MetaData` object from the source. The format of meta data is
     * a number of lines comprising a key and value. The key cannot have any spaces
     * in its name and can only comprise the characters a to z, A to Z, 0 to 9 and
     * underscore; i.e. the regex `\w` characters. If a key is repeated, it is
     * overwritten. Additional lines are ignored.
     *
     * The key should be separated from its value by a colon, semi-colon, period,
     * or a semi-colon. Any of these can be immediately followed by a hyphen.
     * There can be any number of spaces surrounding the key, separator and values.
     *
     * Keywords are converted to uppercase.
     * @param {string} source
     */
    static createFromSource(source) {
      Metadata.#isConstructing = true;
      const metadata = new Metadata();
      Metadata.#isConstructing = false;
      const lines = source.split('\n');
      lines.forEach((element) => {
        const match = element.match(/^\s*(\w+)\s*[:;.]-?\s*(.*?)\s*$/);
        if (match) {
          metadata.#map.set(match[1].toUpperCase(), escapeHtml(match[2]));
        }
      });
      return metadata;
    }
  }

  /**
   * @file The `Problem` class.
   *
   * @module lessons/problem
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

  /**
   * Question types.
   * @enum {string}
   */
  const QuestionType = {
    SIMPLE: 'simple',
    MULTI: 'multi',
    FILL: 'fill',
    ORDER: 'order',
    SLIDE: 'slide',
  };

  /**
   * Decoded problem.
   */
  class Problem {
    /**
     * @type {module:lessons/textItem-parser~TextItem}
     */
    #intro;

    /**
     * @type {module:lessons/textItem-parser~TextItem}
     */
    #question;

    /**
     * @type {module:lessons/textItem-parser~TextItem}
     */
    #explanation;

    /**
     * @type {module:lessons/textItem-parser~TextItem[]}
     */
    #rightAnswers;

    /**
     * @type {module:lessons/textItem-parser~TextItem[]}
     */
    #wrongAnswers;

    /**
     * @type {QuestionType}
     */
    #questionType = QuestionType.SLIDE;

    /**
     * Construct `Problem`.
     */
    constructor() {}

    /**
     * Get the intro
     * @returns {module:lessons/textItem-parser~TextItem}
     */
    get intro() {
      return this.#intro;
    }

    /**
     * Set the intro
     * @param {module:lessons/textItem-parser~TextItem} value
     */
    set intro(value) {
      this.#intro = value;
    }

    /**
     * Get the question
     * @returns {module:lessons/textItem-parser~TextItem}
     */
    get question() {
      return this.#question;
    }

    /**
     * Set the question
     * @param {module:lessons/textItem-parser~TextItem} value
     */
    set question(value) {
      this.#question = value;
      this.#deriveQuestionType();
    }

    /**
     * Get the explanation
     * @returns {module:lessons/textItem-parser~TextItem}
     */
    get explanation() {
      return this.#explanation;
    }

    /**
     * Set the explanation
     * @param {module:lessons/textItem-parser~TextItem} value
     */
    set explanation(value) {
      this.#explanation = value;
    }

    /**
     * Get the rightAnswers
     * @returns {module:lessons/textItem-parser~TextItem[]}
     */
    get rightAnswers() {
      return this.#rightAnswers;
    }

    /**
     * Set the rightAnswers
     * @param {module:lessons/textItem-parser~TextItem[]} value
     */
    set rightAnswers(value) {
      this.#rightAnswers = value;
      this.#deriveQuestionType();
    }

    /**
     * Get the wrongAnswers
     * @returns {module:lessons/textItem-parser~TextItem[]}
     */
    get wrongAnswers() {
      return this.#wrongAnswers;
    }

    /**
     * Get the first words from the wrong answers.
     * @returns {string[]}
     */
    get firstWordsOfWrongAnswers() {
      return this.#extractFirstWords(this.wrongAnswers);
    }
    /**
     * Get the first words from the wrong answers.
     * @returns {string[]}
     */
    get firstWordsOfRightAnswers() {
      return this.#extractFirstWords(this.rightAnswers);
    }

    /**
     * Extract the first word from
     * @param {module:lessons/textItem-parser~TextItem} data
     * @returns {string[]}
     */
    #extractFirstWords(data) {
      const words = [];
      data.forEach((textItem) => {
        words.push(textItem.firstWord);
      });
      return words;
    }

    /**
     * Set the wrongAnswers
     * @param {module:lessons/textItem-parser~TextItem[]} value
     */
    set wrongAnswers(value) {
      this.#wrongAnswers = value;
      this.#deriveQuestionType();
    }

    /**
     * Get the question type
     */
    get questionType() {
      return this.#questionType;
    }

    /**
     * Derive the type of question.
     *
     * The program supports six question types. The type is automatically derived
     * from the question type,
     *
     * +simple: a multiple choice question with just one correct answer.
     * +multi: a multiple choice question where the user can select more than one
     * correct answer.
     * +fill: a fill the blank question. Users have a selection of words which
     * they must select to fill in the blanks in the question. This type is
     * created if the question has an array of missing words which are not blank.
     * Any wrong answers are added as red herrings. Note that only the first word
     * of any wrong answer is used. If right answers have also been added, they
     * are ignored. Note that if the question has one missing word with no content
     * at the end, this is taken as the trigger to add an extra answer line at the
     * end and this becomes an *order* question.
     * +order: a select the answers in the correct order question. Users have a
     * selection of words which they must select in the correct order. Any wrong
     * answers that have been defined are treated as red herrings. This is similar
     * to the fill question, but with the correct selections being added to a
     * separate answer line rather than being inserted into blanks in the
     * question. This type is created if there is a single missing word (...) at
     * the end with no content.
     * +slide: there is no question to answer. The user can just continue when
     * ready. This is the default if the question does not fall into any of the
     * other categories.
     */
    #deriveQuestionType() {
      if (!this.#question?.html) {
        return QuestionType.SLIDE;
      }
      if (this.#isOrderQuestion()) {
        this.#questionType = QuestionType.ORDER;
      } else if (this.#isFillQuestion()) {
        this.#questionType = QuestionType.FILL;
      } else if (this.#isMultiQuestion()) {
        this.#questionType = QuestionType.MULTI;
      } else if (this.#isSimpleQuestion()) {
        this.#questionType = QuestionType.SIMPLE;
      } else {
        this.#questionType = QuestionType.SLIDE;
      }
    }

    /**
     * Return true if this is a multiple choice question with one correct answers.
     * This means there is just one right answer. Callers must check that
     * the question is not an order or fill question first.
     * @returns {true}
     */
    #isSimpleQuestion() {
      return this.#rightAnswers ? this.#rightAnswers.length === 1 : false;
    }

    /**
     * Return true if this is a multiple choice question with multiple answers.
     * This means there is more that one right answer. Callers must check that
     * the question is not an order or fill question first.
     * @returns {true}
     */
    #isMultiQuestion() {
      return this.#rightAnswers ? this.#rightAnswers.length > 1 : false;
    }

    /**
     * Return true if the question is a fill type.
     * This means that the question contains missing words, each containing
     * content.
     * @returns {boolean}
     */
    #isFillQuestion() {
      if (this.#question.missingWords.length === 0) {
        return false;
      }
      for (const content of this.#question.missingWords) {
        if (!content) {
          return false;
        }
      }
      return true;
    }

    /**
     * Return true if the question is an *order*.
     * This means there is just one missing word in the question, positioned at
     * the very end and with no content.
     * @returns {boolean}
     */
    #isOrderQuestion() {
      const missingAtEnd = this.#question.html.match(
        /<span +class *= *"missing-word".*?><\/span>(?:\s*<\/p>\s*)*$/
      );
      return (
        missingAtEnd &&
        this.#question.missingWords.length === 1 &&
        !this.#question.missingWords[0]
      );
    }
  }

  /**
   * @file Marker for keep track of scores
   *
   * @module lessons/itemMarker
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

  /**
   * Possible states for a problem waiting to be answered.
   * @enum
   */
  const MarkState = {
    UNDEFINED: -1,
    CORRECT: 0,
    INCORRECT: 1,
    SKIPPED: 2,
  };

  /**
   * Information about the current marks.
   * @typedef {Object} Marks
   * @property {number} correct
   * @property {number} incorrect
   * @property {number} skipped
   * @property {Problem[]} markedItems
   */

  /**
   * @typedef {Object} MarkedItem
   * @property {Object} item
   * @property {MarkState} state
   */

  /**
   * Class for keeping track of scores.
   */
  class ItemMarker {
    /** @type {MarkedItem[]} */
    #markedItems;

    /**
     * Create the marker.
     */
    constructor() {
      this.reset();
    }

    /**
     * Reset all scores to zero
     */
    reset() {
      this.#markedItems = [];
    }

    /**
     * Get the current marks.
     * @returns {Marks}
     */
    get marks() {
      const marks = {
        correct: 0,
        incorrect: 0,
        skipped: 0,
        markedItems: this.#markedItems,
      };
      this.#markedItems.forEach((markedItem) => {
        switch (markedItem.state) {
          case MarkState.CORRECT:
            marks.correct++;
            break;
          case MarkState.INCORRECT:
            marks.incorrect++;
            break;
          case MarkState.SKIPPED:
            marks.skipped++;
            break;
        }
      });
      return marks;
    }

    /**
     * Add a mark for the specified state.
     * @param {Object} item - marked item.
     * @param {MarkState} state - state to be marked.
     */
    markItem(item, state) {
      this.#markedItems.push({
        item: item,
        state: state,
      });
    }
  }

  /**
   * @file Provides the `Lesson` class.
   *
   * @module lessons/lesson
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

  /**
   * Encapsulation of a lesson.
   */
  class Lesson {
    /**
     * @type {Metadata}
     */
    #metadata;

    /**
     * @type {Problem[]}
     */
    #problems = [];

    /**
     * @type {number}
     */
    #problemIndex = 0;

    /**
     * Marker to keep track of scores
     * @type {Marker}
     */
    #marker = new ItemMarker();

    /**
     * Create the lesson with scores initialised to zero.
     */
    constructor() {
      this.#marker.reset();
    }
    /**
     * get the metadata
     * @returns {Metadata}
     */
    get metadata() {
      return this.#metadata;
    }

    /**
     * Set the metadata
     * @param {Metadata} value
     */
    set metadata(value) {
      this.#metadata = value;
    }

    /**
     * Get the problems.
     * @returns {Problem[]}
     */
    get problems() {
      return this.#problems;
    }

    /**
     * Get the marks
     * @return {module:lessons/itemMarker~Marks}
     */
    get marks() {
      return this.#marker.marks;
    }

    /**
     * Add problem to the lesson.
     * @param {Problem} problem
     */
    addProblem(problem) {
      this.#problems.push(problem);
    }

    /**
     * Reset the problem index and marker.
     */
    restart() {
      this.#marker.reset();
      this.#problemIndex = 0;
    }

    /**
     * Check if there are more problems.
     * @returns {boolean} true if more questions remain to be answered.
     */
    get hasMoreProblems() {
      return this.#problemIndex < this.#problems.length;
    }

    /**
     * Get next problem.
     * This advances the internal index.
     * If there aren't any more, it returns null;
     * @returns {Problem | null}
     */
    getNextProblem() {
      return this.#problemIndex < this.#problems.length
        ? this.#problems[this.#problemIndex++]
        : null;
    }

    /**
     * Gets the next problem but without advancing the internal index.
     * If there aren't any more, it returns null;
     * @returns {Problem | null}
     */
    peekAtNextProblem() {
      return this.#problemIndex < this.#problems.length
        ? this.#problems[this.#problemIndex]
        : null;
    }

    /**
     *
     * @param {Problem} problem
     * @param {module:lessons/marker.MarkStates} state
     */
    markProblem(problem, state) {
      this.#marker.markItem(problem, state);
    }
  }

  /**
   * @file Source describing a problem
   *
   * @module lessons/problem-source
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

  class ProblemSource {
    /**
     * @type {string}
     */
    #introSource;
    /**
     * @type {string}
     */
    #questionSource;
    /**
     * @type {string[]}
     */
    #rightAnswerSources;
    /**
     * @type {string[]}
     */
    #wrongAnswerSources;
    /**
     * @type {string}
     */
    #explanationSource;

    constructor() {
      this.#introSource = '';
      this.#questionSource = '';
      this.#rightAnswerSources = [];
      this.#wrongAnswerSources = [];
      this.#explanationSource = '';
    }

    /**
     * Get the introduction data;
     */
    get introSource() {
      return this.#introSource;
    }
    /**
     * Set the introduction data;
     */
    set introSource(data) {
      this.#introSource = data;
    }

    /**
     * Get the question data;
     */
    get questionSource() {
      return this.#questionSource;
    }
    /**
     * Set the question data;
     */
    set questionSource(data) {
      this.#questionSource = data;
    }
    /**
     * Get the explanation data;
     */
    get explanationSource() {
      return this.#explanationSource;
    }
    /**
     * Set the explanation data;
     */
    set explanationSource(data) {
      this.#explanationSource = data;
    }

    /**
     * Get the right answers;
     */
    get rightAnswerSources() {
      return this.#rightAnswerSources;
    }

    /**
     * Get the wrong answers;
     */
    get wrongAnswerSources() {
      return this.#wrongAnswerSources;
    }

    /**
     * Add a new right answer
     * @param(string) data
     */
    addRightAnswerSource(data) {
      this.#rightAnswerSources.push(data);
    }

    /**
     * Add a new right answer
     * @param(string) data
     */
    addWrongAnswerSource(data) {
      this.#wrongAnswerSources.push(data);
    }
  }

  /**
   * @file Convert plain text
   * {@link module:lessons/lessonSource~LessonSourceRawText} to a
   * {@link LessonSource} instance.
   *
   * @module lessons/lessonSource
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

  /**
   * Keys for splitting the problem source into parts. All keys are lowerCase.
   */
  const ProblemItemKey = {
    INTRO: 'i',
    QUESTION: '?',
    RIGHT_ANSWER: '=',
    WRONG_ANSWER: 'x',
    EXPLANATION: '&',
    QUESTION_BREAK: '_',
  };

  /**
   * Class encapsulating the source text use to define the problems that comprise
   * a lesson.
   */
  class LessonSource {
    static #isConstructing = false;
    /**
     * Lesson metadata
     */
    #metaSource;
    /**
     * Question blocks in the lesson
     */
    #problemSources;

    /**
     * Construct a lesson.
     */
    constructor() {
      if (!LessonSource.#isConstructing) {
        throw new Error('Private constructor. Use createFromSource');
      }
      this.#problemSources = [];
    }

    /**
     * Set the metaSource
     * @param {string} value
     */
    set metaSource(value) {
      this.#metaSource = value;
    }

    /**
     * @returns {string}
     */
    get metaSource() {
      return this.#metaSource;
    }

    /**
     * Get the problem defs
     * @returns {ProblemSource[]}
     */
    get problemSources() {
      return this.#problemSources;
    }
    /**
     * Create a new LessonSource.
     * Break the source into a collection of {@link ProblemSource} objects.
     * @param {LessonSourceRawText} source
     * @return {LessonSource}
     */
    static createFromSource(source) {
      LessonSource.#isConstructing = true;
      const lessonSource = new LessonSource();
      LessonSource.#isConstructing = false;
      const lines = source.split(/\r\n|\n/);
      let currentItemKey = null;
      let problemSource = lessonSource.createProblemSource();
      let data = '';

      lines.forEach((line) => {
        const details = lessonSource.getLineDetails(line);
        if (!details.key) {
          data += `${details.content}\n`;
        } else {
          lessonSource.addDataToProblemSource(
            problemSource,
            currentItemKey,
            data
          );

          data = details.content ? `${details.content}\n` : '';
          if (
            lessonSource.isNewProblem(currentItemKey, details.key, problemSource)
          ) {
            problemSource = lessonSource.createProblemSource();
          }
          currentItemKey = details.key;
        }
      });
      if (data) {
        lessonSource.addDataToProblemSource(problemSource, currentItemKey, data);
      }
      return lessonSource;
    }

    /**
     * Test to see if the key represents a new question block.
     * Keys for INTRO or QUESTION result in new question blocks if they've already
     * been fulfilled.
     * If the last key was a QUESTION_BREAK, any key creates a new question.
     * @param {QuestionItemKey} lastKey - last key that was in use/
     * @param {QuestionItemKey} newKey - the new key.
     * @param {ProblemSource} currentProblem - the current problem.
     * @returns {boolean}
     */
    isNewProblem(lastKey, newKey, currentProblem) {
      if (lastKey === ProblemItemKey.QUESTION_BREAK) {
        return true;
      }
      switch (newKey) {
        case ProblemItemKey.INTRO:
          return !!currentProblem.introSource;
        case ProblemItemKey.QUESTION:
          return !!currentProblem.questionSource;
      }
      return false;
    }
    /**
     * Add data to the appropriate part of the {@link Problem} based
     * on the state. If the itemType is not defined, the data is added as metadata
     * to the lesson.
     * @param {ProblemSource} problem
     * @param {QUESTION_ITEM_TYPE} itemType
     * @param {string} data
     *
     */
    addDataToProblemSource(problem, itemType, data) {
      switch (itemType) {
        case ProblemItemKey.INTRO:
          problem.introSource = data;
          break;
        case ProblemItemKey.QUESTION:
          problem.questionSource = data;
          break;
        case ProblemItemKey.RIGHT_ANSWER:
          problem.addRightAnswerSource(data);
          break;
        case ProblemItemKey.WRONG_ANSWER:
          problem.addWrongAnswerSource(data);
          break;
        case ProblemItemKey.EXPLANATION:
          problem.explanationSource = data;
          break;
        case ProblemItemKey.QUESTION_BREAK:
          break;
        default:
          this.metaSource = data;
      }
    }

    /**
     * Create a new {@link ProblemSource} and append to internal array.
     * @returns {ProblemSource}
     */
    createProblemSource() {
      const block = new ProblemSource();
      this.problemSources.push(block);
      return block;
    }

    /**
     * Get the key and content that follows the key for the line.
     * If there is no key found, the entire line is returned in the content and
     * key is undefined.
     * A key line can be preceded by up to 3 -, #, _ or space characters. It then comprises the
     * key character, i?=x+& or _, optionallycontained within () brackets. The brackets can
     * be repeated and the key character can be repeated. This allows the author
     * to use more visually prominent key lines if preferred.
     * The content does not include the line terminator.
     * @param {string} line
     * @returns {{key:QuestionItemKey, content:string}}
     */
    getLineDetails(line) {
      // @ToDo remove comment.  const match = line.match(/^ {0,3}(?:\(+([i?=x+#])\1*\)+)(.*)$/i);
      const match = line.match(/^[-#_* ]{0,3}(?:\(*([i?=xX&_])\1*[_) ]+)(.*)$/);

      if (!match) {
        return { key: undefined, content: line };
      }
      return { key: match[1].toLowerCase(), content: match[2] ?? '' };
    }

    /**
     * Converts the lesson source to a `Lesson`
     * @returns {module:lessons/lesson.Lesson}
     */
    convertToLesson() {
      const lesson = new Lesson();
      lesson.metadata = Metadata.createFromSource(this.metaSource);
      this.problemSources.forEach((problemSource) => {
        const problem = new Problem();
        problem.intro = TextItem.createFromSource(
          problemSource.introSource,
          lesson.metadata
        );
        problem.question = TextItem.createFromSource(
          problemSource.questionSource,
          lesson.metadata
        );
        problem.explanation = TextItem.createFromSource(
          problemSource.explanationSource,
          lesson.metadata
        );
        problem.rightAnswers = problemSource.rightAnswerSources.map((source) =>
          TextItem.createFromSource(source, lesson.metadata)
        );
        problem.wrongAnswers = problemSource.wrongAnswerSources.map((source) =>
          TextItem.createFromSource(source, lesson.metadata)
        );
        lesson.addProblem(problem);
      });
      return lesson;
    }
  }

  /**
   * @file Class to handle unmanaged lessons
   *
   * @module lessons/unmanagedLesson
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


  /** Class to handle lesson provided via the a system outside of the normal
   * lesson manager approach. */
  class UnmanagedLesson {
    /**
     * @type {string}
     */
    #data;

    /**
     * @type {string}
     */
    #title;

    /**
     * @type {module:lessons/lesson.Lesson}
     */
    #lesson;

    /**
     * @type {module:lessons/lessonManager.LessonOrigin}
     */
    #origin;

    /**
     * Create the unmanaged lesson
     * @param {string} title - the title of the lesson.
     * @param {string} data - the raw text for the lesson.
     * @param {module:lessons/lessonManager.LessonOrigin} origin - origin of the lesson
     */
    constructor(title, data, origin) {
      this.#title = title;
      if (data) {
        this.#lesson = this.#convertDataToLesson(data);
      }
      this.#origin = origin;
    }

    /**
     * Convert the lesson data into a lesson.
     * @param {string} data
     * @returns {module:lessons/lesson.Lesson}
     */
    #convertDataToLesson(data) {
      const lessonSource = LessonSource.createFromSource(data);
      return lessonSource.convertToLesson();
    }
    /**
     * @returns {boolean} true if there is lesson data.
     */
    get hasLesson() {
      return !!this.#lesson;
    }

    /**
     * @returns {module:lessons/lesson.Lesson}
     */
    get lesson() {
      return this.#lesson;
    }

    /**
     * Get the lesson info
     */
    get lessonInfo() {
      return this.#getUnmanagedLessonInfo(escapeHtml(this.#title), this.#origin);
    }

    /**
     * Get unmanaged lesson information.
     * The lesson info is undefined except for the managed flag which is false and
     * the lesson title.
     * @param {string} lessonTitle
     * @param {LessonOrigin} origin - this should be EMBEDDED or FILE_SYSTEM if unmanaged
     * @returns {LessonInfo}
     */
    #getUnmanagedLessonInfo(lessonTitle, origin) {
      return {
        origin: origin,
        usingLocalLibrary: false,
        libraryKey: undefined,
        file: undefined,
        url: undefined,
        indexes: {
          book: 0,
          chapter: 0,
          lesson: 0,
        },
        titles: {
          library: '',
          book: '',
          chapter: '',
          lesson: lessonTitle,
        },
      };
    }
  }

  /**
   * @file Origins for lessons
   *
   * @module lessons/lessonOrigins
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

  /**
   * Possible origins for lessons.
   * @const
   * @enum {string}
   */
  const LessonOrigin = {
    REMOTE: 'remote',
    LOCAL: 'local',
    EMBEDDED: 'embedded',
    FILE_SYSTEM: 'file_system',
  };

  /**
   * @file Handle lesson provided via embedded data in the file.
   *
   * @module lessons/embeddedLesson
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

  /** Class to handle lesson provided via the embedded data. */
  class EmbeddedLesson extends UnmanagedLesson {
    /**
     * Create the session lesson
     */
    constructor() {
      super(
        EmbeddedLesson.#getEmbeddedItem(
          'Embedded title',
          window.text2LessonEmbeddedData?.title
        ),
        EmbeddedLesson.#getEmbeddedItem(
          'Embedded source',
          window.text2LessonEmbeddedData?.source
        ),
        LessonOrigin.EMBEDDED
      );
    }

    /** Get the embedded root url. It will have the trailing /.
     * This is where the lesson originated.
     * @returns {string}
     */
    get rootUrl() {
      return window.text2LessonEmbeddedData?.rootUrl;
    }

    /**
     * Get the embedded translations.
     * @returns {string}
     */
    get translations() {
      return window.text2LessonEmbeddedData?.translations;
    }

    /**
     * Gets the stored item. All items stored are expected to be in base64.
     * @param {string} name - just used for logging.
     * @param {string} data
     * @returns {string}
     */
    static #getEmbeddedItem(name, data) {
      if (data) {
        try {
          return base64ToString(data);
        } catch (error) {
          console.error(
            `Could not decoded embedded variable ${name}. Data: ${data} `
          );
        }
      }
      return null;
    }
  }

  const embeddedLesson = new EmbeddedLesson();

  /**
   * @file Collection of urls.
   *
   * @module data/urls
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


  let rootUrl = embeddedLesson.hasLesson
    ? embeddedLesson.rootUrl
    : window.location.href.replace(/index\.html(\?.*)?$/, '');
  if (!rootUrl.endsWith('/')) {
    rootUrl += '/'; // defensive
  }

  const DOCS_ROOT_URL = 'https://henspace.com/text2lesson-docs/';

  /**
   * @enum {string}
   */
  const Urls = {
    ROOT: `${rootUrl}`,
    LOGO: `${rootUrl}assets/images/logo.png`,
    HELP: `${DOCS_ROOT_URL}about.html`,
    PRIVACY: `${DOCS_ROOT_URL}privacy.html`,
  };

  /**
   * @file Implementation of local libraries.
   *
   * @module lessons/localLibrary
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

  /**
   * @type {Map.<string, lessons/lessonManager~LibraryInfo>}
   * @typedef {} LibraryInfo - Information about a library.
   * @property {string} title - title of the library
   * @property {string} file - file containing the books available in the library.
   * This file should contain a JSON representation of a {@link Library}
   * object.
   */

  /**
   * @typedef {Object} LocalLesson
   * @property {string} title - title of the lesson
   * @property {string} content - the text that defines the lesson
   */

  /**
   * Class to present local storage as a library.
   */
  class LocalLibrary {
    /**
     * @type {string}
     * @const
     */
    static LOCAL_LIBRARY_KEY = 'LOCAL_LIBRARY';

    /**
     * @type {string}
     * @const
     */
    static LOCAL_LIBRARY_INDEX_KEY = 'LOCAL_LIBRARY_INDEX';

    /**
     * @type {string}
     * @const
     */
    static LOCAL_LESSON_KEY_PREFIX = 'LocalLesson_';

    /**
     * @type {number}
     * @const
     */
    static NUMBER_OF_INITIAL_LESSONS = 4;
    /**
     * @type {string}
     */
    #key;
    /**
     * @type {string}
     */
    #title;

    /**
     * @type {function():module:lessons/lessonManager~Library}
     */
    #contentLoader;

    /**
     * Construct the local library.
     */
    constructor() {
      this.#key = LocalLibrary.LOCAL_LIBRARY_KEY;
      this.#title = i18n`Local library`;
      this.#contentLoader = () => this.#getLibraryContent();
    }

    /**
     * Get the local library key.
     * @returns {string}
     */
    get key() {
      return this.#key;
    }

    /**
     * Get the library info.
     * @returns {module:lessons/lessonManager~LibraryInfo}
     */
    get info() {
      return {
        title: this.#title,
        contentLoader: this.#contentLoader,
      };
    }

    /**
     * Get the default lesson keys
     * @returns {number[]}
     */
    #getDefaultLessonKeys() {
      const indexes = [];
      for (
        let index = 0;
        index < LocalLibrary.NUMBER_OF_INITIAL_LESSONS;
        index++
      ) {
        indexes.push(index);
      }
      return indexes;
    }

    /**
     * Get the current local library lesson keys. These are all the books stored
     * in local storage.
     * @returns {numbers[]}
     */
    #getLessonKeys() {
      return persistentData.getFromStorage(
        LocalLibrary.LOCAL_LIBRARY_INDEX_KEY,
        this.#getDefaultLessonKeys()
      );
    }

    /**
     * Save the local library lesson keys. These are all the lessons stored
     * in local storage.
     * @param {number[]} keys
     */
    #saveLessonKeys(keys) {
      persistentData.saveToStorage(LocalLibrary.LOCAL_LIBRARY_INDEX_KEY, keys);
    }

    /**
     * Gets an object representing the local library content.
     * @returns {module:lessons/lessonManager~LibraryContent}
     */
    #getLibraryContent() {
      const book = {
        title: i18n`My personal lesson book`,
        location: '',
        chapters: [{ title: i18n`Chapter 1`, lessons: [] }],
      };

      const lessonKeys = this.#getLessonKeys();
      lessonKeys.forEach((key) => {
        const localLesson = this.#loadLocalLesson(key);
        book.chapters[0].lessons.push({
          title: localLesson.title,
          contentLoader: () => localLesson.content,
        });
      });
      return [book];
    }

    /**
     * Get the storage key for a particular book's key.
     * @param {number} key
     */
    #getStorageKeyForLessonKey(key) {
      return `${LocalLibrary.LOCAL_LESSON_KEY_PREFIX}${key}`;
    }

    /**
     * Load a local lesson from storage.
     * @param {number} key
     * @returns {LocalLesson}
     */
    #loadLocalLesson(key) {
      const lessonHelpLink = `[How to write lessons](${Urls.HELP})`;
      const defaultLesson = {
        title: i18n`Untitled lesson`,
        content: i18n`(i)This is a lesson which you need to create. See ${lessonHelpLink}`,
      };
      return persistentData.getFromStorage(
        this.#getStorageKeyForLessonKey(key),
        defaultLesson
      );
    }

    /**
     * Save the local lesson.
     * @param {number} index
     * @param {LocalLesson} localLesson
     */
    saveLocalLessonAtIndex(index, localLesson) {
      const keys = this.#getLessonKeys();
      if (index < 0 || index >= keys.length) {
        console.error(`Attempt to store to index ${index} ignored.`);
        return;
      }
      const key = keys[index];
      persistentData.saveToStorage(
        this.#getStorageKeyForLessonKey(key),
        localLesson
      );
    }

    /**
     * Get a free key. Searches through all the indexes to find any gaps.
     * @returns {number}
     */
    #getFreeKey() {
      const indexes = this.#getLessonKeys();
      indexes.sort();
      for (let n = 0; n < indexes.length - 1; n++) {
        if (indexes[n + 1] - indexes[n] > 1) {
          return indexes[n] + 1;
        }
      }
      return indexes[indexes.length - 1] + 1;
    }

    /**
     * Add a new lesson slot.
     */
    addNewLessonSlot() {
      const key = this.#getFreeKey();
      const keys = this.#getLessonKeys();
      keys.push(key);
      this.#saveLessonKeys(keys);
    }

    /**
     * Delete a lesson slot.
     */
    deleteLessonAtIndex(index) {
      const keys = this.#getLessonKeys();
      const key = keys[index];
      if (key != undefined) {
        console.debug(`Removing lesson storage index: ${index}; key:${key}`);
        persistentData.removeFromStorage(this.#getStorageKeyForLessonKey(key));
        keys.splice(index, 1);
        this.#saveLessonKeys(keys);
      }
    }
  }

  /**
   * @file Manager for fetching the lesson plan
   * Lessons are structured as follows:
   * + this.#libraries {@link module:lessons/lessonManager~Library}: object
   * containing all available this.#libraries.
   * + Library {@link module:lessons/lessonManager~LibraryDetails}:
   * contains a number of different this.#libraries. These this.#libraries contain a
   * Catalogue.
   * + Catalogue {@link module:lessons/lessonManager~CatalogueDetails}: contains
   * an array of Books.
   * + Book {@link module:lessons/lessonManager~BookDetails}: contains and array
   * of Chapters.
   * + Chapter {@link module:lessons/lessonManager~ChapterDetails}: effectively
   * sections within a book containing a number of lessons.
   * + Lesson {@link module:lessons/lessonManager~LessonDetails}: this is the
   * final element of the book and contains the information that is actually run
   * by the application.
   *
   * @module lessons/lessonManager
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


  /**
   * @typedef {Map<string, LibraryInfo>} Libraries - object containing
   * all available this.#libraries accessible to the application. The keyword is used
   * as a unique identifier for the library.
   */

  /**
   * @typedef {Object} LibraryInfo - Information about a library.
   * @property {string} title - title of the library
   * @property {string | function():LibraryContent} url - the url name which
   * provides the path to a JSON representation of a {@link LibraryContent}
   * object.
   * @property {function():LibraryContent} contentLoader - loader for the content as an alternative
   * to provided the {@link LibraryContent}. This takes precedence over the url.
   *
   * {@link LibraryContent} object directly.
   */

  /**
   * @typedef {Map<string, Library>} this.#libraries - object containing
   * all available this.#libraries accessible to the application. The keyword is used
   * as a unique identifier for the library.
   */

  /**
   * @typedef {BookDetails[]} LibraryContent
   */
  /**
   * @typedef {Object} Library - the library as used by the application.
   * @property {string} title - title of the library
   * @property {string} file - file containing the books available in the library.
   * This file should contain a JSON representation of a {@link LibraryContent}
   * object.
   * @property {LibraryContent} books - the books in the library
   */

  /**
   * @typedef {Object} BookDetails
   * @property {string} title - title of the book
   * @property {string} location - the path to where the files in each lesson are
   * located. This should have a trailing forward slash.
   * @property {ChapterDetails[]} chapters - details of the chapters in the book.
   */

  /**
   * @typedef {Object} ChapterDetails - details of a book chapter.
   * @property {string} title - title of the chapter.
   * @property {LessonDetails[]} lessons - lessons in the chapter.
   */

  /**
   * @typedef {Object} LessonDetails - details of a lesson.
   * @property {string} title - title of the lesson.
   * @property {string} file - path to the actual lesson if it needs to be loaded.
   * @property {function():string} contentLoader - loader for the content as an alternative
   * to provided the file. This takes precedence.
   */

  /**
   * @typedef {Object} LessonInfo
   * @property {LessonOrigin} - indicate of where the lesson originated. If this is not REMOTE, all other fields are unmanaged.
   * @property {boolean} usingLocalLibrary - flag whether the lesson manager is using local lessons.
   * @property {string} libraryKey - key for the library
   * @property {string} file - file without any path.
   * @property {string} url - the url of the lesson. This is used as its unique key.
   * @property {Object} indexes
   * @property {number} indexes.book - index of the book
   * @property {number} indexes.chapter - index of the chapter
   * @property {number} indexes.lesson - index of the lesson
   * @property {Object} titles
   * @property {string} titles.library - title of the library
   * @property {string} titles.book - title of the book
   * @property {string} titles.chapter - title of the chapter
   * @property {string} titles.lesson - title of the lesson
   */

  class LessonManager {
    /**
     * @type {boolean}
     */
    #usingLocalLibrary = false;

    /**
     * Available this.#libraries.
     * @type {Map.<string, Libraries>}
     */
    #libraries = new Map();
    #remoteLibraryKey;
    #currentLibraryKey;
    #currentBookIndex = 0;
    #currentChapterIndex = 0;
    #currentLessonIndex = 0;
    /**
     * @type {CachedLesson}
     */
    #cachedLesson;

    constructor() {}

    /** Set the current remote library key.
     * The library's catalog should have already been loaded.
     * If the key is invalid, the first entry in the this.#libraries is used and storage
     * is switched to the local library
     * @param {string} key the library key.
     */
    set remoteLibraryKey(key) {
      if (!this.#libraries.has(key)) {
        console.error(
          `Ignored attempt to set remote invalid remote library key ${key}.`
        );
        this.#usingLocalLibrary = true;
        return;
      }
      this.#remoteLibraryKey = key;
      if (!this.#usingLocalLibrary) {
        this.#currentLibraryKey = this.#remoteLibraryKey;
      }
    }

    /**
     * Switch which library is in use.
     * @param {boolean} value - true to switch to local library.
     */
    set usingLocalLibrary(value) {
      this.#usingLocalLibrary = value;
      this.#currentLibraryKey = this.#usingLocalLibrary
        ? LocalLibrary.LOCAL_LIBRARY_KEY
        : this.#remoteLibraryKey;
    }

    /**
     *  Get which library is in use.
     *  @returns {boolean} true if using local library.
     */
    get usingLocalLibrary() {
      return this.#usingLocalLibrary;
    }

    /**
     * Set the index of the book we are working on.
     * @param {number} index
     */
    set bookIndex(index) {
      const library = this.#libraries.get(this.#currentLibraryKey);
      if (!library) {
        this.#currentBookIndex = 0;
        return;
      }
      this.#currentBookIndex = this.#ensurePositiveInt(index);
    }

    /**
     * Set the index of the chapter we are working on.
     * @param {number} index
     */
    set chapterIndex(index) {
      this.#currentChapterIndex = this.#ensurePositiveInt(index);
    }

    /**
     * Set the index of the lesson we are working on.
     * @param {number} index
     */
    set lessonIndex(index) {
      this.#currentLessonIndex = this.#ensurePositiveInt(index);
    }

    /**
     * Get the current library title. If key is not valid, returns an empty string.
     * @returns {string}
     */
    get libraryTitle() {
      const title = this.#libraries.get(this.#currentLibraryKey)?.title;
      return title ?? '';
    }

    /**
     * Get the library titles.
     * @returns {Map<string, string>}
     */
    get libraryTitles() {
      const options = new Map();
      this.#libraries.forEach((value, key) => {
        options.set(key, value.title);
      });
      return options;
    }

    /**
     * Get the remote library titles.
     * This ignores local storage.
     * @returns {Map<string, string>}
     */
    get remoteLibraryTitles() {
      const options = new Map();
      this.#libraries.forEach((value, key) => {
        if (key !== LocalLibrary.LOCAL_LIBRARY_KEY) {
          options.set(key, value.title);
        }
      });
      return options;
    }

    /**
     * Get the book chapter title. If index is not valid, returns an empty string.
     * @returns {string}
     */
    get bookTitle() {
      const title = this.#getCurrentBook()?.title;
      return title ?? '';
    }

    /**
     * Get list of all the book titles.
     * @returns {string[]}
     */
    get bookTitles() {
      const titles = [];
      this.#libraries.get(this.#currentLibraryKey)?.books.forEach((value) => {
        titles.push(value.title);
      });
      return titles;
    }

    /**
     * Get the current chapter title. If index is not valid, returns an empty string.
     * @returns {string}
     */
    get chapterTitle() {
      const title =
        this.#getCurrentBook()?.chapters[this.#currentChapterIndex]?.title;
      return title ?? '';
    }

    /**
     * Get list of all the chapter titles.
     * @returns {string[]}
     */
    get chapterTitles() {
      const titles = [];
      this.#getCurrentBook().chapters.forEach((value) => {
        titles.push(value.title);
      });
      return titles;
    }

    /**
     * Get the current lesson title. If index is not valid, returns an empty string.
     * @returns {string}
     */
    get lessonTitle() {
      const title =
        this.#getCurrentBook()?.chapters[this.#currentChapterIndex]?.lessons[
          this.#currentLessonIndex
        ]?.title;
      return title ?? '';
    }
    /**
     * Get list of all the lesson titles.
     * @returns {string[]}
     */
    get lessonTitles() {
      const titles = [];
      this.#getCurrentBook().chapters[this.#currentChapterIndex].lessons.forEach(
        (value) => {
          titles.push(value.title);
        }
      );
      return titles;
    }

    /**
     * @typedef {Object} LessonDetails
     * @property {string} libraryTitle
     * @property {string} bookTitle
     * @property {string} chapterTitle
     * @property {string} lessonTitle
     * @property {string} lessonFile
     */

    /**
     * Get the current lesson information.
     * @returns {LessonInfo}
     */
    get currentLessonInfo() {
      return this.#buildCurrentLessonInfo();
    }

    /**
     * Build the current lesson information.
     * @param {string} url - the url for the lesson. This is used as its unique key.
     * @returns {LessonInfo}
     */
    #buildCurrentLessonInfo(url) {
      this.#ensureIndexesValid();
      const book = this.#getCurrentBook();
      return {
        origin: this.#usingLocalLibrary
          ? LessonOrigin.LOCAL
          : LessonOrigin.REMOTE,
        usingLocalLibrary: this.#usingLocalLibrary,
        libraryKey: this.#currentLibraryKey,
        file: book?.chapters[this.#currentChapterIndex]?.lessons[
          this.#currentLessonIndex
        ]?.file,
        url: url,
        indexes: {
          book: this.#currentBookIndex,
          chapter: this.#currentChapterIndex,
          lesson: this.#currentLessonIndex,
        },
        titles: {
          library: this.#libraries.get(this.#currentLibraryKey)?.title,
          book: book?.title,
          chapter: book?.chapters[this.#currentChapterIndex]?.title,
          lesson:
            book?.chapters[this.#currentChapterIndex]?.lessons[
              this.#currentLessonIndex
            ]?.title,
        },
      };
    }

    /**
     * Form url to retrieve the lesson under book, chapter and sections.
     * The current settings for the library key and indexes are used.
     * @returns {string} the url for the lesson content.
     */
    formUrlForLesson() {
      const books = this.#libraries.get(this.#currentLibraryKey).books;
      const fileLocation = books[this.#currentBookIndex].location;
      const fileName =
        books[this.#currentBookIndex].chapters[this.#currentChapterIndex].lessons[
          this.#currentLessonIndex
        ].file;
      return `${fileLocation}${fileName}`;
    }

    /**
     * Makes sure index is a positive integer.
     * @param {string | number} index
     * @returns integer index or 0 if index is not valid
     */
    #ensurePositiveInt(index) {
      index = parseInt(index);
      return isNaN(index) || index < 0 ? 0 : index;
    }

    /**
     * Ensure all indexes are within the bounds of the library's contents.
     * Any invalid index is set to 0.
     * If library.books is not set, not indexes are adjusted.
     */
    #ensureIndexesValid() {
      const library = this.#libraries.get(this.#currentLibraryKey);

      if (this.#indexInvalid(this.#currentBookIndex, library?.books)) {
        this.#currentBookIndex = 0;
      }
      const book = library?.books[this.#currentBookIndex];
      if (this.#indexInvalid(this.#currentChapterIndex, book?.chapters)) {
        this.#currentChapterIndex = 0;
      }
      const chapter = book?.chapters[this.#currentChapterIndex];
      if (this.#indexInvalid(this.#currentLessonIndex, chapter?.lessons.length)) {
        this.#currentLessonIndex = 0;
      }
    }

    /** Check if index is invalid.
     * It is regarded as invalid if it is out of the bounds of the array.
     * If the array is null or undefined, then then index is _NOT_ regarded as
     * invalid.
     * @returns {boolean}
     */
    #indexInvalid(index, arrayData) {
      if (arrayData === null || arrayData === undefined) {
        return false;
      }
      return isNaN(index) || index < 0 || index >= arrayData.length;
    }

    /**
     * Utility function to simplify code.
     * @returns {BookDetails}
     */
    #getCurrentBook() {
      return this.#libraries.get(this.#currentLibraryKey).books[
        this.#currentBookIndex
      ];
    }

    /**
     * Set the available libraries. The `librariesFileLocation` should be the path
     * to a JSON representation of a `libraries` object.
     * Note that all titles are escaped.
     * @param {string} librariesFileLocation - if null or empty, just local libraries are loaded.
     * @returns {Promise} fufils to number of libraries.
     */
    loadAllLibraries(librariesFileLocation) {
      this.#libraries = new Map();
      const localLibrary = new LocalLibrary();
      this.#libraries.set(localLibrary.key, localLibrary.info);
      if (!librariesFileLocation) {
        return Promise.resolve(this.#libraries.size);
      }
      return fetchJson(librariesFileLocation).then((entries) => {
        for (const key in entries) {
          const entry = entries[key];
          entry.title = escapeHtml(entry.title);
          this.#libraries.set(key, entries[key]);
          this.#libraries.get(key).books = [];
        }
        return this.#libraries.size;
      });
    }

    /**
     * Load the current libraries. This is the local storage library and the
     * current remote library.
     * @returns {Promise} fulfils to undefined.
     */
    loadAllLibraryContent() {
      return this.#loadLibraryContent(LocalLibrary.LOCAL_LIBRARY_KEY).then(() =>
        this.#loadLibraryContent(this.#remoteLibraryKey)
      );
    }

    /**
     * Load the library associated with the key. If the key is invalid,
     * it is altered to the first key of the #libraries.
     * Indexes are set to zero if found to be invalid.
     * @param {string} key - the library key
     * @param {boolean} [force] - if true, the content will be reloaded even if it exists.
     * @returns {Promise} fulfils to undefined.
     */
    #loadLibraryContent(key, force) {
      const library = this.#libraries.get(key);

      if (library.books?.length > 0 && !force) {
        return Promise.resolve();
      }
      if (library.contentLoader) {
        library.books = library.contentLoader();
        this.#escapeAllTitles(library.books);
        this.#ensureIndexesValid();
        return Promise.resolve();
      }
      return fetchJson(library.url).then((value) => {
        library.books = value;
        this.#escapeAllTitles(library.books);
        this.#ensureIndexesValid();
        return;
      });
    }

    /**
     * Escape all the titles in the books
     * @param {BookDetails}
     */
    #escapeAllTitles(books) {
      books.forEach((book) => {
        book.title = escapeHtml(book.title);
        book.chapters.forEach((chapter) => {
          chapter.title = escapeHtml(chapter.title);
          chapter.lessons.forEach((lesson) => {
            lesson.title = escapeHtml(lesson.title);
          });
        });
      });
    }

    /**
     * Load the current lesson.
     * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
     */
    loadCurrentLesson() {
      this.#ensureIndexesValid();
      const contentLoader =
        this.#getCurrentBook().chapters[this.#currentChapterIndex].lessons[
          this.#currentLessonIndex
        ].contentLoader;

      if (contentLoader) {
        return this.#loadLessonUsingContentLoader(contentLoader);
      } else {
        return this.#loadRemoteLesson();
      }
    }

    /**
     * Load the current lesson from local storage.
     * @param {function():string} contentLoader - function that directly loads the
     * content.
     * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
     */
    #loadLessonUsingContentLoader(contentLoader) {
      return Promise.resolve(
        new CachedLesson(this.#buildCurrentLessonInfo(''), contentLoader())
      );
    }
    /**
     * Load the current lesson from remote storage.
     * @returns {Promise} Fulfils to {@link module:lessons/cachedLesson~CachedLesson}
     */
    #loadRemoteLesson() {
      const url = this.formUrlForLesson();
      if (this.#cachedLesson?.info.url === url) {
        console.info(`Using cached version of lesson: ${url}`);
        return Promise.resolve(CachedLesson.clone(this.#cachedLesson));
      }
      this.#cachedLesson = new CachedLesson(this.#buildCurrentLessonInfo(url));

      return fetchText(url).then((text) => {
        console.info(`Loaded lesson: ${url}`);
        this.#cachedLesson.content = text;
        return CachedLesson.clone(this.#cachedLesson);
      });
    }

    /**
     * Updates the lesson content.
     * This can only be called if using a local library.
     * @param {string} title - lesson title.
     * @param {string} content - lesson content.
     * @throws {Error} thrown if trying to update a remote lesson.
     * @returns {Promise} fulfils to undefined.
     */
    updateCurrentLessonContent(title, content) {
      if (!this.#usingLocalLibrary) {
        throw new Error('Attempt made to update a remote library.');
      }
      new LocalLibrary().saveLocalLessonAtIndex(this.#currentLessonIndex, {
        title: title,
        content: content,
      });
      return this.#loadLibraryContent(LocalLibrary.LOCAL_LIBRARY_KEY, true);
    }

    /**
     * Add lesson to local library.
     * @returns {Promise} fulfils to undefined
     */
    addLessonToLocalLibrary() {
      const localLibrary = new LocalLibrary();
      localLibrary.addNewLessonSlot();
      this.#libraries.set(localLibrary.key, localLibrary.info);
      return this.#loadLibraryContent(localLibrary.key, true);
    }

    /**
     * Delete the current local library slot.
     * @returns {Promise} fulfils to undefined
     */
    deleteLocalLibraryCurrentLesson() {
      if (!this.#usingLocalLibrary) {
        console.error(
          'Ignored attempt to delete local library when it is not the active library.'
        );
        return Promise.resolve();
      }
      const localLibrary = new LocalLibrary();
      localLibrary.deleteLessonAtIndex(this.#currentLessonIndex);
      this.#libraries.set(localLibrary.key, localLibrary.info);
      return this.#loadLibraryContent(localLibrary.key, true);
    }
  }

  /**
   * Lesson Manager for embedded lessons. These don't have access to JSON and therefore
   * There is no remote access.
   */
  class EmbeddedLessonManager {
    loadAllLibraries(librariesFileLocation) {
      console.debug(
        `Embedded lesson manager ignore attempt to load ${librariesFileLocation}`
      );
    }
    loadAllLibraryContent() {
      console.debug(
        `Embedded lesson manager ignored attempt to load all library content`
      );
    }
  }

  const lessonManager = embeddedLesson.hasLesson
    ? new EmbeddedLessonManager()
    : new LessonManager();

  /**
   * @file Definition of settings.
   *
   * @module data/settingDefinitions
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


  const DEFAULT_HUE = 120;
  const DEFAULT_SATURATION = 50;
  const DEFAULT_COLOR_SPREAD = 120;
  const DEFAULT_DARK_MODE = false;
  const DEFAULT_FONT_SIZE = 15;
  const DEFAULT_LIBRARY_KEY = 'EN';
  const DEFAULT_READING_SPEED = '180';

  /**
   * Create a palette.
   * @param {module:utils/color/colorPalettes~PaletteSettings} settings
   */
  function setPalette(settings) {
    settings.hue =
      settings.hue ?? persistentData.getFromStorage('hue', DEFAULT_HUE);
    settings.saturation =
      settings.saturation ??
      persistentData.getFromStorage('saturation', DEFAULT_SATURATION);
    settings.spread =
      settings.spread ??
      persistentData.getFromStorage('spread', DEFAULT_COLOR_SPREAD);
    settings.dark =
      settings.dark ??
      persistentData.getFromStorage('darkMode', DEFAULT_DARK_MODE);
    setCssFromPalette(createPalette(settings));
  }

  /**
   * Get the definitions for all settings. Definition contain key, value settings.
   * This provided as a function to ensure template tags are executed after
   * languages have been loaded.
   * @returns  {SettingDefinitions}
   */
  function getSettingDefinitions() {
    return {
      palette: {
        type: 'separator',
        label: i18n`Colour settings`,
      },
      hue: {
        type: 'range',
        label: i18n`Palette hue`,
        defaultValue: DEFAULT_HUE,
        min: 0,
        max: 360,
        onupdate: (value) => {
          value = parseInt(value);
          setPalette({ hue: value });
        },
      },
      saturation: {
        type: 'range',
        label: i18n`Palette saturation`,
        defaultValue: DEFAULT_SATURATION,
        min: 0,
        max: 100,
        onupdate: (value) => {
          value = parseInt(value);
          setPalette({ saturation: value });
        },
      },
      spread: {
        type: 'range',
        label: i18n`Palette spread`,
        defaultValue: DEFAULT_COLOR_SPREAD,
        min: 0,
        max: 180,
        onupdate: (value) => {
          value = parseInt(value);
          setPalette({ spread: value });
        },
      },
      darkMode: {
        type: 'checkbox',
        label: i18n`Dark mode`,
        defaultValue: DEFAULT_DARK_MODE,
        onupdate: (value) => {
          setPalette({ dark: value });
        },
      },
      fontSize: {
        type: 'range',
        label: i18n`Font size`,
        defaultValue: DEFAULT_FONT_SIZE,
        min: 10,
        max: 22,
        onupdate: (value) => {
          setProperty('--font-base-size', `${value}px`);
        },
      },
      hideButtonText: {
        type: 'checkbox',
        label: i18n`Hide button labels`,
        defaultValue: false,
        onupdate: (value) => {
          icons.hideText = value;
        },
      },
      readingSpeed: {
        type: 'range',
        label: i18n`Reading speed (wpm)`,
        defaultValue: DEFAULT_READING_SPEED,
        min: 80,
        max: 1000,
      },
      lessonInfo: {
        type: 'separator',
        label: i18n`Lesson settings`,
      },
      library: {
        type: 'select',
        label: i18n`Remote library`,
        defaultValue: DEFAULT_LIBRARY_KEY,
        onupdate: (value) => {
          lessonManager.remoteLibraryKey = value;
        },
        options: () => lessonManager.remoteLibraryTitles,
        reloadIfChanged: true,
      },
      showFirstUseMessage: {
        type: 'checkbox',
        label: i18n`Show first use message`,
        defaultValue: true,
      },
    };
  }

  /**
   * @file button classes
   *
   * @module utils/userIo/buttons
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

  /**
   * Managed button.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class BarButton extends ManagedElement {
    /**
     * Button
     * @param {string | module:utils/userIo/icons~IconDetails} IconDetail - if just a string
     * it is assumed to hold a string that is suitable for accessibility.
     * @param {string} detail.content the text to display. This can contain HTML and soe
     * @param {string} detail.accessibleName text for accessibility
     */
    constructor(detail) {
      super('button');
      if (detail.content) {
        icons.applyIconToElement(detail, this.element);
      } else {
        this.innerHTML = detail;
      }
    }
  }

  /**
   * Button bar. This is a managed element so when it is removed, its children
   * and any attached listeners are also removed.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class ButtonBar extends ManagedElement {
    constructor() {
      super('div', 'utils-button-bar');
    }
    /**
     * Add buttons to the button bar. If there are no buttons, an OK button is
     * automatically added.
     * @param {string[] | {content: string, accessibleName: string}} definition of buttons.
     * @returns {Promise} Fulfils to the index of the button that fulfils.
     */
    showButtons(buttons) {
      if (!buttons?.length) {
        buttons = [icons.ok];
      }
      this.resolutionFunction = null;
      const promise = new Promise((resolve) => {
        this.resolutionFunction = resolve;
      });

      buttons.forEach((value, index) => {
        const button = new BarButton(value);
        button.setAttribute('data-index', index);
        this.appendChild(button, index);
        this.listenToEventOn('click', button, index);
      });
      focusManager.findBestFocus();
      return promise;
    }

    /**
     * Handle the click event from the buttons.
     * @param {Event} eventIgnored - triggering event
     * @param {string} eventId - id of the event
     */
    handleClickEvent(eventIgnored, eventId) {
      const index = parseInt(eventId);
      this.resolutionFunction(index);
    }
  }

  /**
   * @file modal mask
   *
   * @module utils/userIo/modalMask
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

  /**
   * @type {Element}
   */
  const mask = document.getElementById('modal-mask');

  /**
   * @type {string[]}
   */
  const standardSelectionIds = ['title-bar', 'content', 'footer'];

  /**
   * @type {number}
   */
  let referenceCount = 0;

  /**
   * @typedef {Object} MaskedItems
   * @property {Element} element - the element that has been masked
   * @property {boolean} ariaHidden - the state of the aria-hidden attribute before masking
   * @property {boolean} disabled - the state of the disable property before masking.
   */

  /**
   * @type {MaskedItems[]}
   */
  let itemsToRestore = [];

  /**
   * Mask the element. This prevents it being click or tabbed to.
   * @param {Element} element
   */
  function deactivateElement(element) {
    console.debug(`Deactivating ${element.tagName}: ${element.className}`);
    const elementDetails = {
      element: element,
      'aria-hidden': element.getAttribute('aria-hidden'),
      disabled: element.disabled,
      tabIndex: element.tabIndex,
    };
    itemsToRestore.push(elementDetails);
    element.setAttribute('aria-hidden', true);
    if (element.disabled !== undefined) {
      element.disabled = true;
    }
    element.tabIndex = -1;
  }

  /**
   * Restore deactivated items.
   */
  function reactivateItems() {
    itemsToRestore.forEach((item) => {
      if (!item.ariaHidden) {
        item.element.removeAttribute('aria-hidden');
      } else {
        item.element.setAttribute('aria-hidden', item.ariaHidden);
      }
      if (item.disabled !== undefined) {
        item.element.disabled = item.disabled;
      }
      if (item.tabIndex !== undefined) {
        item.element.tabIndex = item.tabIndex;
      }
    });
    itemsToRestore = [];
  }
  /**
   * Mask all the items in the `containersToMask` array.
   * The items are disabled and the `aria-hidden` attribute set to true.
   */
  function deactivateItems() {
    standardSelectionIds.forEach((id) => {
      document
        .getElementById(id)
        .querySelectorAll('button,.selectable,input,textarea')
        .forEach((element) => {
          deactivateElement(element);
        });
    });
  }

  /**
   * Show the modal mask
   */
  function showMask() {
    mask.style.visibility = 'visible';
    if (referenceCount === 0) {
      deactivateItems();
    } else {
      console.debug(
        `Reference count ${referenceCount} is > 0 so mask already in place.`
      );
    }
    referenceCount++;
  }

  /**
   * Hide the modal mask
   */
  function hideMask() {
    if (--referenceCount > 0) {
      console.debug(
        `Reference count ${referenceCount} is > 0 so leave mask in place.`
      );
      return;
    }
    reactivateItems();
    mask.style.visibility = 'hidden';
  }

  /**
   * @file Simple popup dialog.
   *
   * @module utils/dialog/modalDialog
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  /**
   * @typedef {Object} DialogDefinition
   * @property {string} title
   * @property {string | Element} content - html to display. This is not escaped and as
   * such is vulnerable to script injection. It is the caller's responsibility to
   * santise the data.
   * @property {ModalDialog.DialogType} dialogType
   * @property {string[]} iconClasses - array of classes that are applied to the icon
   * @property {string[] | string | module:utils/userIo/icons~IconDetails[]} buttons - array of labels for buttons. These normally
   * only apply to questions.
   */

  /**
   * Get the appropriate FontAwesome classes for dialogType
   * @param {ModalDialog.DialogType} dialogType
   * @returns {module:utils/icons~IconDetails} icon
   */
  function getIconDetailsForType(dialogType) {
    switch (dialogType) {
      case ModalDialog.DialogType.WARNING:
        return icons.warning;
      case ModalDialog.DialogType.ERROR:
        return icons.error;
      case ModalDialog.DialogType.FATAL:
        return icons.fatal;
      case ModalDialog.DialogType.QUESTION:
        return icons.question;
      case ModalDialog.DialogType.SETTINGS:
        return icons.settings;
      case ModalDialog.DialogType.INFO:
      default:
        return icons.info;
    }
  }

  /**
   * ModalDialog class.
   */
  class ModalDialog {
    /**
     * Enum for different dialog types
     * @const
     * @enum {string}
     */
    static DialogType = {
      ERROR: 'error',
      FATAL: 'fatal',
      INFO: 'info',
      QUESTION: 'question',
      SETTINGS: 'settings',
      WARNING: 'warning',
    };

    /**
     * Enum of return values from dialogs. These are the indexes of the associated buttons.
     * @const
     * @enum{number}
     */
    static DialogIndex = {
      SETTINGS_OK: 0,
      SETTINGS_RESET: 1,
      CONFIRM_YES: 0,
      CONFIRM_NO: 1,
    };

    /** @type{boolean} */
    static #isConstructing = false;

    /**
     * Main dialog container
     * @type{module:utils/userIo/managedElement.ManagedElement}
     */
    #dialog;

    /**
     * Element containing the dialog title.
     * @type{module:utils/userIo/managedElement.ManagedElement}
     */
    #titleText;

    /**
     * Element containing the dialog icon.
     * @type{module:utils/userIo/managedElement.ManagedElement}
     */
    #icon;

    /**
     * Element containing the dialog content.
     * @type{module:utils/userIo/managedElement.ManagedElement}
     */
    #content;

    /**
     * Element containing the button bar.
     * @type{module:utils/userIo/managedElement.ManagedElement}
     */
    #buttonBar;

    /**
     * Constructor. Do not call directly. A factory method should be used.
     * @throws {Error} Constructor must be called via factory method.
     */
    constructor() {
      if (!ModalDialog.#isConstructing) {
        throw new Error('ModalDialog should be instantiated via factory method.');
      }
      this.#createHtml();
    }

    /** Instantiate a new ModalDialog.
     * @returns {ModalDialog}
     * @private
     */
    static #constructDialog() {
      ModalDialog.#isConstructing = true;
      const dialog = new ModalDialog();
      ModalDialog.#isConstructing = false;
      return dialog;
    }

    /**
     * Create the html infrastructure for the dialog.
     * @private
     */
    #createHtml() {
      this.#dialog = new ManagedElement('div', 'utils-dialog');
      this.#dialog.classList.add('framed', 'modal');
      const titleBar = new ManagedElement('div', 'utils-title-bar');
      titleBar.classList.add('container');

      this.#icon = new ManagedElement('span', 'utils-dialog-icon');
      titleBar.appendChild(this.#icon);

      this.#titleText = new ManagedElement('span');
      titleBar.appendChild(this.#titleText);

      const contentFrame = new ManagedElement(
        'div',
        'utils-dialog-content-frame'
      );
      contentFrame.classList.add('container');

      this.#content = new ManagedElement('div', 'utils-dialog-content');
      contentFrame.appendChild(this.#content);

      this.#buttonBar = new ButtonBar();

      this.#dialog.appendChild(titleBar);
      this.#dialog.appendChild(contentFrame);
      this.#dialog.appendChild(this.#buttonBar);

      this.#dialog.appendTo(document.body);
    }

    /**
     * Show the dialog based on its DialogDefinition.
     * Note that the dialogDefinition can contain raw HTML so the caller should make
     * sure the data are sanitised to prevent code injection.
     * @param {DialogDefinition} dialogDefinition
     * @returns {Promise} Fulfils to index of button pressed.
     * @private
     */
    #showDialogDefinition(dialogDefinition) {
      this.#titleText.textContent = dialogDefinition.title;
      if (
        dialogDefinition.content instanceof Element ||
        dialogDefinition.content instanceof ManagedElement
      ) {
        this.#content.textContent = '';
        this.#content.appendChild(dialogDefinition.content);
      } else {
        this.#content.innerHTML = dialogDefinition.content;
      }

      icons.applyIconToElement(dialogDefinition.iconDetails, this.#icon, {
        hideText: true,
      });
      showMask();
      return this.#buttonBar
        .showButtons(dialogDefinition.buttons)
        .then((index) => {
          this.#hideDialog();
          focusManager.findBestFocus();
          return index;
        });
    }

    /**
     * Hide the dialog box.
     * @private
     */
    #hideDialog() {
      hideMask();
      this.#dialog.remove();
    }

    /**
     * Appends a reload warning to the content.
     * @param {string} content - html to add. This will be wrapped in a <p> element.
     * @returns {string | Element} Content with paragraph appended
     * @private
     */
    static #addReloadWarning(content) {
      let reloadText = i18n`A serious error has occurred. Wait a few minutes and then close this dialog to try to reload the application.`;
      if (reloadText === '') {
        reloadText =
          'A serious error has occurred and languages cannot be loaded. Wait a few minutes and then close this dialog to try to reload the application.';
      }
      if (content instanceof Element) {
        const para = document.createElement('p');
        para.textContent = reloadText;
        content.appendChild(para);
        return content;
      }
      return `${content}<p>${reloadText}</p>`;
    }

    /**
     * Popup the dialog box. If called multiple times, each call will be stacked
     * on top of the previous calls.
     *
     * When the dialog is closed, by clicking on the close icon or on the background,
     * the previous dialog will be displayed. The one exception is for dialogs with
     * dialogType equal to {@link ModalDialog.DialogType.ERROR}. This dialog type will reload the
     * application when closed. Automatic boiler plate text is added to the content
     * to explain this.
     * @param {string} title - any HTML <> characters will be escaped.
     * @param {*} content - content to display. This is treated as HTML
     * @param {Object} options - additional settings
     * @param {ModalDialog.DialogType} options.dialogType - dialog type.
     * @param {string[]} options.buttons - buttons to display.
     * @returns {Promise} Fulfils to 0 for all types except ModalDialog.DialogType.QUESTION.
     * For questions it Fulfils to the index of the button that was pressed. Rejects
     * if a dialog is already showing.
     */
    static showDialog(title, content, options) {
      const dialog = ModalDialog.#constructDialog();
      if (options?.dialogType === ModalDialog.DialogType.FATAL) {
        content = ModalDialog.#addReloadWarning(content);
      }

      const iconDetails = getIconDetailsForType(options?.dialogType);
      const dialogDefinition = {
        title: title && title.length > 0 ? title : ':',
        buttons: options?.buttons,
        content: content,
        dialogType: options?.dialogType,
        iconDetails: iconDetails,
      };
      return dialog.#showDialogDefinition(dialogDefinition);
    }

    /**
     * Shorthand method to call ModalDialog.showDialog('Settings', content, ModalDialog.DialogType.SETTINGS)
     * @param {string} content
     * @returns {Promise} Fulfils to index of button pressed.
     */
    static showSettingsDialog(content) {
      const options = {
        dialogType: ModalDialog.DialogType.SETTINGS,
        buttons: [icons.ok, icons.resetToFactory],
      };
      return ModalDialog.showDialog(i18n`Settings`, content, options);
    }

    /**
     * Shorthand call for ModalDialog.showDialog('Error', content, ModalDialog.DialogType.WARNING)
     * @param {string} content
     * @param {string} [title] - optional title.
     * @returns {Promise} Fulfils to index of button pressed.
     */
    static showWarning(content, title) {
      return ModalDialog.showDialog(title ?? i18n`Warning`, content, {
        dialogType: ModalDialog.DialogType.WARNING,
      });
    }

    /**
     * Shorthand call for ModalDialog.showDialog('Error', content, ModalDialog.DialogType.ERROR)
     * @param {string} content
     * @param {string} [title] - optional title.
     * @returns {Promise} Fulfils to index of button pressed.
     */
    static showError(content, title) {
      return ModalDialog.showDialog(title ?? i18n`Error`, content, {
        dialogType: ModalDialog.DialogType.ERROR,
      });
    }

    /**
     * Shorthand call for ModalDialog.showDialog('Information', content, ModalDialog.DialogType.INFO)
     * @param {string} content
     * @param {string} [title] - optional title.
     * @returns {Promise} Fulfils to index of button pressed.
     */
    static showInfo(content, title) {
      return ModalDialog.showDialog(title ?? i18n`Information`, content, {
        dialogType: ModalDialog.DialogType.INFO,
      });
    }

    /**
     * Shorthand call for ModalDialog.showDialog('Question', content, ModalDialog.DialogType.QUESTION)
     * @param {string} content
     * @param {string} [title] - optional title.
     * @returns {Promise} Fulfils to index of button pressed. This will be
     * ModalDialog.DialogIndex.CONFIRM_YES or ModalDialog.DialogIndex.CONFIRM_YES.
     */
    static showConfirm(content, title) {
      return ModalDialog.showDialog(title ?? i18n`Question`, content, {
        dialogType: ModalDialog.DialogType.QUESTION,
        buttons: [icons.yes, icons.no],
      });
    }

    /**
     * Shorthand call for ModalDialog.showDialog('Fatal error', content, ModalDialog.DialogType.FATAL)
     * @param {string} content
     * @param {string} [title] - optional title.
     * @returns {Promise} Fulfils to index of button pressed.
     */
    static showFatal(content, title) {
      return ModalDialog.showDialog(title ?? i18n`Fatal error`, content, {
        dialogType: ModalDialog.DialogType.FATAL,
      });
    }
  }

  /**
   * @file Utility to handle reloading after setting changes.
   *
   * @module utils/userIo/reloader
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


  /**
   * Singleton class to manage reloading the application.
   */
  class Reloader {
    #reloadRequired = false;
    #reason = '';
    constructor() {}

    /**
     * Flag that a reload is required. This is used by reloadIfRequired to decide
     * if the application should be reloaded.
     * @param {string} reason
     */
    flagAsRequired(reason) {
      this.#reason = reason;
      this.#reloadRequired = true;
    }

    /**
     * If `this.markRequired` has been called, shows a warning dialog and then reloads
     * the application.
     * @returns {Promise} fulfils to undefined
     */
    reloadIfRequired() {
      if (this.#reloadRequired) {
        const warning = i18n`The application needs to reload.`;
        return ModalDialog.showWarning(
          `<p>${warning}</p><p>${this.#reason}</p>`
        ).then(() => {
          window.location.reload();
        });
      } else {
        return Promise.resolve();
      }
    }
  }

  const reloader = new Reloader();

  /**
   * @file Cache settings data
   *
   * @module utils/userIo/settingsValueCache
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


  /**
   * @typedef {Object} CachedValue
   * @property {*} value
   * @property {string} label
   */
  class SettingsValueCache {
    /**
     * Stored values.
     * @type {Map(CachedValue)}
     */
    #storedValues = new Map();

    /**
     * Construct the SettingsValueCache. Only settings with reloadOnChanged set are saved.
     * @param {module:libs/utils/userIo/settings~SettingDefinitions} definitions
     */
    constructor(definitions) {
      for (const key in definitions) {
        if (definitions[key].reloadIfChanged) {
          const cachedValue = {
            value: persistentData.getFromStorage(key),
            label: definitions[key].label,
          };
          this.#storedValues.set(key, cachedValue);
        }
      }
    }

    /**
     * @returns {string} comma separated list of all changed labels.
     * The string is empty if nothing.
     */
    get changes() {
      let labels = [];
      this.#storedValues.forEach((cachedValue, key) => {
        const newValue = persistentData.getFromStorage(key);
        if (newValue !== cachedValue.value) {
          labels.push(cachedValue.label);
        }
      });
      return labels.join(', ');
    }
  }

  /**
   * @file Controls
   *
   * @module utils/userIo/controls
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


  /**
   * Class to encapsulate a range indicator. The control tracks the input
   * control.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class RangeIndicator extends ManagedElement {
    /**
     * Construct the indicator.
     * @param {module:utils/userIo/managedElement.ManagedElement} control - input control of type range.
     */
    constructor(control) {
      super('div', 'utils-range-value');
      this.classList.add('on-top');
      this.control = control;
      this.listenToEventOn('input', this.control, '');
      this.hide();
    }

    /**
     * Handle the change input event.
     * @param {Event} event
     */
    handleInputEvent(event) {
      if (!this.timerId) {
        this.timerId = setTimeout(() => {
          this.hide();
          this.timerId = null;
        }, 500);
      }
      const controlEl = this.control.element;
      const minValue = parseFloat(controlEl.min ?? 0);
      const maxValue = parseFloat(controlEl.max ?? 100);
      const currentValue = parseFloat(controlEl.value);
      const proportion = (currentValue - minValue) / (maxValue - minValue);
      this.textContent = event.target.value;
      this.style.opacity = 100;
      const top = controlEl.offsetTop - this.offsetHeight;
      let left =
        controlEl.offsetLeft +
        controlEl.offsetWidth * proportion -
        this.offsetWidth / 2;
      left = Math.max(controlEl.offsetLeft, left);
      left = Math.min(
        controlEl.offsetLeft + controlEl.offsetWidth - this.offsetWidth,
        left
      );
      this.style.left = `${left}px`;
      this.style.top = `${top}px`;
      this.show();
    }

    /**
     * Hide the indicator.
     */
    hide() {
      this.style.opacity = 0;
      this.style.visibility = 'hidden';
    }

    /**
     * Show the indicator.
     */
    show() {
      this.style.visibility = 'visible';
      this.style.opacity = 100;
    }
  }

  /**
   * Separator control class.
   * This is typically used in menus
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class SeparatorControl extends ManagedElement {
    constructor(key, definition) {
      super('div', 'utils-separator');
      this.innerHTML =
        '<span class="utils-hr"><hr></span>' +
        `<span> ${escapeHtml(definition.label)} </span>` +
        '<span class="utils-hr"><hr></span>';
    }
  }

  /**
   * Input control class.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class InputControl extends ManagedElement {
    /**
     * Construct an range control.
     * @param {string} key - the key for the item. This is used for saving the value
     * to and from local storage.
     * @param {SettingDefinition} definition
     */
    constructor(key, definition) {
      super('input');
      this.type = definition.type;
      this.setAttribute('type', definition.type);
      this.setAttribute('min', definition.min);
      this.setAttribute('max', definition.max);
      this.className = definition.type;
    }

    /**
     * Set the element's value.
     * @param {*} value
     */
    setValue(value) {
      switch (this.type) {
        case 'checkbox':
          this.checked = value;
          return;
        default:
          this.value = value;
          return;
      }
    }

    /**
     * Get the element's value.
     * @returns {*} value
     */
    getValue() {
      switch (this.type) {
        case 'checkbox':
          return this.checked;
        case 'range':
          return parseFloat(this.value);
        default:
          return this.value;
      }
    }
  }

  /**
   * Input control class.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class SelectControl extends ManagedElement {
    /**
     * Construct an range control.
     * @param {string} key - the key for the item. This is used for saving the value
     * to and from local storage.
     * @param {SettingDefinition} definition
     */
    constructor(key, definition) {
      super('select');
      this.definition = definition;
      if (definition.type) {
        this.className = definition.type;
      }
      this.#addOptions();
    }

    /**
     * Set the element's value.
     * @param {*} value
     */
    setValue(value) {
      console.log(value);
      const options = [...this.$.options];
      const index = options.findIndex((option) => option.value === value);
      if (index >= 0) {
        this.$.selectedIndex = index;
      } else {
        console.warn(`Could not set select control to value of ${value}`);
      }
    }

    /**
     * Get the element's value.
     * @returns {*} value
     */
    getValue() {
      return this.$.selectedOptions[0].value;
    }

    /**
     * Get the element's text.
     * @returns {string} text
     */
    getText() {
      return this.$.selectedOptions[0].text;
    }

    /**
     * Add options
     */
    #addOptions() {
      this.options = this.definition.options;
      if (typeof this.options === 'function') {
        this.options = this.options.call(this);
      }
      if (typeof this.options === 'function') {
        this.options = this.options.call(this);
      }

      this.options?.forEach((value, key) => {
        const option = new Option(value, key);
        this.$.add(option);
      });
    }

    /**
     * Reload the options. This only has an affect if the options are generated by
     * a function in the definition.
     */
    reloadOptions() {
      this.options = this.definition.options;
      if (typeof this.definition.options === 'function') {
        let n = this.$.length;
        while (n-- > 0) {
          this.$.remove(0);
        }
      }
      this.#addOptions();
    }
  }

  /**
   * @file Labeled control. This is a special control for use on dialogs.
   *
   * @module utils/userIo/labeledControl
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

  class LabeledControlManager {
    /** @type {ManagedElement[]} */
    #managedControls = [];

    /**
     * Create a manager.
     */
    constructor() {}

    /**
     * Create a form control from a definition
     * @param {string} key - the key for the item. This is used for saving the value
     * to and from local storage.
     * @param {module:utils/userio/settings~SettingDefinition} definition
     * @param {module:utils/userIo/storage.DataStoreManager} storage - used to retrieve and save data
     * @returns {LabeledControl}
     */
    createLabeledControl(key, definition, storage) {
      const options = {
        storage: storage,
        manager: this,
      };
      const control = new LabeledControl(key, definition, options);
      this.#managedControls.push(control);
      return control;
    }

    /**
     * Remove all the managed controls.
     */
    removeControls() {
      this.#managedControls.forEach((control) => {
        control.remove();
      });
    }

    /**
     * Reload the options on any select control.
     * If keys refer to controls which are not {@link module:utils/userIo/controls~SelectControl}
     * instances are ignored.
     * @param {string[]} keys - keys for controls that need to be reloaded
     */
    reloadSelectOptions(keys) {
      keys?.forEach((value) => {
        const dependentControl = this.#managedControls.find(
          (control) => control.key === value
        );
        if (dependentControl) {
          if (dependentControl.control instanceof SelectControl) {
            dependentControl.control.reloadOptions();
          } else {
            console.log(
              `Ignoring dependent ${value} as it is not a select type.`
            );
          }
        }
      });
    }
  }

  /**
   * Class to manage inputs. The class comprise a `div` element with a `label`
   * element containing the `label` text and the input control. Another `div` is
   * positioned after the `label` to hold any validation error messages.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class LabeledControl extends ManagedElement {
    /** @type {module:utils/userIo/storage.DataStoreManager} */
    #storage;
    /** @type {LabeledControlManager} */
    #manager;
    /**
     * Create a form control from a definition. Although this can be created
     * independently, it should be constructed via a `LabeledControlManager` if
     * dependents are to be managed.
     * @param {string} key - the key for the item. This is used for saving the value
     * to and from local storage.
     * @param {module:utils/userio/settings~SettingDefinition} definition
     * @param {Object} options - additional options
     * @param {module:utils/userIo/storage.DataStoreManager} options.storage - used to retrieve and save data.
     * If not set, storage is not automatically updated.
     * @param {LabeledControlManager} options.manager Parent manager. If null, dependencies cannot be handled.
     */
    constructor(key, definition, options) {
      super('div');
      this.#storage = options?.storage;
      this.#manager = options?.manager;
      this.className = 'labeled-control-container';
      this.label = new ManagedElement('label');
      this.appendChild(this.label);
      this.key = key;
      this.definition = definition;
      this.label.innerHTML = `<span>${escapeHtml(definition.label)}</span>`;
      if (definition.type === 'select') {
        this.control = new SelectControl(key, definition);
      } else {
        this.control = new InputControl(key, definition);
      }

      this.control.setValue(
        this.#storage
          ? this.#storage.getFromStorage(key, definition.defaultValue)
          : definition.defaultValue
      );
      this.label.appendChild(this.control);

      this.error = this.appendChild(
        new ManagedElement('div', 'utils-input-error-message')
      );

      if (definition.type === 'range') {
        this.label.appendChild(new RangeIndicator(this.control));
      }
      this.listenToEventOn('input', this.control, '');
    }

    /**
     * Sets the control's value.
     * @param {*} value
     */
    setValue(value) {
      this.control?.setValue(value);
    }

    /**
     * Handle the input event.
     * @param {Event} eventIgnored
     */
    handleInputEvent(eventIgnored) {
      const value = this.control.getValue();
      if (this.definition.validate) {
        const validation = this.definition.validate(value);
        if (!validation.pass) {
          this.error.textContent = validation.errorMessage;
          this.classList.add('utils-error');
          return;
        }
      }
      this.classList.remove('utils-error');

      this.#storage?.saveToStorage(this.key, value);

      if (this.definition.onupdate) {
        this.definition.onupdate(value);
        if (this.#manager) {
          this.#manager.reloadSelectOptions(this.definition.dependents);
        } else {
          console.warn(
            'LabeledControl has no manager, so unable to handle dependencies.'
          );
        }
      }
    }
  }

  /**
   * @file Settings routines for use with the modal dialog.
   *
   * @module utils/userio/settings
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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


  /**
   * Array of all the controls on the current SettingsDialog.
   * @type {LabeledControlManager}
   */
  let manager = null;

  /**
   * Current settings.
   * @type{SettingDefinitions}
   */
  let settingDefinitions = {};

  /**
   * @typedef {Object} ValidationResult
   * @property {boolean} pass -true on success.
   * @property {string} errorMessage - message if fails. Empty if passes.
   */

  /**
   * Definition of an object. This is either an array of strings each holding the
   * text to display, or a map of key/value entries where the value is the
   * text to display.
   * @typedef {string[] | Map<string, string>} OptionDetails
   */

  /**
   * Definition of a setting
   * @typedef {Object} SettingDefinition
   * @property {string | number} defaultValue - default value
   * @property {string[]} dependents - array of keys for dependent controls.
   * @property {string} label - text used to label the UI control
   * @property {number} max - maximum value
   * @property {number} min - minimum value
   * @property {function(*)} onupdate - function that is called when the setting
   * is changed. The argument holds the new value.
   * @property {function()} initialise - function that is called to initialise the setting.
   * @property {OptionDetails | function(): OptionDetails} options - options for a select control.
   * @property {function(*): ValidationResult} validate - validator function.
   * Returns {@link ValidationResult} where pass is true if okay.
   * @property {string} type - input type. E.g. 'range'.
   * @property {boolean} reloadIfChanged = application should be reloaded if this has changed.
   */

  /**
   * Collection of settings as key, value record.
   * @typedef {Object.<string, SettingDefinition>} SettingDefinitions
   */

  /**
   * Set the definitions used to configure the UI controls. When set, the onupdate
   * function for each setting will be called, using the currently stored value.
   * Note that any dependents are updated, so {@link definitions} should be valid
   * before calling.
   * @param {SettingDefinitions} definitions - key, definitions pairs
   */
  function setSettingDefinitions(definitions) {
    settingDefinitions = definitions;
    for (const key in settingDefinitions) {
      if (!isSeparator(settingDefinitions[key])) {
        const storedValue = persistentData.getFromStorage(
          key,
          settingDefinitions[key].defaultValue
        );
        settingDefinitions[key].onupdate?.call(this, storedValue);
      }
    }
  }

  /**
   * Resets all values to their factory defaults if confirmed by the user.
   * @returns {Promise} Fulfils to undefined.
   */
  function resetIfConfirmed() {
    return ModalDialog.showConfirm(
      i18n`Are you sure you want to reset all settings to their factory defaults?`
    ).then((value) => {
      if (value === ModalDialog.DialogIndex.CONFIRM_YES) {
        return resetAll();
      }
    });
  }

  /**
   * Test if definition is a separator.
   * @param {SettingDefinition} definition
   * @returns {boolean}
   */
  function isSeparator(definition) {
    return definition.type === 'separator';
  }

  /**
   * Reset everything in the settingDefinitions back to their defaults.
   */
  function resetAll() {
    for (const key in settingDefinitions) {
      console.info(`Resetting ${key} to its default.`);
      const definition = settingDefinitions[key];
      if (!isSeparator(definition)) {
        const value = definition.defaultValue;
        persistentData.saveToStorage(key, value);
        definition.onupdate?.(value);
      }
    }
  }

  /**
   * Initialise the setting definitions. This calls the initialise method of each
   * setting
   * @param {SettingDefinitions} definitions - key, definitions pairs
   */
  function initialiseSettingDefinitions(definitions) {
    for (const key in definitions) {
      definitions[key].initialise?.();
    }
  }

  /**
   * Set the definitions used to configure the UI controls. When set, the onupdate
   * function for each setting will be called, using the currently stored value.
   * Note that any dependents are updated, so `definitions` should be valid
   * before calling.
   * @param {SettingDefinitions} definitions - key, definitions pairs
   * @returns {Promise} Fulfills to undefined
   */
  function loadSettingDefinitions(definitions) {
    initialiseSettingDefinitions(definitions);
    setSettingDefinitions(definitions);
  }

  /**
   * Pop up a dialog allowing the current settings to be modified.
   * @returns {Promise} Fulfils to index of button pressed. This will be 0.
   * If -1 this indicates that a reload is required.
   */
  function showAllSettings() {
    if (manager) {
      return Promise.reject(
        new Error('Attempt made to show settings on top of another.')
      );
    }
    manager = new LabeledControlManager();
    const dialogContent = new ManagedElement('div');
    dialogContent.innerHTML = `
    <div class='utils-palette'>
    <span class='utils-primary'></span>
    <span class='utils-secondary'></span>
    <span class='utils-tertiary'></span>
    </div>
  `;

    for (const key in settingDefinitions) {
      const setting = settingDefinitions[key];
      let control;
      if (isSeparator(setting)) {
        control = new SeparatorControl(key, setting);
      } else {
        control = manager.createLabeledControl(key, setting, persistentData);
      }
      dialogContent.appendChild(control);
    }

    const settingsValueCache = new SettingsValueCache(settingDefinitions);

    return ModalDialog.showSettingsDialog(dialogContent)
      .then((value) => {
        if (value === ModalDialog.DialogIndex.SETTINGS_RESET) {
          return resetIfConfirmed();
        } else {
          return value;
        }
      })
      .then((value) => {
        manager.removeControls();
        manager = null;
        reloader.reloadIfRequired();
        return value;
      })
      .then((value) => {
        const changes = settingsValueCache.changes;
        if (changes !== '') {
          reloader.flagAsRequired(
            `${i18n`The following settings have changed:`} ${changes}.`
          );
          reloader.reloadIfRequired();
        }
        return value;
      });
  }

  /**
   * @file List of menu items
   *
   * @module data/menuItems
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


  /**
   * Get the main menu items.
   * @returns {module:utils/userIo/menu~MenuItemDefinition[]}
   */
  function getMainMenuItems() {
    return [
      {
        iconDetails: icons.settings,
        command: { execute: () => showAllSettings() },
      },
      { iconDetails: null, command: null },
      {
        iconDetails: icons.privacy,
        command: {
          execute: () => {
            window.open(Urls.PRIVACY, '_blank');
            return Promise.resolve();
          },
        },
      },
    ];
  }

  /**
   * @file Support the Workbox service worker
   *
   * @module utils/serviceWorkers/serviceWorkersUtilities
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  /**
   * Perform the actual registration.
   * @param {string} buildMode - production or development.
   */
  function performRegistrationIfPossible(buildMode) {
    if (buildMode === 'production' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((registration) => {
            console.info('SW registered: ', registration);
            let controller = navigator.serviceWorker.controller;
            console.info(`Page controlled by ${controller}.`);
          })
          .catch((registrationError) => {
            console.error('SW registration failed: ', registrationError);
          });
      });
    }
  }

  /**
   * Register the service worker if in production mode.
   * @param {string} buildMode - production or development.
   */
  function registerServiceWorker(buildMode) {
    try {
      performRegistrationIfPossible(buildMode);
    } catch (error) {
      console.error('Error during service worker registration', error);
    }
  }

  /**
   * @file Get the required JSON files for the translations.
   *
   * @module utils/i18n/i18FileResolver
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


  /**
   * @typedef {Object} FetchSummary - lists language files retrieved.
   * @property {string} url - url of file fetched.
   * @property {boolean} read - true on a successful retrieval.
   */

  /**
   * Extended error that provides the fetch summary.
   * @extends Error
   */
  class I18nResolutionError extends Error {
    /**
     * @param {*} error - initial error
     * @param {FetchSummary[]} fetchSummary - summary prior to error. Accessible via #fetchSummary property
     */
    constructor(error, fetchSummary) {
      if (error instanceof Error) {
        super(error.message);
        this.cause = error;
      } else {
        super(error);
      }

      /**
       * Summary of results prior to error.
       * @type {FetchSummary[]}
       * @public
       */
      this.fetchSummary = fetchSummary;
    }
  }

  /**
   * Set up the translations based on the user's settings and the available
   * translations.
   * @param {*} languagesListingUrl - url of the json file containing a listing
   * of the files.
   * @returns {Promise} Fulfills to FetchSummary[]. Rejects with I18ResolutionError.
   */
  function resolveLanguages(languagesListingUrl) {
    let languagesListing = {};
    let languagesBaseUrl = '';
    let fetchSummary = [];

    return fetchJson(languagesListingUrl)
      .then((languages) => {
        languagesListing = languages;
        languagesBaseUrl = new URL(languages.location, window.location.href);
        const url = new URL(languages.meta.master, languagesBaseUrl);
        fetchSummary.push({ url: url, read: false });
        return fetchJson(url.href);
      })
      .then((masterTranslations) => {
        fetchSummary[0].read = true;
        setActiveTranslations(masterTranslations);
        const bestFile = getBestLanguageFile(
          getPreferredLanguages(),
          languagesListing.files
        );
        if (bestFile === languagesListing.meta.master) {
          return Promise.resolve(null);
        }
        const url = new URL(bestFile, languagesBaseUrl);
        fetchSummary.push({ url: url, read: false });
        return fetchJson(url.href);
      })
      .then((bestTranslations) => {
        if (bestTranslations) {
          fetchSummary[1].read = true;
          setActiveTranslations(bestTranslations);
        }
        return fetchSummary;
      })
      .catch((error) => {
        return Promise.reject(new I18nResolutionError(error, fetchSummary));
      });
  }

  /**
   * @file Load the appropriate languages.
   *
   * @module utils/i18n/languageLoader
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

  /**
   * Get the language files required for the application.
   * If the application has not been build, the application just returns a fulfilled
   * Promise.
   * @param {string} embeddedLanguages - embedded language definition from previous call to
   * @returns {Promise} Fulfils to undefined.
   */
  function getLanguages(embeddedLanguages) {
    if (!BuildInfo.isBuilt()) {
      return Promise.resolve(undefined);
    }
    if (embeddedLanguages) {
      try {
        const languages = JSON.parse(base64ToString(embeddedLanguages));
        if (languages.fallback) {
          setActiveTranslations(languages.fallback);
        }
        setActiveTranslations(languages.active);
        return Promise.resolve(undefined);
      } catch (error) {
        console.error(
          'Unable to decode embedded languages ${embeddedLanguages}.',
          error
        );
      }
    }
    return getLanguagesFromJson();
  }

  /**
   * Get the language files required for the application from remote JSON files..
   * If the application has not been build, the application just returns a fulfilled
   * Promise.
   * @returns {Promise} Fulfils to undefined.
   */
  function getLanguagesFromJson() {
    return resolveLanguages('./languages.json')
      .then(() => {
        console.info(
          `Build information: ${
          BuildInfo.getBundleName
        } ${BuildInfo.getVersion()} ${BuildInfo.getMode()}`
        );
        return;
      })
      .catch((error) => {
        const fetchSummary = error.fetchSummary;
        if (fetchSummary && fetchSummary.length > 0 && fetchSummary[0].read) {
          console.error(`${error}\nUsing translation ${fetchSummary[0].url}`);
        } else {
          console.error(error.message);
          return Promise.reject(error);
        }
        return;
      });
  }

  /**
   * @file StageManager. Responsible for switching Presenters on the stage.
   *
   * @module lessons/presenters/stageManager
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


  /**
   * Class to manage movement between Presenters.
   */
  class StageManager {
    /**
     * Main stage element.
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #stage;

    /**
     * Prepare the stage
     * @param {Element} stageElement
     */
    constructor(stageElement) {
      this.#stage = new ManagedElement(stageElement);
    }

    /**
     * Start the stage show using the provided presenter. If the presenter fulfils
     * to another presenter, the show continues.
     * @param {module:lessons/presenters/presenter.Presenter} presenter - the presenter that starts the show.
     * @returns {undefined}  The method returns when a presenter is null.
     */
    async startShow(presenter) {
      this.#stage.removeChildren();
      for (;;) {
        presenter = await presenter.presentOnStage(this.#stage);
        this.#stage.removeChildren();
        if (presenter === null) {
          return;
        }
      }
    }
  }

  /**
   * @file General indexer for arrays
   *
   * @module utils/arrayIndexer
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

  class ArrayIndexer {
    /**
     * Array of the items to index
     * @type {Array<*>}
     */
    #items;

    /**
     * * Should increment wrap.
     * @type {boolean}
     */
    #wrap;

    /**
     * Current index
     * @type {number}
     */
    #index;

    /**
     * Construct the indexer
     * @param {Array<*>} items - array to managed index
     * @param {boolean} wrap - should index wrap or not.
     */
    constructor(items, wrap = true) {
      this.#items = items;
      this.#wrap = wrap;
      this.#index = 0;
    }

    /** Get the underlying array.
     * @returns {Array<*>}
     */
    get items() {
      return this.#items;
    }

    /**
     * Reset the index to 0
     */
    reset() {
      this.#index = 0;
    }
    /**
     * Decrements the index
     * @returns {*} the item at the new index
     */
    decrement() {
      if (this.#index > 0) {
        --this.#index;
      } else {
        this.#index = this.#wrap ? this.#items.length - 1 : this.#index - 1;
      }
      return this.#items[this.#index];
    }
    /**
     * Increments the index
     * @returns {*} the item at the next index
     */
    increment() {
      if (this.#index < this.#items.length - 1) {
        ++this.#index;
      } else {
        this.#index = this.#wrap ? 0 : this.#index;
      }
      return this.#items[this.#index];
    }
  }

  /**
   * @file Add help button
   *
   * @module utils/userIo/help
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


  /**
   * Icon only help button which launches external help.
   */
  class HelpButton extends ManagedElement {
    /**
     * Create the button.
     */
    constructor() {
      super('button', 'help-button');
      this.classList.add('icon-only-button');
      icons.applyIconToElement(icons.help, this, { hideText: true });
      this.listenToOwnEvent('click', 'HELP');
    }

    /**
     * @override
     */
    handleClickEvent(eventIgnored, eventIdIgnored) {
      const presenter = document.querySelector('.Presenter');
      console.debug(`Help triggered from ${presenter?.className}`); // this could be used for context sensitive help.
      window.open(Urls.HELP, '_blank');
    }

    /**
     * Create the help button and append to the container.
     * @param {Element | ManagedElement} container
     * @returns {ManagedElement}
     */
    static createInside(container) {
      const button = new HelpButton(container);
      button.appendTo(container);
      return button;
    }
  }

  /**
   * @file Menu io.
   * This module appends the menu HTML to the `body` element of the the document.
   * This is effectively a Singleton with the application containing one menu
   * which is always present.
   *
   * @module utils/userIo/menu
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


  /**
   * Definition of a menu item.
   * @typedef {Object} MenuItemDefinition
   * @property {module:utils/userIo/icons~IconDetails} iconDetails - the button definition for the menu item.
   * @property {module:libs/utils/command/commands#Command} command - command used to action
   * the menu selection.
   * If the command is not defined, the text property is ignored and a separator
   * is added.
   */

  /**
   * Create a managed element for the menu. The element itself is the open button.
   */
  class Menu extends ManagedElement {
    /**
     * @type {Element}
     */
    #menuContent;
    /**
     * @type {MenuItems}
     */
    #menuItems;

    /**
     * create the menu.
     */
    constructor() {
      super('button');
      this.setAttribute('aria-haspopup', true);
      icons.applyIconToElement(icons.openMenu, this, { hideText: true });
      this.classList.add('utils-menu-icon-open', 'icon-only-button');
      this.#createMenuContentHtml();
      this.#menuItems = new MenuItems();
    }

    /**
     * Create the HTML for the menu.
     * The menu added to the `body` element.
     * @param {Element | module:utils/userIo/managedElement.ManagedElement} container
     */
    #createMenuContentHtml() {
      const menuTitleBar = new ManagedElement('div');
      menuTitleBar.classList.add('utils-menu-title');

      this.#menuContent = new ManagedElement('div', 'utils-menu-content');
      this.#menuContent.style.visibility = 'hidden';

      document.body.insertBefore(
        this.#menuContent.element,
        document.getElementById('modal-mask').nextSibling
      );

      const menuItemsElement = new ManagedElement('div');
      menuItemsElement.classList.add('container', 'utils-menu-items');
      menuItemsElement.setAttribute('aria-role', 'menu');
      this.#menuContent.appendChild(menuTitleBar);
      this.#menuContent.appendChild(menuItemsElement);
      this.listenToOwnEvent('click', 'OPEN');
      this.listenToEventOn('click', this.#menuContent, 'CONTENT-ACTION');
      this.listenToEventOn('keydown', this.#menuContent, 'CONTENT-ACTION');
    }
    /**
     * Set the items for the menu.
     * @param {MenuItemDefinition[]} items
     */
    setMenuItems(items) {
      this.#menuItems.setMenuItems(items);
    }
    /**
     * Show the menu items.
     */
    #showMenuItems() {
      showMask();
      this.style.visibility = 'hidden';
      this.#menuContent.classList.add('modal');
      this.#menuContent.style.visibility = 'visible';
      this.#menuContent.style.transform = 'translateX(0)';
      this.#menuContent.querySelector('button.utils-menu-item').focus();
    }

    /**
     * Hide the menu items.
     */
    #hideMenuItems() {
      hideMask();
      this.style.visibility = 'visible';
      this.#menuContent.style.transform = 'translateX(-100%)';
      this.#menuContent.style.visibility = 'hidden';
      this.#menuContent.classList.remove('modal');
      focusManager.findBestFocus();
    }
    /**
     * @override
     */
    handleClickEvent(eventIgnored, eventId) {
      switch (eventId) {
        case 'OPEN':
          this.#showMenuItems();
          break;
        default:
          this.#hideMenuItems();
      }
    }

    /**
     * @override
     */
    handleKeydownEvent(event, eventIdIgnored) {
      if (event.key === 'Escape') {
        this.#hideMenuItems();
      }
    }
  }

  /**
   * Element to encapsulate a menu item.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class MenuItem extends ManagedElement {
    /**
     * @param {module:utils/userIo/icons~IconDetails} iconDetail - icon to apply to button.
     */
    constructor(iconDetails) {
      super('button', 'utils-menu-item');
      icons.applyIconToElement(iconDetails, this);
      this.setAttributes({
        'aria-role': 'menuitem',
      });
    }
  }

  /**
   * Class to encapsulate the list of MenuItem objects that make up the full
   * menu. The function {@link createMenuHtml} must have been called first to
   * ensure the required html structure is in place.
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class MenuItems extends ManagedElement {
    static CLOSE_EVENT_ID = 'close';

    /**
     * @type {module:utils/arrayIndexer.ArrayIndexer}
     */
    #navigator;
    /**
     * @type{Element}
     */
    #menuIconClose;
    /**
     * Construct the menu
     */
    constructor() {
      const parent = document.querySelector('.utils-menu-items');
      if (!parent) {
        throw 'Html structure not in place. createMenuHtml should have been called.';
      }
      super(parent);
      this.setAttributes({
        'aria-role': 'menu',
      });
      this.menuDefinition = null;
      this.#menuIconClose = new ManagedElement('button');
      icons.applyIconToElement(icons.closeMenu, this.#menuIconClose, {
        hideText: true,
      });
      this.#menuIconClose.classList.add(
        'utils-menu-icon-close',
        'icon-only-button'
      );

      const logo = new ManagedElement('img');
      logo.setAttribute('src', Urls.LOGO);

      const title = document.querySelector('.utils-menu-title');
      title.appendChild(logo.element);
      title.appendChild(this.#menuIconClose.element);
      this.listenToEventOn(
        'click',
        this.#menuIconClose,
        MenuItems.CLOSE_EVENT_ID
      );
    }

    /**
     * Build the menu from the menu definition.
     * @param {MenuItemDefinition[]} menuDefinition
     */
    setMenuItems(menuDefinition) {
      if (this.menuDefinition) {
        this.remove();
      }
      this.menuDefinition = menuDefinition;
      const commandItems = [this.#menuIconClose];
      this.menuDefinition.forEach((menuDef, index) => {
        let item;
        if (menuDef.command) {
          item = new MenuItem(menuDef.iconDetails);
          this.listenToEventOn('click', item, index);
          this.listenToEventOn('keydown', item, index);
          commandItems.push(item);
        } else {
          item = new ManagedElement('hr');
        }
        this.appendChild(item);
        this.#navigator = new ArrayIndexer(commandItems);
      });
    }

    /**
     * Handle click on menu option
     * @param {Event} event
     * @param {string} eventId
     */
    handleClickEvent(event, eventId) {
      const index = parseInt(eventId);
      if (isNaN(index)) {
        return;
      }
      console.debug(`Handling event ${event.type} with id ${eventId}`);
      this.menuDefinition[index].command.execute().then((value) => {
        console.debug(`Finished handling menu option ${value}.`);
      });
    }
  }

  /**
   * @file Set up the headers and footers
   *
   * @module setHeadersAndFooters
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

  /**
   * Class representing the header
   */
  class Header {
    /**
     * Construct
     */
    constructor() {}
    /**
     * Set up the header.
     * @param {module:utils/userIo/menu~MenuItemDefinition[]} menuItems
     */
    setup(menuItems) {
      const titleElement = document.getElementById('title-bar');
      if (!titleElement) {
        console.error('Cannot find element with id of "title-bar".');
        return;
      }

      if (titleElement.children?.length > 0) {
        console.error('Second attempt made to setup title bar ignored.');
        return;
      }
      const headerTextContainer = document.createElement('span');
      headerTextContainer.innerHTML = BuildInfo.getProductName();

      const helpButtonContainer = document.createElement('span');
      HelpButton.createInside(helpButtonContainer);

      const menu = new Menu();
      menu.setMenuItems(menuItems);
      titleElement.appendChild(menu.element);
      titleElement.appendChild(headerTextContainer);
      titleElement.appendChild(helpButtonContainer);
    }
  }

  /**
   * Class representing the footer.
   */
  class Footer {
    /**
     * @type{module:utils/userIo/managedElement.ManagedElement}
     */
    #buttonBar;

    /**
     * Create the footer.
     */
    constructor() {}

    /**
     * Get the button bar.
     */
    get buttonBar() {
      return this.#buttonBar;
    }
    /**
     * Set up the footer.
     */
    setup() {
      const footerElement = document.getElementById('footer');
      if (!footerElement) {
        console.error('Cannot find element with id of "footer".');
        return;
      }

      if (footerElement.children?.length > 0) {
        console.error('Second attempt made to setup footer ignored.');
        return;
      }
      this.#buttonBar = new ManagedElement('div', 'button-bar');
      footerElement.appendChild(this.#buttonBar.element);

      const footerTextContainer = document.createElement('div');
      footerTextContainer.className = 'footer-text';

      const devTag =
        BuildInfo.getMode().toUpperCase() !== 'PRODUCTION'
          ? `[${BuildInfo.getMode()}]`
          : '';

      footerTextContainer.innerHTML = `${BuildInfo.getProductName()} ${BuildInfo.getVersion()}${devTag} ${BuildInfo.getBuildDate()}`;

      footerElement.appendChild(footerTextContainer);
    }
  }

  const footer = new Footer();
  const header = new Header();

  /**
   * Set up the headers and footers. The header includes a help button.
   * @param {module:utils/userIo/menu~MenuItemDefinition[]} menuItems
   */
  function setHeaderAndFooter(menuItems) {
    header.setup(menuItems);
    footer.setup();
  }

  /**
   * @file Abstract presenter.
   * Presenters are states in a state machine. The state is entered by calling the
   * present method. The present method allows 3 possible exits: back, new presenter,
   * and escape. See {@link Presenter#present} for details.
   *
   * @module lessons/presenters/presenter
   *
   * @license GPL-3.0-or-later
   * : create quizzes and lessons from plain text files.
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


  /**
   * @typedef {Object} Navigator
   * @property {constructor} next - constructor for the next presenter
   * @property {constructor} previous - constructor for the  previous presenter
   */
  /**
   * @typedef {Object} PresenterFactory
   * @property {function(className): constructor} next - function to return constructor for next Presenter
   * @property {function(className): constructor} previous - function to return constructor for previous Presenter
   */

  /**
   * @typedef {Object} PresenterConfig
   * @property {string[]} titles - titles that are displayed for each item.
   * @property {string} itemClassName - class name for the items.
   * @property {module:lessons/lesson/Lesson} [lesson] - the lesson. It is optional for most presenters.
   * @property {lessons/lessonManager~LessonInfo} lessonInfo - information about the lesson.
   * @property {PresenterFactory} factory - the presenter factory used to create the next and previous presenters.
   */

  /**
   * Base presenter class. This is expected to be extended and the `next` and
   * `previous` methods overridden.
   * @class
   * @extends module:utils/userIo/managedElement.ManagedElement
   */
  class Presenter extends ManagedElement {
    static HOME_ID = 'HOME';
    static PREVIOUS_ID = 'BACKWARDS';
    static NEXT_ID = 'FORWARDS';

    /**
     * The resolve function for the Promise returned by the `presentOnStage` method.
     * @type {function}
     */
    #resolutionExecutor;

    /**
     * @type {PresenterConfig}
     */
    config;

    /*
     * Navigator for keyboard updown navigation.
     * @type {module:utils/arrayIndexer.ArrayIndexer} #navigator
     */
    #navigator;

    /**
     * Preamble
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #preamble;

    /**
     * Presentation
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #presentation;

    /**
     * Get the presentation
     * @returns {module:utils/userIo/managedElement.ManagedElement}
     */
    get presentation() {
      return this.#presentation;
    }

    /**
     * Button bar - bar at bottom
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #buttonBar;
    /**
     * Back button
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #homeButton;

    /**
     * Back button
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #backwardsButton;

    /**
     * Next button
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #forwardsButton;

    /**
     * Construct the presenter
     * @param {PresenterConfig} - configuration for the presenter.
     * @param {string} presentationTagName - type of presentation containing element. This defaults to a div
     */
    constructor(config, presentationTagName = 'div') {
      super('div');
      this.#addClassNames();
      this.config = config;
      footer.buttonBar.removeChildren();
      this.#buildContent(presentationTagName);
    }

    #addClassNames() {
      let item = this;
      do {
        this.classList.add(item.constructor.name);
        item = Object.getPrototypeOf(item);
      } while (item.constructor.name !== 'Object');
    }

    /**
     * Add preamble
     * @param {string} presentationTagName - type of the presentation container
     */
    #buildContent(presentationTagName) {
      this.#preamble = new ManagedElement('div', 'preamble');
      this.#presentation = new ManagedElement(
        presentationTagName,
        'presentation'
      );
      this.#buttonBar = footer.buttonBar; // new ManagedElement('div', 'button-bar');
      this.#addNavigationButtons();
      this.appendChild(this.#preamble);
      this.appendChild(this.#presentation);
      //this.appendChild(this.#buttonBar);
    }

    /**
     * Set up the presenter to expand.
     * The presentation is expanded.
     */
    expandPresentation() {
      this.#presentation.classList.add('expanded');
    }
    /**
     * Add button bar to the presenter's button bar.
     * The default button bar has the buttons in HOME, BACK, FORWARD order.
     * This adds the button between the BACK and FORWARD buttons.
     * @param {module:utils/userIo/managedElement.ManagedElement}
     */
    addButtonToBar(managedButton) {
      this.#buttonBar.element.insertBefore(
        managedButton.element,
        this.#buttonBar.element.lastElementChild
      );
    }

    /**
     * Preamble html or ManagedElement
     * @param {string | Element | module:utils/userIo/managedElement.ManagedElement}
     */
    addPreamble(data) {
      this.#preamble.removeChildren();
      if (typeof data === 'string') {
        this.#preamble.innerHTML = data;
      } else {
        this.#preamble.appendChild(data);
      }
    }

    /**
     * Add back and forward navigation buttons.
     * These are initially hidden.
     */
    #addNavigationButtons() {
      this.#homeButton = new ManagedElement('button', 'home-navigation');
      icons.applyIconToElement(icons.home, this.#homeButton);
      this.listenToEventOn('click', this.#homeButton, Presenter.HOME_ID);
      this.#buttonBar.appendChild(this.#homeButton);

      this.#backwardsButton = new ManagedElement('button', 'back-navigation');
      icons.applyIconToElement(icons.back, this.#backwardsButton);
      this.listenToEventOn('click', this.#backwardsButton, Presenter.PREVIOUS_ID);
      this.#buttonBar.appendChild(this.#backwardsButton);
      this.#backwardsButton.hide();

      this.#forwardsButton = new ManagedElement('button', 'forward-navigation');
      icons.applyIconToElement(icons.forward, this.#forwardsButton);
      this.listenToEventOn('click', this.#forwardsButton, Presenter.NEXT_ID);
      this.#buttonBar.appendChild(this.#forwardsButton);
      this.#forwardsButton.hide();
    }

    /**
     * Hide the home button.
     */
    hideHomeButton() {
      this.#homeButton.hide();
    }

    /**
     * Show the back button.
     * @param {boolean} focus - if true, the button will also get focus.
     */
    showBackButton() {
      this.#backwardsButton.show();
      if (focus) {
        this.#backwardsButton.focus();
      }
    }

    /**
     * Show the forwards button.
     * @param {boolean} focus - if true, the button will also get focus.
     */
    showNextButton(focus) {
      this.#forwardsButton.show();
      if (focus) {
        this.#forwardsButton.focus();
      }
    }

    /**
     * Restyle the forwards button
     * This allows the next button's logic to be used but with a different presentation
     * that might be more appropriate for presenter.
     * @param {module:utils/userIo/icons~IconDetails}
     * @param {?string} overrideText - text to override label if required.
     */
    applyIconToNextButton(iconDetails, overrideText) {
      icons.applyIconToElement(iconDetails, this.#forwardsButton, {
        overrideText: overrideText,
      });
    }

    /**
     * Add a keydown event for all the element's children.
     * The default handling is to trigger a click event on space or enter.
     * This is used primarily to make items such as LI elements behave more like buttons.
     * This can only be called once.
     * If element omitted, the children of the presentation element are used.
     * @param {module:utils/userIo/managedElement.ManagedElement[]} [managedElements].
     */
    autoAddKeydownEvents(managedElements) {
      if (this.#navigator) {
        console.error('autoAddKeydownEvents can only be called once.');
        return;
      }
      const items = managedElements ?? this.#presentation.managedChildren;
      this.#navigator = new ArrayIndexer(items, true);
      items.forEach((item, index) => {
        this.listenToEventOn('keydown', item, index);
      });
    }

    /**
     * Get configuration for the next presenter.
     * The default implementation just calls the presenter factory in the configuration
     * to get the next presenter. This should be overridden if you need to take action based on the index.
     *
     * @param {number | string} index - index of the item that triggered the call or the eventId if it can't be passed as a number.
     * @returns {Presenter | Promise} new Presenter or Promise that fulfils to a Presenter.
     */
    next(indexIgnored) {
      return this.config.factory.getNext(this, this.config);
    }

    /**
     * Move to the previous Presenter.
     * The default implementation just calls the presenter factory in the configuration
     * to get the previous presenter.
     * @returns {Presenter} new Presenter
     */
    previous() {
      return this.config.factory.getPrevious(this, this.config);
    }

    /**
     * Present on stage. The element is appended to the stageElement.
     * Note that it is not removed and any existing content is not removed..
     *
     * @param {module:utils/userIo/managedElement.ManagedElement} stageElement
     * @returns {Promise} - The Promise fulfils to the next `Presenter` that should be shown.
     */
    presentOnStage(stageElement) {
      return new Promise((resolve) => {
        this.#resolutionExecutor = resolve;
        stageElement.appendChild(this);
        focusManager.focusWithin(stageElement);
      });
    }

    /**
     * Check if okay to leave.
     * @param {string} message to ask
     * @returns {boolean} true if okay
     */
    async askIfOkayToLeave(message) {
      const confirmation = await ModalDialog.showConfirm(message);
      return confirmation === ModalDialog.DialogIndex.CONFIRM_YES;
    }

    /**
     * Prevent navigation away from page.
     * This is called when the handleClickEvent method is handling a Home, Back or
     * Forwards navigation button. It should be overriden if you need to prevent
     * navigation. Implementers can use the `askIfOkayToLeave` method to ask.
     * @param {Event} event
     * @param {string} eventId
     * @returns {boolean} true if navigation away from page should be allowed
     */
    async allowNavigation(eventIgnored, eventIdIgnored) {
      return true;
    }

    /**
     * Handle the click event.
     * The method will resolve the `Promise` made by `presentOnStage`.
     * The resolution is determined by the eventId.
     * + If the eventId is a positive integer, including zero, the Presenter resolves by
     * calling the next method in the config.
     * + If the eventId is 'PREVIOUS', case insensitive, the Presenter resolves by
     * calling the previous method in the config.
     * + Any other eventId, does not resolves with null.
     *
     * Override this method for handling other eventIds.
     * @param {Event} event
     * @param {string} eventId
     */
    async handleClickEvent(event, eventId) {
      const index = parseInt(eventId);
      const upperCaseId = !eventId ? '' : eventId.toString().toUpperCase();
      if (
        upperCaseId === Presenter.HOME_ID ||
        upperCaseId === Presenter.PREVIOUS_ID ||
        upperCaseId === Presenter.NEXT_ID
      ) {
        if (!(await this.allowNavigation(event, eventId))) {
          return true;
        }
      }
      let nextPresenter = null;
      if (upperCaseId === Presenter.PREVIOUS_ID) {
        nextPresenter = this.previous();
      } else if (upperCaseId === Presenter.NEXT_ID) {
        nextPresenter = this.next(Presenter.NEXT_ID);
      } else if (upperCaseId === Presenter.HOME_ID) {
        nextPresenter = this.config.factory.getHome(this.config);
      } else {
        nextPresenter = this.next(isNaN(index) ? eventId : index);
      }
      if (nextPresenter) {
        this.#resolutionExecutor(nextPresenter);
      }
    }

    /**
     * Handle key down event to allow up and down arrows to navigate list.
     * @param {Event} event
     * @param {string} eventId - holds index of the answer.
     */
    handleKeydownEvent(event, eventId) {
      const index = parseInt(eventId);
      console.debug(`Key ${event.key} down for index ${index}`);
      if (isNaN(index)) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Enter':
          this.handleClickEvent(event, eventId);
          break;
      }
    }
  }

  /**
   * @file Home message.
   *
   * @module data/home
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


  const getHomeText = () => i18n`Welcome to ${BuildInfo.getProductName()}`;

  /**
   * @file File input control
   *
   * @module utils/userIo/fileInput
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


  /**
   * File input button.
   * Users should listen for the 'dataAvailable' event.
   */
  class FileInputButton extends ManagedElement {
    static DATA_AVAILABLE_EVENT_NAME = 'dataAvailable';

    #input;
    /**
     * Create a file input button.
     * @param {module:utils/userIo/icons~IconConfig} options - options to override the default presentation.
     */
    constructor(options) {
      super('label', 'file-input-button');
      this.classList.add('selectable');
      this.#input = new ManagedElement('input');
      this.#input.setAttribute('type', 'file');
      icons.applyIconToElement(icons.import, this, options);
      this.#input.style.visibility = 'hidden';
      this.#input.style.height = '1em';
      this.appendChild(this.#input);
      this.listenToEventOn('change', this.#input);
    }

    /**
     * Handles changes to the file input control
     * If a file is selected, it is read and a custom event 'data-available' is
     * dispatched.
     * @param {Event} event
     * @param {string} eventIdIgnored
     */
    handleChangeEvent(eventIgnored, eventIdIgnored) {
      const file = this.#input.element.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      const control = this;
      reader.addEventListener('load', () => {
        reader.result;
        control.dispatchEvent(
          new CustomEvent(FileInputButton.DATA_AVAILABLE_EVENT_NAME, {
            detail: {
              file: file,
              content: reader.result,
            },
          })
        );
      });
      reader.readAsText(file);
    }
  }

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

  /**
   * Get the HTML for the autorun file.
   * @param {Object} data
   * @param {string} data.b64Title - lesson title in base64
   * @param {string} data.b64LessonData - lesson definition text in base64
   * @param {string} data.b64Translations - translations from i18 in base64
   */
  function getAutorunHtml(data) {
    let rootUrl = Urls.ROOT;
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
          <p>The application is loading. Please wait a few moments.</p>
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

  /**
   * @file Importers and Exporters for lesson data.
   *
   * @module lessons/lessonImportExport
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


  /**
   * @typedef {Object} LessonImportExportSummary
   * @property {string} title - the lesson's title
   * @property {string} content - the source text for the lesson
   */
  /**
   * Class to handle exporting of a lesson.
   */
  class LessonExporter {
    /**
     * @type {string}
     */
    #title;

    /**
     * @type {string}
     */
    #content;

    /**
     * Constuctor
     * @param {string} title - lesson title
     * @param {string} content - lesson source
     */
    constructor(title, content) {
      this.#title = title;
      this.#content = content;
    }

    /**
     * Get a uri for the data.
     * @param {string} data
     */
    #getDataUri(data) {
      return `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
    }

    /**
     * Get a string version of the lesson.
     * @returns {string}
     */
    get #lessonAsString() {
      return JSON.stringify({
        title: this.#title,
        content: this.#content,
      });
    }

    /**
     * Get a safe filename based on the title.
     * @param {string} extension - do not include the leading period.
     * @return {string}
     */
    #getFilename(extension) {
      const safename = this.#title
        .replace(/[^A-Za-z0-9_-]/g, '_')
        .substring(0, 32);
      return `${safename}.${extension}`;
    }

    /**
     * Export the lesson by creating a temporary anchor and clicking it.
     * @returns {Promise} fulfils to undefined
     */
    exportLesson() {
      return ModalDialog.showDialog(
        i18n`Select type of export`,
        i18n`Select the type of export required. AutoRun files provide an easy way for users to run a lesson.`,
        {
          dialogType: ModalDialog.DialogType.QUESTION,
          buttons: [icons.export, icons.exportAutoRun],
        }
      ).then((index) => {
        if (index === 0) {
          return this.exportBase64Lesson();
        } else {
          return this.exportAutorunLesson();
        }
      });
    }

    /**
     * Export the lesson by creating a temporary anchor and clicking it.
     */
    exportBase64Lesson() {
      this.saveDataToFile(stringToBase64(this.#lessonAsString), 'txt');
    }

    /**
     * Export an autorun lesson.
     */
    exportAutorunLesson() {
      const b64Title = stringToBase64(this.#title);
      const b64Data = stringToBase64(this.#content);
      const html = getAutorunHtml({
        b64Title: b64Title,
        b64LessonData: b64Data,
        b64Translations: getBase64Translations(),
      });
      this.saveDataToFile(html, 'html');
    }

    /**
     * Save the data to file.
     * @param {string} data
     * @param {string} extension - without the leading period.
     */
    saveDataToFile(data, extension) {
      const tempA = document.createElement('a');
      tempA.setAttribute('href', this.#getDataUri(data));
      tempA.setAttribute('download', this.#getFilename(extension));
      tempA.addEventListener('click', () => {
        document.body.removeChild(tempA);
      });
      document.body.appendChild(tempA);
      tempA.click();
    }
  }

  class LessonImporter {
    /**
     * Create the importer.
     */
    constructor() {}

    /**
     * Convert data previously saved by a call to exportPlainData or plain text.
     * @param {string} exportedData
     * @returns {LessonImportExportSummary} null if fails.
     */
    convert(exportedData) {
      let result = this.#getSummaryFromBase64File(exportedData);
      if (result) {
        return result;
      }

      result = this.#getSummaryFromAutorunFile(exportedData);
      if (result) {
        console.log(result.languages);
        return result;
      }
      return this.#getSummaryFromPlainTextFile(exportedData);
    }

    /**
     * Try to decode data using base64.
     * @param {string} data
     * @returns {LessonImportExportSummary} null if not decoded.
     */
    #getSummaryFromBase64File(data) {
      const match = data.match(/^[a-zA-Z0-9+/=]+$/);
      if (match) {
        try {
          return JSON.parse(base64ToString(data));
        } catch (error) {
          console.error(error);
        }
      }
      return null;
    }

    /**
     * Try to decode data assuming its an autorun file.
     * @param {string} data
     * @returns {LessonImportExportSummary} null if not decoded.
     */
    #getSummaryFromAutorunFile(data) {
      const match = data.match(
        /title:\s*['"]([a-zA-Z0-9+/=]+)['"]\s*,\s*source:\s*['"]([a-zA-Z0-9+/=]+)['"]/
      );
      if (match) {
        try {
          return {
            title: base64ToString(match[1]),
            content: base64ToString(match[2]),
          };
        } catch (error) {
          console.error(error);
        }
      }
      return null;
    }

    /**
     * Simple check to see if the data is plain text.
     * Looks for a question or introduction line.
     * @param {string} data
     * @returns {boolean} true if plain text file.
     */
    #getSummaryFromPlainTextFile(data) {
      if (data.match(/^[-#_* ]{0,3}(?:\(*([i?=xX&_])\1*[_) ]+)(.*)$/m)) {
        return {
          title: '',
          content: data,
        };
      } else {
        return null;
      }
    }
  }

  /**
   * @file Simple home page
   *
   * @module lessons/presenters/homePresenter
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


  /**
   * Class to present a slide show.
   * Presentation of a Problem provides the full problem and answer.
   * @class
   * @extends module:lessons/presenters/Presenter.Presenter
   */
  class HomePresenter extends Presenter {
    static REMOTE_LIBRARY_ID = 'REMOTE';
    static LOCAL_LIBRARY_ID = 'LOCAL';
    static FILE_LIBRARY_ID = 'FILE_SYSTEM';

    /**
     * @type { module:lessons/lessonImportExport~LessonImportExportSummary }
     */
    #importSummary;

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = [];
      config.itemClassName = 'library';
      super(config);
      this.#buildContent();
      this.hideHomeButton();
    }

    #buildContent() {
      let button = new ManagedElement('button');
      icons.applyIconToElement(icons.library, button, {
        overrideText: i18n`Open remote library`,
        hideText: false,
      });
      this.presentation.appendChild(button);
      this.listenToEventOn('click', button, HomePresenter.REMOTE_LIBRARY_ID);

      button = new ManagedElement('button');
      icons.applyIconToElement(icons.library, button, {
        overrideText: i18n`Open local library`,
        hideText: false,
      });
      this.presentation.appendChild(button);
      this.listenToEventOn('click', button, HomePresenter.LOCAL_LIBRARY_ID);

      button = new FileInputButton({
        overrideText: i18n`Open lesson from file system`,
        hideText: false,
      });
      this.presentation.appendChild(button);
      this.listenToEventOn(
        FileInputButton.DATA_AVAILABLE_EVENT_NAME,
        button,
        HomePresenter.FILE_LIBRARY_ID
      );

      this.addPreamble(parseMarkdown(getHomeText()));
    }

    /**
     * Handle file input.
     * @param {*} event
     * @param {*} eventId
     */
    handleDataAvailableEvent(event, eventIdIgnored) {
      const importer = new LessonImporter();
      this.#importSummary = importer.convert(event.detail.content);
      if (!this.#importSummary) {
        toast(
          `Unable to import the file ${event.detail?.file?.name}. The file may be corrupt or the wrong type of file.`
        );
        return;
      }
      this.handleClickEvent(event, HomePresenter.FILE_LIBRARY_ID);
    }

    /**
     * @override
     */
    next(index) {
      if (index === HomePresenter.FILE_LIBRARY_ID) {
        const unmanagedLesson = new UnmanagedLesson(
          this.#importSummary.title,
          this.#importSummary.content,
          LessonOrigin.FILE_SYSTEM
        );
        this.config.lesson = unmanagedLesson.lesson;
        this.config.lessonInfo = unmanagedLesson.lessonInfo;
        return this.config.factory.getSuitableProblemPresenter(this.config);
      } else {
        lessonManager.usingLocalLibrary =
          index === HomePresenter.LOCAL_LIBRARY_ID;
        return super.next(index);
      }
    }
  }

  /**
   * @file list presenter
   *
   * @module lessons/presenters/listPresenter
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


  /**
   * Class that creates a simple list presenter
   * @extends module:lessons/presenters/presenter.Presenter
   */

  class ListPresenter extends Presenter {
    /**
     * Construct simple list presenter
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      super(config, 'ul');
      this.#buildContent();
    }

    /**
     * Build the presenter content.
     * If the config includes the `previous` function, a back button is automatically
     * added at the end.
     * @private
     */
    #buildContent() {
      this.config?.titles?.forEach((title, index) => {
        const itemElement = new ManagedElement('li', this.config.itemClassName);
        itemElement.setAttribute('tabindex', '0');
        itemElement.classList.add('selectable');
        this.presentation.appendChild(itemElement);
        itemElement.innerHTML = title;
        this.listenToEventOn('click', itemElement, index);
      });

      if (this.config?.factory?.hasPrevious(this)) {
        this.showBackButton();
      }
    }
  }

  /**
   * @file Present a library on the stage.
   *
   * @module lessons/presenters/libraryPresenter
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

  /**
   * Class to present a library.
   * Presentation of a library involves displaying all of the books available in
   * the library.
   * @extends module:lessons/presenters/listPresenter.ListPresenter
   */
  class LibraryPresenter extends ListPresenter {
    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = lessonManager.bookTitles;
      config.itemClassName = 'book';
      super(config);
      this.#buildPreamble();
      this.autoAddKeydownEvents();
    }

    /**
     * Set up the preamble
     */
    #buildPreamble() {
      this.addPreamble(
        `<span class='library-title'>${lessonManager.libraryTitle}</span>`
      );
    }

    /**
     * @override
     */
    next(index) {
      lessonManager.bookIndex = index;
      return super.next(index);
    }
  }

  /**
   * @file Presenter for books
   *
   * @module lessons/presenters/bookPresenter
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


  /**
   * Class to present a library.
   * Presentation of a library involves displaying all of the books available in
   * the library.
   * @extends module:lessons/presenters/listPresenter.ListPresenter
   */
  class BookPresenter extends ListPresenter {
    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = lessonManager.chapterTitles;
      config.itemClassName = 'chapter';
      super(config);
      this.autoAddKeydownEvents();
      this.#buildPreamble();
    }
    /**
     * Set up the preamble
     */
    #buildPreamble() {
      this.addPreamble(
        `<span class='library-title'>${lessonManager.libraryTitle}</span>
    <span class='book-title'>${lessonManager.bookTitle}</span>
    `
      );
    }

    /**
     * @override
     */
    next(index) {
      lessonManager.chapterIndex = index;
      return super.next(index);
    }
  }

  /**
   * @file Chapter presenter
   *
   * @module lessons/presenters/chapterPresenter
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
  /**
   * Class to present a chapter.
   * Presentation of a chapter involves displaying all of the lessons available in
   * the chapter.
   * @extends module:lessons/presenters/listPresenter.ListPresenter
   */
  class ChapterPresenter extends ListPresenter {
    ADD_LESSON_EVENT_ID = 'add-lesson';
    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = lessonManager.lessonTitles;
      config.itemClassName = 'lesson';
      super(config);
      this.#buildPreamble();
      if (lessonManager.usingLocalLibrary) {
        this.#addNewSlotButton();
      }
      this.autoAddKeydownEvents();
    }

    /**
     * Set up the preamble
     */
    #buildPreamble() {
      if (lessonManager.usingLocalLibrary) {
        this.addPreamble(
          `<span class='library-title'>${lessonManager.libraryTitle}</span>`
        );
      } else {
        this.addPreamble(
          `<span class='library-title'>${lessonManager.libraryTitle}</span>
        <span class='book-title'>${lessonManager.bookTitle}</span>
        <span class='chapter-title'>${lessonManager.chapterTitle}</span>
        `
        );
      }
    }

    #addNewSlotButton() {
      const button = new ManagedElement('button');
      icons.applyIconToElement(icons.addLesson, button);
      this.listenToEventOn('click', button, this.ADD_LESSON_EVENT_ID);
      this.addButtonToBar(button);
    }
    /**
     *
     * @override
     */
    handleClickEvent(event, eventId) {
      if (eventId === this.ADD_LESSON_EVENT_ID) {
        return lessonManager.addLessonToLocalLibrary().then(() => {
          super.handleClickEvent(event, eventId);
        });
      }
      super.handleClickEvent(event, eventId);
    }
    /**
     * @override
     */
    next(index) {
      if (index === this.ADD_LESSON_EVENT_ID) {
        return new ChapterPresenter(this.config);
      } else {
        lessonManager.lessonIndex = index;
        return super.next(index);
      }
    }
  }

  /**
   * @file Lesson Presenter
   *
   * @module lessons/presenters/lessonPresenter
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


  /**
   * Class to present a Lesson.
   * Presentation of a Lesson involves displaying the lesson summary.
   * @extends module:lessons/presenters/presenter.Presenter
   */
  class LessonPresenter extends Presenter {
    /**
     * @type {string}
     */
    static EDIT_EVENT_ID = 'EDIT_LESSON';

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = ['placeholder']; // this will be replaced later.
      config.itemClassName = 'lesson-summary';
      super(config);
      this.config.lessonInfo = lessonManager.currentLessonInfo;
      this.#buildCustomContent();
      this.autoAddKeydownEvents();
      if (this.config?.factory?.hasPrevious(this)) {
        this.showBackButton();
      }
    }

    /**
     * Build custom content for the lesson.
     */
    #buildCustomContent() {
      this.presentation.createAndAppendChild('h2', null, i18n`Selected lesson:`);
      const summaryBlock = this.presentation.createAndAppendChild(
        'div',
        'lesson-summary'
      );
      summaryBlock.createAndAppendChild(
        'span',
        'lesson-title',
        this.config.lessonInfo.titles.lesson
      );
      summaryBlock.createAndAppendChild('p', null, i18n`taken from`);
      summaryBlock.createAndAppendChild(
        'span',
        'library-title',
        this.config.lessonInfo.titles.library
      );
      if (!lessonManager.usingLocalLibrary) {
        summaryBlock.createAndAppendChild(
          'span',
          'book-title',
          this.config.lessonInfo.titles.book
        );
        summaryBlock.createAndAppendChild(
          'span',
          'chapter-title',
          this.config.lessonInfo.titles.chapter
        );
      }

      this.presentation.appendChild(summaryBlock);
      this.applyIconToNextButton(icons.playLesson);
      this.showNextButton();
      this.#addEditButtonIfLocal();
    }

    /**
     * Add the edit button
     */
    #addEditButtonIfLocal() {
      if (this.config.lessonInfo.usingLocalLibrary) {
        const editButton = new ManagedElement('button');
        icons.applyIconToElement(icons.edit, editButton);
        this.addButtonToBar(editButton);
        this.listenToEventOn('click', editButton, LessonPresenter.EDIT_EVENT_ID);
      }
    }

    /**
     * @override
     */
    next(eventId) {
      if (eventId === LessonPresenter.EDIT_EVENT_ID) {
        return this.config.factory.getEditor(this, this.config);
      } else {
        return lessonManager.loadCurrentLesson().then((cachedLesson) => {
          const lessonSource = LessonSource.createFromSource(
            cachedLesson.content
          );
          this.config.lesson = lessonSource.convertToLesson();
          return this.config.factory.getNext(this, this.config);
        });
      }
    }
    /**
     * @override
     */
    previous() {
      return this.config.factory.getPrevious(this, this.config);
    }
  }

  /**
   * @file Lesson editor
   *
   * @module lessons/presenters/lessonEditorPresenter
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


  class LessonEditorPresenter extends Presenter {
    static SAVE_EVENT_ID = 'SAVE';
    static EXPORT_EVENT_ID = 'EXPORT';
    static IMPORT_EVENT_ID = 'IMPORT';
    static DELETE_EVENT_ID = 'DELETE';

    #lessonTitleElement;
    #lessonTitleValue;
    #mainEditorElement;
    #saveButton;
    #importForm;
    #importButton;
    #exportButton;
    #dirty;
    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = ['placeholder']; // this will be replaced later.
      config.itemClassName = 'lesson-editor';
      super(config);
      this.#buildCustomContent();
      this.#addSaveButton();
      this.#addImportButton();
      this.#addExportButton();
      this.#addDeleteButton();
      this.expandPresentation();
      this.#setEditorAsClean();
      this.applyIconToNextButton(icons.closeEditor);
      this.showNextButton();
      this.#dirty = false;
    }

    /**
     * Build the content.
     */
    async #buildCustomContent() {
      const cachedLesson = await lessonManager.loadCurrentLesson();
      this.#lessonTitleValue = this.config.lessonInfo.titles.lesson;
      this.#lessonTitleElement = new LabeledControl(
        LocalLibrary,
        {
          defaultValue: this.#lessonTitleValue,
          label: i18n`Title`,
          type: 'input',
          onupdate: (value) => {
            this.#lessonTitleValue = value;
            this.#setEditorAsDirty();
          },
        },
        { storage: null }
      );
      this.addPreamble(this.#lessonTitleElement);
      this.#mainEditorElement = this.presentation.createAndAppendChild(
        'textarea',
        'lesson-editor',
        cachedLesson.content
      );
      this.listenToEventOn('input', this.#mainEditorElement);
    }

    /**
     * Set the editor as dirty. The saveButton is shown and the Presenter set to
     * require confirmation to leave.
     */
    #setEditorAsDirty() {
      this.#saveButton.disabled = false;
      this.#dirty = true;
    }
    /**
     * Set the editor as dirty. The saveButton is hidden and the Presenter set not to
     * require confirmation to leave.
     */
    #setEditorAsClean() {
      this.#saveButton.disabled = true;
      this.#dirty = false;
    }

    /**
     * Add a save button */
    #addSaveButton() {
      this.#saveButton = new ManagedElement('button');
      icons.applyIconToElement(icons.save, this.#saveButton);
      this.listenToEventOn(
        'click',
        this.#saveButton,
        LessonEditorPresenter.SAVE_EVENT_ID
      );
      this.addButtonToBar(this.#saveButton);
    }

    /**
     * Add an import button
     */
    #addImportButton() {
      this.#importForm = new ManagedElement('form', 'button-wrapper');
      this.#importButton = new FileInputButton();
      this.#importForm.appendChild(this.#importButton);
      this.listenToEventOn(
        FileInputButton.DATA_AVAILABLE_EVENT_NAME,
        this.#importButton,
        LessonEditorPresenter.IMPORT_EVENT_ID
      );
      this.addButtonToBar(this.#importForm);
    }
    /**
     * Add an export button */
    #addExportButton() {
      this.#exportButton = new ManagedElement('button');
      icons.applyIconToElement(icons.export, this.#exportButton);
      this.listenToEventOn(
        'click',
        this.#exportButton,
        LessonEditorPresenter.EXPORT_EVENT_ID
      );
      this.addButtonToBar(this.#exportButton);
    }

    /**
     * Add a delete button
     */
    #addDeleteButton() {
      const deleteButton = new ManagedElement('button');
      icons.applyIconToElement(icons.delete, deleteButton);
      this.listenToEventOn(
        'click',
        deleteButton,
        LessonEditorPresenter.DELETE_EVENT_ID
      );
      this.addButtonToBar(deleteButton);
    }
    /**
     * Handle file input.
     * @param {*} event
     * @param {*} eventId
     */
    handleDataAvailableEvent(event, eventIdIgnored) {
      this.#importForm.element.reset(); // If we don't do this, we won't get new events for the same file.
      const importer = new LessonImporter();
      const importSummary = importer.convert(event.detail.content);
      if (!importSummary) {
        toast(
          `Unable to import the file ${event.detail?.file?.name}. The file may be corrupt or the wrong type of file.`
        );
        return;
      }
      return ModalDialog.showConfirm(
        i18n`Are you sure you want to overwrite your lesson?`
      ).then((answer) => {
        if (answer === ModalDialog.DialogIndex.CONFIRM_YES) {
          this.#lessonTitleElement.setValue(importSummary.title);
          this.#lessonTitleValue = importSummary.title;
          this.#mainEditorElement.value = importSummary.content;
          this.#setEditorAsDirty();
        }
        return;
      });
    }
    /**
     * Handle update of the editor.
     * @param {Event} eventIgnored
     * @param {string} eventIdIgnored
     */
    handleInputEvent(eventIgnored, eventIdIgnored) {
      this.#setEditorAsDirty();
    }

    /**
     * @override
     */
    async allowNavigation(eventIgnored, eventIdIgnored) {
      if (this.#dirty) {
        return this.askIfOkayToLeave(
          i18n`Are you sure you want to leave the editor? You will lose your changes.`
        );
      } else {
        return true;
      }
    }

    /**
     * @override
     */
    async handleClickEvent(event, eventId) {
      switch (eventId) {
        case LessonEditorPresenter.DELETE_EVENT_ID:
          {
            const deleted = await this.#deleteLessonIfConfirmed();
            if (!deleted) {
              return;
            }
          }
          break;
        case LessonEditorPresenter.SAVE_EVENT_ID:
          return this.#saveLessonLocally();
        case LessonEditorPresenter.EXPORT_EVENT_ID:
          return this.#exportLesson();
      }
      return super.handleClickEvent(event, eventId);
    }

    /**
     * @override
     * @param {string} eventId
     */
    next(eventId) {
      if (eventId === LessonEditorPresenter.DELETE_EVENT_ID) {
        return this.config.factory.getLibraryPresenter(this, this.config);
      } else {
        return super.next(eventId);
      }
    }

    /**
     * Delete the lesson if the user confirms the action.
     * @returns {Promise} fulfils to true if deleted.
     */
    #deleteLessonIfConfirmed() {
      return ModalDialog.showConfirm(
        i18n`Are you sure you want to delete this lesson?`,
        i18n`Confirm deletion`
      ).then((response) => {
        if (response === ModalDialog.DialogIndex.CONFIRM_YES) {
          return this.#deleteLesson();
        } else {
          return false;
        }
      });
    }

    /**
     * Delete the lesson without waiting for confirmation.
     * @returns {Promise} fulfils to true;
     */
    #deleteLesson() {
      return lessonManager.deleteLocalLibraryCurrentLesson().then(() => true);
    }

    /**
     * Save the lesson to local storage.
     */
    #saveLessonLocally() {
      lessonManager.updateCurrentLessonContent(
        this.#lessonTitleValue,
        this.#mainEditorElement.value
      );
      this.#setEditorAsClean();
    }
    /**
     * Export the lesson.
     */
    #exportLesson() {
      const exporter = new LessonExporter(
        this.#lessonTitleValue,
        this.#mainEditorElement.value
      );
      exporter.exportLesson();
    }
  }

  /**
   * @file celebrators
   *
   * @module lessons/candy/celebrators
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


  /**
   * Possible celebration names
   * @enum {string}
   */
  const CelebrationType = {
    HAPPY: 'smiley-face',
    SAD: 'sad-face',
  };

  /**
   * DOM element that can appear on screen to celebrate something
   */
  class Celebrator extends ManagedElement {
    /**
     * Class for the celebration type
     * @type {string}
     */
    #animationClass;

    /**
     * Flag set when an animation is in progress.
     */
    #busy;

    /** Create a celebrator. 
     * The celebrator has the class celebrator.
     * This should be set so that the celebrator has position absolute and display 
     * is hidden.
    
     * 
     * No content is included so that should be provided in CSS via a before or
     * after pseudo class.
     */
    constructor() {
      super('div', 'celebrator');
      this.appendTo(document.body);
      this.listenToOwnEvent('animationend');
      this.#busy = false;
      this.hide();
    }

    /**
     * Free up another celebrator when this animation is over.
     * @param {Event} event
     * @param {string} eventId
     */
    handleAnimationendEvent(eventIgnored, eventIdIgnored) {
      console.debug('Celebration ended.');
      this.hide();
      this.#busy = false;
    }

    /**
     * Bring in the celebrator.
     * No more celebrations are handled until this one ends.
     * @param {CelebrationType} [celebration = CelebrationType.SMILEY] - the class to apply
     */
    celebrate(celebration = CelebrationType.HAPPY) {
      if (this.#busy) {
        console.warn('Celebration busy so new celebration ignored.');
        return;
      }
      this.show();
      if (this.#animationClass) {
        this.classList.remove(this.#animationClass);
      }
      this.#animationClass = celebration;
      this.classList.add(this.#animationClass);
    }
  }

  const celebrator = new Celebrator();

  /**
   * @file Present a problem
   *
   * @module lessons/presenters/problemPresenter
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


  /**
   * Class names
   * @enum {string}
   */
  const ClassName = {
    ANSWER: 'problem-answer',
    ANSWERS: 'problem-answers',
    EXPLANATION: 'problem-explanation',
    INCORRECT_ANSWER: 'incorrect-answer',
    CORRECT_ANSWER: 'correct-answer',
    MISSED_ANSWER: 'missed-answer',
    AVOIDED_ANSWER: 'avoided-answer',
    QUESTION: 'problem-question',
    SELECTED_ANSWER: 'selected-answer',
  };

  /**
   * Ids
   * @enum {string}
   */
  const ElementId = {
    CLICKED_ANSWER: 'answer',
    CLICKED_SUBMIT: 'submit',
    CLICKED_NEXT: 'next',
  };

  /**
   * Attributes
   * @enum {string}
   */
  const Attribute = {
    RIGHT_OR_WRONG: 'data-code',
  };

  /**
   * States for selected answers
   * @enum {number}
   */
  const AnswerSelectionState = {
    /** Undefined state */
    UNDEFINED: 0,
    /** Correct answer selected */
    CORRECT: 1,
    /** Incorrect answer selected */
    INCORRECT: 2,
    /** Correct answer not selected */
    MISSED: 3,
    /** Incorrect answer not selected */
    AVOIDED: 4,
  };

  /**
   * Class to present a problem.
   * Presentation of a Problem provides the full problem and answer.
   * @class
   * @extends module:lessons/presenters/presenter.Presenter
   */
  class ProblemPresenter extends Presenter {
    /** @type {Problem} */
    #problem;

    /** @type {module:utils/userIo/managedElement.ManagedElement} */
    #questionElement;

    /** @type {module:utils/userIo/managedElement.ManagedElement} */
    #answerElement;

    /** @type {module:utils/userIo/managedElement.ManagedElement} */
    #explanationElement;

    /** @type {module:utils/userIo/controls.ManagedElement} */
    #submitButton;

    /** @type {boolean} */
    #freezeAnswers;

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      config.titles = [];
      config.itemClassName = '';
      super(config, 'div');
      this.#problem = config.lesson.getNextProblem();
      this.#questionElement = new ManagedElement('div', ClassName.QUESTION);
      this.#questionElement.innerHTML = this.#problem.question.html;

      this.#answerElement = new ManagedElement('div', ClassName.ANSWERS);

      this.#explanationElement = new ManagedElement('div', ClassName.EXPLANATION);
      this.#explanationElement.innerHTML = this.#problem.explanation.html;
      this.#explanationElement.hide();

      this.presentation.appendChild(this.#questionElement);
      this.presentation.appendChild(this.#answerElement);
      this.presentation.appendChild(this.#explanationElement);
      this.addButtons();

      this.#submitButton.show();
      this.#freezeAnswers = false;
      if (!this.config.lessonInfo.managed) {
        this.hideHomeButton();
      }
    }

    /**
     * @returns {module:lessons/problem.Problem} the underlying problem
     */
    get problem() {
      return this.#problem;
    }

    /**
     * @returns {module:utils/userIo/managedElement.ManagedElement}
     */
    get questionElement() {
      return this.#questionElement;
    }

    /**
     * @returns {module:utils/userIo/managedElement.ManagedElement}
     */
    get answerElement() {
      return this.#answerElement;
    }

    /**
     * @returns {module:utils/userIo/managedElement.ManagedElement}
     */
    get explanationElement() {
      return this.#explanationElement;
    }

    /**
     * @returns {module:utils/userIo/managedElement.ManagedElement}
     */
    get submitButton() {
      return this.#submitButton;
    }

    /**
     * Add button bar to the presenter.
     */
    addButtons() {
      this.#addSubmitButton();
    }

    /**
     * Append a submit button. In this context, submit means sending the selected
     * answers for marking.
     * @private
     */
    #addSubmitButton() {
      this.#submitButton = new ManagedElement('button', ClassName.ANSWER_SUBMIT);
      icons.applyIconToElement(icons.submitAnswer, this.#submitButton.element);
      this.listenToEventOn('click', this.#submitButton, ElementId.CLICKED_SUBMIT); // numeric handler means this will resolve the presenter.
      this.addButtonToBar(this.#submitButton);
    }

    /**
     * @override
     */
    presentOnStage(stage) {
      if (
        this.#problem.intro.html !== '' &&
        this.#problem.questionType !== QuestionType.SLIDE
      ) {
        return ModalDialog.showInfo(this.#problem.intro.html).then(() =>
          super.presentOnStage(stage)
        );
      } else {
        return super.presentOnStage(stage);
      }
    }

    /**
     * Handle the answers. Any other event is passed on to the base Presenter's
     * handler.
     * @param {Event} event
     * @param {string} eventId
     * @override
     */
    handleClickEvent(event, eventId) {
      switch (eventId) {
        case ElementId.CLICKED_ANSWER:
          if (!this.#freezeAnswers) {
            this.processClickedAnswer(event.currentTarget);
          }
          break;
        case ElementId.CLICKED_SUBMIT:
          this.#freezeAnswers = true;
          this.#processClickedSubmit();
          break;
        default:
          super.handleClickEvent(event, eventId);
      }
    }

    /**
     * @override
     */
    async allowNavigation(event, eventId) {
      if (eventId === Presenter.HOME_ID || eventId === Presenter.PREVIOUS_ID) {
        return this.askIfOkayToLeave(
          i18n`Are you sure you want to quit the lesson?`
        );
      } else {
        return true;
      }
    }

    /**
     * Process a clicked answer. This should be overridden.
     * @param {Element} target
     */
    processClickedAnswer(target) {
      console.debug(`Process ${target.tagName}:${target.className}`);
    }

    /**
     * Process a clicked answer.
     * @param {Element} target
     */
    #processClickedSubmit() {
      const correct = this.areAnswersCorrect();
      this.config.lesson.markProblem(
        this.#problem,
        correct ? MarkState.CORRECT : MarkState.INCORRECT
      );
      this.#submitButton.hide();
      this.showNextButton(true);
      celebrator.celebrate(correct ? CelebrationType.HAPPY : CelebrationType.SAD);
    }

    /**
     * Mark the answers. This should be overridden.
     * @returns {boolean} true if all correct.
     */
    areAnswersCorrect() {
      console.debug(`Override markAnswers should be overridden.`);
      return false;
    }
  }

  /**
   * @file Array shuffling
   *
   * @module utils/arrayManip
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

  /**
   * Shuffle the Array
   * @param {Array<*>} data - the array to shuffle
   */
  function shuffle(data) {
    var count = data.length;
    // While there remain elements to shuffle…
    while (count) {
      const index = Math.floor(Math.random() * count--);
      [data[count], data[index]] = [data[index], data[count]];
    }
    return data;
  }

  /**
   * @file Present a problem
   *
   * @module lessons/presenters/choiceProblemPresenter
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


  /**
   * Class to present a problem.
   * Presentation of a Problem provides the full problem and answer.
   * @class
   * @extends module:lessons/presenters/presenter.Presenter
   */
  class ChoiceProblemPresenter extends ProblemPresenter {
    /**
     * @type {module:utils/userIo/ManagedElement.ManagedElement}
     */
    #answerListElement;

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      super(config);
      this.#buildSimpleOrMultiple();
    }

    /** Build a simple or multiple choice question.
     * Both question types are similar in design. The only difference is that
     * the answers that are added are treated like radio buttons or checkboxes.
     * That is handed by the `#addAnswers` method.
     * @private
     */
    #buildSimpleOrMultiple() {
      this.#buildAnswers();
      this.autoAddKeydownEvents(this.answerElement.managedChildren);
    }

    /**
     * Append the answers.
     * @private
     */
    #buildAnswers() {
      this.#answerListElement = new ManagedElement('ul');
      this.answerElement.appendChild(this.#answerListElement);
      this.#answerListElement.setAttributes({
        'aria-label': i18n`Possible answers`,
        'aria-role':
          this.problem.questionType === QuestionType.MULTI ? '' : 'radiogroup',
      });
      const answers = [];
      this.#pushAnswerElementsToArray(this.problem.rightAnswers, answers, true);
      this.#pushAnswerElementsToArray(this.problem.wrongAnswers, answers, false);

      shuffle(answers);

      answers.forEach((element) => {
        this.#answerListElement.appendChild(element);
        this.listenToEventOn('click', element, ElementId.CLICKED_ANSWER);
        this.listenToEventOn('keydown', element, ElementId.CLICKED_ANSWER);
      });

      setTimeout(() => this.#answerListElement.children[0].focus());
    }

    /**
     * Create Elements for the answers and adds to the array.
     * The `Attributes.RIGHT_OR_WRONG` attribute is set to true or false to flag the answer status.
     * @param {TextItem[]} answers - answers to create elements for
     * @param {Element[]} destination - target array for push
     * @param {boolean} areRight - true if these are correct answers.
     * @private
     */
    #pushAnswerElementsToArray(answers, destination, areRight) {
      const role =
        this.problem.questionType === QuestionType.MULTI ? 'checkbox' : 'radio';
      answers.forEach((value) => {
        const element = new ManagedElement('li', ClassName.ANSWER);
        element.classList.add('selectable');
        element.innerHTML = value.html;
        element.setSafeAttribute(Attribute.RIGHT_OR_WRONG, areRight);
        element.setAttributes({
          tabindex: '0',
          'aria-role': role,
          'aria-checked': false,
          'aria-label': i18n`Possible answer to question`,
        });
        destination.push(element);
      });
    }

    /**
     * Handle a clicked answer
     * @param {Element} element
     * @override
     */
    processClickedAnswer(element) {
      switch (this.problem.questionType) {
        case QuestionType.MULTI:
          element.classList.toggle(ClassName.SELECTED_ANSWER);
          break;
        case QuestionType.SIMPLE:
          {
            const selected = element.classList.contains(
              ClassName.SELECTED_ANSWER
            );
            this.#deselectAllAnswers();
            if (!selected) {
              this.#selectAnswer(element);
            }
          }
          break;
        default:
          console.error(
            `Wrong presenter ${this.constructor.name} being used for ${this.problem.questionType}`
          );
          break;
      }
    }

    /**
     * Deselect an answer element
     * @param {Element} element
     * @private
     */
    #selectAnswer(element) {
      element.setAttribute('aria-checked', 'true');
      element.classList.add(ClassName.SELECTED_ANSWER);
    }

    /**
     * Deselect an answer element
     * @param {Element} element
     * @private
     */
    #deselectAnswer(element) {
      element.setAttribute('aria-checked', 'false');
      element.classList.remove(ClassName.SELECTED_ANSWER);
    }

    /**
     * Deselect all of the answers.
     * @private
     */
    #deselectAllAnswers() {
      const allAnswers = document.querySelectorAll(`.${ClassName.ANSWER}`);
      allAnswers.forEach((element) => {
        this.#deselectAnswer(element);
      });
    }

    /**
     * Mark a simple question.
     * @returns {boolean} true if answer correct.
     * @override
     */
    areAnswersCorrect() {
      let correct = true; // default
      const allAnswers = document.querySelectorAll(`.${ClassName.ANSWER}`);

      allAnswers.forEach((element) => {
        if (!this.#processAnswerState(element)) {
          correct = false;
        }
        element.classList.replace('selectable', 'selectable-off');
        element.setAttribute('tabindex', '-1');
      });

      return correct;
    }

    /**
     * Process the selection state of the answer element
     * @param {*} element
     * @returns {boolean} true if the selection or lack of selection is correct.
     */
    #processAnswerState(element) {
      this.freezeAnswers = true;
      const elementIsCorrect =
        ManagedElement.getSafeAttribute(
          element,
          Attribute.RIGHT_OR_WRONG
        ).toLowerCase() === 'true';
      const selected = element.classList.contains(ClassName.SELECTED_ANSWER);
      let answerState;
      if (elementIsCorrect) {
        answerState = selected
          ? AnswerSelectionState.CORRECT
          : AnswerSelectionState.MISSED;
      } else {
        answerState = selected
          ? AnswerSelectionState.INCORRECT
          : AnswerSelectionState.AVOIDED;
      }
      this.#showAnswerState(element, answerState);

      return (
        answerState === AnswerSelectionState.CORRECT ||
        answerState === AnswerSelectionState.AVOIDED
      );
    }

    /**
     * Adjust the element's class to present its state.
     * @param {Element} element - the element to adjust
     * @param {AnswerSelectionState} answerState - selection state of the element
     */
    #showAnswerState(element, answerState) {
      let className = '';
      switch (answerState) {
        case AnswerSelectionState.AVOIDED:
          className = ClassName.AVOIDED_ANSWER;
          break;
        case AnswerSelectionState.CORRECT:
          className = ClassName.CORRECT_ANSWER;
          break;
        case AnswerSelectionState.INCORRECT:
          className = ClassName.INCORRECT_ANSWER;
          break;
        case AnswerSelectionState.MISSED:
          className = ClassName.MISSED_ANSWER;
          break;
      }
      element.classList.add(className);
    }

    /**
     * Handle key down event to allow up and down arrows to navigate list.
     * @param {Event} event
     * @param {string} eventId - holds index of the answer.
     */
    handleKeydownEvent(event, eventId) {
      if (eventId === ElementId.CLICKED_ANSWER) {
        switch (event.key) {
          case ' ':
          case 'Enter':
            event.stopPropagation();
            this.handleClickEvent(event, eventId);
            break;
        }
      } else {
        return super.handleKeydownEvent(event, eventId);
      }
    }
  }

  /**
   * @file Present a problem
   *
   * @module lessons/presenters/fillProblemPresenter
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


  /**
   * Class to present a problem.
   * Presentation of a Problem provides the full problem and answer.
   * @class
   * @extends module:lessons/presenters/presenter.Presenter
   */
  class FillProblemPresenter extends ProblemPresenter {
    /** @type {control:module:utils/userIo/controls.SelectControl} */
    #missingWordSelectors;
    /** @type {string} */
    #missingWordCorrectAnswers;

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      super(config);
      this.#createMissingWordSelectors();
      this.answerElement.hide();
    }

    /**
     * Create a set of missing word selectors and inject them into the question.
     */
    #createMissingWordSelectors() {
      const questionWordElements =
        this.questionElement.querySelectorAll('.missing-word');

      this.#missingWordCorrectAnswers = [];

      questionWordElements.forEach((element) => {
        const correctAnswer = ManagedElement.getSafeAttribute(
          element,
          'data-missing-word'
        );
        this.#missingWordCorrectAnswers.push(correctAnswer);
      });

      const redHerrings = this.problem.firstWordsOfWrongAnswers;
      const options = ['...', ...this.#missingWordCorrectAnswers, ...redHerrings];
      options.sort();
      const settingDefinition = {
        defaultValue: '...',
        options: options,
      };
      this.#missingWordSelectors = [];
      questionWordElements.forEach((element, index) => {
        const selector = new SelectControl(index, settingDefinition);
        element.appendChild(selector.element);
        this.#missingWordSelectors.push(selector);
      });
      this.autoAddKeydownEvents(this.#missingWordSelectors);
    }

    /**
     * Mark a fill question.
     * @returns {boolean} true if answer correct.
     * @override
     */
    areAnswersCorrect() {
      let correct = true;
      this.#missingWordSelectors.forEach((selectControl, index) => {
        const givenAnswer = selectControl.getText();
        const container = selectControl.parentElement;
        selectControl.remove();
        container.textContent = givenAnswer;
        if (givenAnswer === this.#missingWordCorrectAnswers[index]) {
          this.#showAnswerState(container, AnswerSelectionState.CORRECT);
        } else {
          this.#showAnswerState(container, AnswerSelectionState.INCORRECT);
          correct = false;
        }
      });
      return correct;
    }

    /**
     * Adjust the element's class to present its state.
     * @param {Element} element - the element to adjust
     * @param {AnswerSelectionState} answerState - selection state of the element
     */
    #showAnswerState(element, answerState) {
      let className = '';
      switch (answerState) {
        case AnswerSelectionState.AVOIDED:
          className = ClassName.AVOIDED_ANSWER;
          break;
        case AnswerSelectionState.CORRECT:
          className = ClassName.CORRECT_ANSWER;
          break;
        case AnswerSelectionState.INCORRECT:
          className = ClassName.INCORRECT_ANSWER;
          break;
        case AnswerSelectionState.MISSED:
          className = ClassName.MISSED_ANSWER;
          break;
      }
      element.classList.add(className);
    }
  }

  /**
   * @file Present a problem
   *
   * @module lessons/presenters/orderProblemPresenter
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


  /**
   * Class to present an order problem.
   * Presentation of a Problem provides the full problem and answer.
   * @class
   * @extends module:lessons/presenters/presenter.Presenter
   */
  class OrderProblemPresenter extends ProblemPresenter {
    /** @type {control:module:utils/userIo/controls.SelectControl} */
    #missingWordSelectors;
    /** @type {string} */
    #missingWordCorrectAnswers;

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      super(config);
      this.#buildOrder();
    }
    /**
     * Build and order type question
     */
    #buildOrder() {
      this.#missingWordCorrectAnswers = this.problem.firstWordsOfRightAnswers;
      const redHerrings = this.problem.firstWordsOfWrongAnswers;

      const options = ['...', ...this.#missingWordCorrectAnswers, ...redHerrings];
      options.sort();
      const settingDefinition = {
        defaultValue: '...',
        options: options,
      };
      const orderedAnswers = new ManagedElement('div', 'problem-ordered-answers');
      this.#missingWordSelectors = [];
      for (let index = 0; index < this.problem.rightAnswers.length; index++) {
        const span = new ManagedElement('span', 'missing-word');
        const selectControl = new SelectControl(index, settingDefinition);
        this.#missingWordSelectors.push(selectControl);
        span.appendChild(selectControl);
        orderedAnswers.appendChild(span);
      }
      this.answerElement.appendChild(orderedAnswers);
      this.autoAddKeydownEvents(this.#missingWordSelectors);
    }

    /**
     * Mark a fill question.
     * @returns {boolean} true if answer correct.
     * @override
     */
    areAnswersCorrect() {
      let correct = true;
      this.#missingWordSelectors.forEach((selectControl, index) => {
        const givenAnswer = selectControl.getText();
        const container = selectControl.parentElement;
        selectControl.remove();
        container.textContent = givenAnswer;
        if (givenAnswer === this.#missingWordCorrectAnswers[index]) {
          this.#showAnswerState(container, AnswerSelectionState.CORRECT);
        } else {
          this.#showAnswerState(container, AnswerSelectionState.INCORRECT);
          correct = false;
        }
      });
      return correct;
    }

    /**
     * Adjust the element's class to present its state.
     * @param {Element} element - the element to adjust
     * @param {AnswerSelectionState} answerState - selection state of the element
     */
    #showAnswerState(element, answerState) {
      let className = '';
      switch (answerState) {
        case AnswerSelectionState.AVOIDED:
          className = ClassName.AVOIDED_ANSWER;
          break;
        case AnswerSelectionState.CORRECT:
          className = ClassName.CORRECT_ANSWER;
          break;
        case AnswerSelectionState.INCORRECT:
          className = ClassName.INCORRECT_ANSWER;
          break;
        case AnswerSelectionState.MISSED:
          className = ClassName.MISSED_ANSWER;
          break;
      }
      element.classList.add(className);
    }
  }

  /**
   * @file Calculate time needed to read text.
   *
   * @module utils/userIo/readSpeedCalculator
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


  const AVERAGE_WORDS_PER_MINUTE = 130;

  /**
   * Calculator for reading speeds.
   */
  class ReadSpeedCalculator {
    static MIN_WPM = 80;
    static MAX_WPM = 1000;
    /**
     * @type {number}
     */
    #secondsPerWord;

    /**
     * Construct the calculator
     * @param {number} [wordsPerMinute = AVERAGE_WORDS_PER_MINUTE]
     */
    constructor(wordsPerMinute = AVERAGE_WORDS_PER_MINUTE) {
      this.setWordsPerMinute(wordsPerMinute);
    }

    /**
     * Set the words per minute. This is clipped at ReadSpeedCalulator.MIN_WPM and ReadSpeedCalulator.MAX_WPM;
     * @param {number} wordsPerMinute
     */
    setWordsPerMinute(wordsPerMinute) {
      let wpm = parseInt(wordsPerMinute);
      if (isNaN(wpm)) {
        console.error(
          `Attempt made to set words per minute to non-numeric value of ${wordsPerMinute}`
        );
        return;
      }
      wpm = Math.max(wordsPerMinute, ReadSpeedCalculator.MIN_WPM);
      wpm = Math.min(wpm, ReadSpeedCalculator.MAX_WPM);
      this.#secondsPerWord = 60.0 / wpm;
    }

    /**
     * Calculate the read time for the data.
     * @param {string} data - this can be plain text or html
     */
    getSecondsToRead(data) {
      const plainText = getPlainTextFromHtml(data);
      const words = plainText.trim().split(/\s+/);
      return words.length * this.#secondsPerWord;
    }
  }

  /**
   * @file Display cards
   *
   * @module lessons/presenters/displayCards
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

  /**
   * @typedef {Object} CardDetail
   * @property {string} html - the html content.
   * @property {number} readTimeSecs - how long it will normally take to read a card in seconds.
   */

  class DisplayCards {
    /**
     * Html broken down into blocks.
     * @type {string[]}
     */
    #blocks;

    /**
     * @type {number}
     */
    #index;

    /**
     * @type {ReadSpeedCalculator}
     */
    #readSpeedCalculator;
    /**
     * Create the set of cards.
     * @param {*} html
     */
    constructor(html) {
      this.#blocks = this.#splitHtml(html);
      this.#index = 0;
      this.#readSpeedCalculator = new ReadSpeedCalculator();
    }

    /**
     * Breaks down the html into blocks. This is done by splitting at paragraphs
     * and divs.
     * @param {string} html
     */
    #splitHtml(html) {
      const blocks = html.split(/(<\/(?:p|div)>)/i);
      const result = [];
      const iterations = Math.ceil(blocks.length / 2);
      for (let index = 0; index < iterations; index++) {
        const tail = blocks[index * 2 + 1] ?? '';
        result.push(`${blocks[index * 2]}${tail}`.trim());
      }
      return result.filter((e) => e);
    }

    /**
     * Gets the next block. The index is increment after providing the block.
     * @returns {CardDetail} the next block or null
     */
    getNext() {
      if (this.#index < this.#blocks.length) {
        const html = this.#blocks[this.#index++];
        return {
          html: html,
          readTimeSecs: this.#readSpeedCalculator.getSecondsToRead(html),
        };
      }
      return null;
    }

    /**
     * Test to see if there are any more blocks to get.
     * @returns {boolean} true if there are more.
     */
    get hasMore() {
      return this.#index < this.#blocks.length;
    }

    /**
     * Resets the index to 0.
     */
    reset() {
      this.#index = 0;
    }

    /**
     * Set the words per minute of the underlying calculator.
     * @param {number} wpm
     */
    setWordsPerMinute(wpm) {
      this.#readSpeedCalculator.setWordsPerMinute(wpm);
    }
  }

  /**
   * @file Gesture
   *
   * @module utils/userIo/gestures
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

  /** Flag showing whether the passive option is supported by listeners. */
  var supportsPassive = false;

  /**
   * Test to see if passive option supported.
   * @see {@link https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md}
   */
  try {
    var opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
        return undefined;
      },
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (errorIgnored) {
    console.log('Passive option for listeners not supported.');
  }

  /**
   * Class to handle gestures
   */
  class Gesture extends ManagedElement {
    /**
     * @enum {number}
     */
    static Direction = {
      UP: 0,
      RIGHT: 1,
      DOWN: 2,
      LEFT: 3,
    };
    #startX;
    #startY;
    #distanceX;
    #distanceY;
    #gesturing = false;
    #startTime;
    #maxTimeMs = 500;
    #minRadius = 100;
    constructor(element) {
      super(element);
      let options = supportsPassive ? { passive: true } : undefined;
      this.listenToOwnEvent('touchstart', 'start', options);
      this.listenToOwnEvent('touchend', 'end');
      this.listenToOwnEvent('touchcancel', 'cancel');
    }

    /**
     * Handle the touchstart event.
     * @param {TouchEvent} event
     * @param {string} eventIdIgnored
     */
    handleTouchstartEvent(event, eventIdIgnored) {
      this.#gesturing = true;
      this.#startTime = new Date().getTime();
      this.#startX = event.touches[0].pageX;
      this.#startY = event.touches[0].pageY;
    }

    /**
     * Handle the touchend event. If a gesture is detected a `gesture` event
     * is dispatched with Gesture.Direction contained in the detail.
     * @param {TouchEvent} event
     * @param {string} eventIdIgnored
     */
    handleTouchendEvent(event, eventIdIgnored) {
      if (event.changedTouches.length > 1) {
        console.debug('Ignore multiple touches.');
        return;
      }
      this.#distanceX = event.changedTouches[0].pageX - this.#startX;
      this.#distanceY = this.#startY - event.changedTouches[0].pageY;
      this.#gesturing = false;
      const elapsedMs = new Date().getTime() - this.#startTime;
      if (elapsedMs > this.#maxTimeMs) {
        console.debug(`Gesture too slow at ${elapsedMs} ms`);
        return;
      }
      const radius = Math.sqrt(
        this.#distanceX * this.#distanceX + this.#distanceY * this.#distanceY
      );
      if (radius < this.#minRadius) {
        console.debug(`Gesture too short at ${radius} px`);
        return;
      }
      const angle = this.calcAngleInDeg(this.#distanceX, this.#distanceY);
      console.debug(`Direction ${angle} degrees`);
      let direction = this.getDirection(angle);
      this.element.dispatchEvent(
        new CustomEvent('gesture', { detail: direction })
      );
    }

    /**
     * Handle the touchcancel event.
     * @param {TouchEvent} eventIgnored
     * @param {string} eventIdIgnored
     */
    handleTouchcancelEvent(eventIgnored, eventIdIgnored) {
      this.#gesturing = false;
    }

    /**
     * Get the direction. Angle 0 is horizontal to the right.
     * @param {number} angleDeg - angle in degrees
     * @returns {Gesture.Direction}
     */
    getDirection(angle) {
      if (angle < 0) {
        angle += 360;
      }
      if (angle < 45) {
        return Gesture.Direction.RIGHT;
      } else if (angle < 135) {
        return Gesture.Direction.UP;
      } else if (angle < 225) {
        return Gesture.Direction.LEFT;
      } else if (angle < 315) {
        return Gesture.Direction.DOWN;
      } else {
        return Gesture.Direction.RIGHT;
      }
    }

    /**
     * Calculate the angle from (0, 0) to (x, y) in degrees.
     * @param {number} x
     * @param {number} y
     * @returns {number}
     */
    calcAngleInDeg(x, y) {
      return (Math.atan2(y, x) * 180) / Math.PI;
    }
  }

  /**
   * @file Present a problem
   *
   * @module lessons/presenters/slideProblemPresenter
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


  const MediaClass = {
    PAUSE: 'pause',
    PLAY: 'play',
    SKIP: 'skip',
  };

  const MediaID = {
    PAUSE: 'pause',
    PLAY: 'play',
    SKIP: 'skip',
  };

  /**
   * States of the card.
   * @enum {number}
   */
  const CardState = {
    INACTIVE: 0,
    ARRIVING: 1,
    READING: 2,
    LEAVING: 3,
  };

  /**
   * Class to present a slide show.
   * Presentation of a Problem provides the full problem and answer.
   * @class
   * @extends module:lessons/presenters/presenter.Presenter
   */
  class SlideProblemPresenter extends ProblemPresenter {
    /**
     * @type {module:lessons/presenters/displayCards.DisplayCards}
     */
    #cards;
    /**
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #visualCard;

    /**
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #skipButton;

    /**
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #playButton;

    /**
     * @type {module:utils/userIo/managedElement.ManagedElement}
     */
    #pauseButton;

    /**
     * TimerId
     * @type {number}
     */
    #readTimerId;

    /**
     * @type {CardState}
     */
    #cardState = CardState.INACTIVE;

    /**
     * @type {module:lessons/presenters/displayCards~CardDetail}
     */
    #currentCardDetail;

    /**
     * @type {boolean}
     */
    #paused;

    /**
     * Construct.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
     */
    constructor(config) {
      super(config);
      this.#buildSlideShow();
      this.submitButton.hide();
    }

    /**
     * Build the content.
     */
    #buildSlideShow() {
      this.#cards = new DisplayCards(
        this.problem.intro.html || this.problem.question.html
      );
      this.#visualCard = new ManagedElement('div', 'display-card');
      this.managedChildren.push(new Gesture(this.#visualCard.element));
      this.listenToEventOn('gesture', this.#visualCard);
      this.listenToEventOn('animationend', this.#visualCard);
      this.questionElement.removeChildren();
      this.questionElement.appendChild(this.#visualCard);
      this.expandPresentation();
      this.#addMediaButtons();
    }

    /**
     * Add media control buttons.
     */
    #addMediaButtons() {
      this.#playButton = new ManagedElement('button', MediaClass.PLAY);
      this.#addButtonToButtonBar(this.#playButton, icons.play, MediaID.PLAY);

      this.#pauseButton = new ManagedElement('button', MediaClass.PAUSE);
      this.#addButtonToButtonBar(this.#pauseButton, icons.pause, MediaID.PAUSE);

      this.#skipButton = new ManagedElement('button', MediaClass.SKIP);
      this.#addButtonToButtonBar(this.#skipButton, icons.skip, MediaID.SKIP);
    }

    /**
     * Add a button to the button bar
     * @param {module:utils/userIo/managedElement.ManagedElement} button
     * @param {utils/userIo/icons~IconDetails} iconDetails
     * @param {string} eventId
     */
    #addButtonToButtonBar(button, icon, eventId) {
      icons.applyIconToElement(icon, button.element);
      this.listenToEventOn('click', button, eventId); // numeric handler means this will resolve the presenter.
      this.addButtonToBar(button);
    }

    /**
     * Present on stage. The element is appended to the stageElement.
     * Note that it is not removed and any existing content is not removed..
     *
     * @param {module:utils/userIo/managedElement.ManagedElement} stageElement
     * @returns {Promise} - The Promise fulfils to the next `Presenter` that should be shown.
     */
    presentOnStage(stageElement) {
      this.#showMediaButtons(true);
      setTimeout(() => this.#showNextCard());
      return super.presentOnStage(stageElement);
    }

    /**
     * Set the card state adjusting css classes as required.
     * @param {CardState} cardState
     * @param {Gesture.Direction} [direction=Gesture.Direction.RIGHT]
     */
    #setCardState(cardState, direction) {
      switch (cardState) {
        case CardState.ARRIVING:
          this.#removeAllExitClasses();
          this.#visualCard.classList.add('card-onscreen');
          break;
        case CardState.LEAVING:
          this.#visualCard.classList.remove('card-onscreen');
          this.#visualCard.classList.add(
            this.#getExitClassForDirection(direction)
          );
          break;
      }
      this.#cardState = cardState;
    }

    /**
     * Remove all exit classes from card
     */
    #removeAllExitClasses() {
      this.#visualCard.classList.remove(
        this.#getExitClassForDirection(Gesture.Direction.UP)
      );
      this.#visualCard.classList.remove(
        this.#getExitClassForDirection(Gesture.Direction.LEFT)
      );
      this.#visualCard.classList.remove(
        this.#getExitClassForDirection(Gesture.Direction.DOWN)
      );
      this.#visualCard.classList.remove(
        this.#getExitClassForDirection(Gesture.Direction.RIGHT)
      );
    }

    /**
     * Get the appropriate class name for the card exit.
     * @param {Gesture.Direction} direction
     * @returns {string}
     */
    #getExitClassForDirection(direction) {
      const rootClass = 'card-offscreen';
      switch (direction) {
        case Gesture.Direction.UP:
          return `${rootClass}-up`;
        case Gesture.Direction.LEFT:
          return `${rootClass}-left`;
        case Gesture.Direction.DOWN:
          return `${rootClass}-down`;
        case Gesture.Direction.RIGHT:
        default:
          return `${rootClass}-right`;
      }
    }
    /**
     * Show the next card.
     */
    #showNextCard() {
      console.log('Show the next card');
      if (this.#endShowIfLastCard()) {
        this.handleClickEvent(new Event('click'), Presenter.NEXT_ID);
        return;
      }
      // obtain reading speed again incase it's been adjusted.
      const readingSpeed = persistentData.getFromStorage('readingSpeed', 130);
      this.#cards.setWordsPerMinute(readingSpeed);
      this.#currentCardDetail = this.#cards.getNext();
      this.#visualCard.innerHTML = this.#currentCardDetail.html;
      const cardRect = this.#visualCard.getBoundingClientRect();
      const presentationRect = this.presentation.getBoundingClientRect();
      const verticalSpace = presentationRect.height - cardRect.height;
      if (verticalSpace > 0) {
        this.#visualCard.style.marginTop = `${Math.floor(verticalSpace / 2)}px`;
      } else {
        this.#visualCard.style.marginTop = `0px`;
      }

      this.#setCardState(CardState.ARRIVING);
      this.#endShowIfLastCard();
    }

    /**
     * Leave card on screen while it's read.
     * After the read time the remove card is called.
     */
    #readCard() {
      this.#setCardState(CardState.READING);
      if (!this.#paused) {
        this.#readTimerId = setTimeout(() => {
          this.#removeCard();
        }, this.#currentCardDetail.readTimeSecs * 1000);
      }
    }

    /**
     * Remove the card
     * @param {?Gesture.Direction} direction
     */
    #removeCard(direction) {
      this.#setCardState(CardState.LEAVING, direction);
    }

    /**
     * Ends the show if end reached.
     * @returns {boolean} true if at end
     */
    #endShowIfLastCard() {
      if (!this.#cards.hasMore) {
        this.#pauseButton.hide();
        this.#playButton.hide();
        this.#skipButton.hide();
        this.showNextButton(true);
        return true;
      }
      return false;
    }

    /**
     * Handle the answers. Any other event is passed on to the base Presenter's
     * handler.
     * @param {Event} event
     * @param {string} eventId
     * @override
     */
    handleClickEvent(event, eventId) {
      switch (eventId) {
        case MediaID.PAUSE:
          clearTimeout(this.#readTimerId);
          this.#showMediaButtons(false);
          this.#paused = true;
          return;
        case MediaID.PLAY:
          clearTimeout(this.#readTimerId);
          this.#showMediaButtons(true);
          if (this.#cardState === CardState.READING) {
            this.#removeCard();
          }
          this.#paused = false;
          return;
        case MediaID.SKIP:
          this.#skip();
          return;
      }
      super.handleClickEvent(event, eventId);
    }

    /**
     * Perform the skip action.
     * @param {?Gesture.Direction} direction
     */
    #skip(direction) {
      clearTimeout(this.#readTimerId);
      this.#showMediaButtons(true);
      if (
        this.#cardState === CardState.ARRIVING ||
        this.#cardState === CardState.READING
      ) {
        this.#removeCard(direction);
      }
      this.#paused = false;
    }

    /**
     * Handle animation end event
     * @param {Event} event
     * @param {eventId} eventId - this will not be set.
     */
    handleAnimationendEvent(eventIgnored, eventIdIgnored) {
      switch (this.#cardState) {
        case CardState.ARRIVING:
          this.#readCard();
          break;
        case CardState.LEAVING:
          this.#showNextCard();
          break;
        default:
          console.error(
            `Animation unexpectedly ended with card in state ${this.#cardState}`
          );
      }
    }

    /**
     * Show media buttons.
     * @param {boolean} playing - true if playing.
     */
    #showMediaButtons(playing) {
      if (playing) {
        this.#pauseButton.show();
        this.#playButton.hide();
        this.#skipButton.show();
        this.#pauseButton.focus();
      } else {
        this.#pauseButton.hide();
        this.#playButton.show();
        this.#skipButton.hide();
        this.#playButton.focus();
      }
    }

    /**
     * Handle the gesture.
     * @param {CustomEvent} event
     * @param {*} eventIdIgnored
     */
    handleGestureEvent(event, eventIdIgnored) {
      console.debug(`Gesture direction ${event.detail}`);
      this.#skip(event.detail);
    }
  }

  /**
   * @file Present the marks
   *
   * @module lessons/presenters/marksPresenter
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


  /**
   * Classes used for styling medals.
   * percent gives the score required to achieve the result.
   * @enum {{percent:number, cssClass:string}}
   */
  const MedalDetails = {
    POOR: {
      upperLimit: 25,
      cssClass: 'poor',
    },
    BAD: {
      upperLimit: 50,
      cssClass: 'bad',
    },
    GOOD: {
      upperLimit: 75,
      cssClass: 'good',
    },
    EXCELLENT: {
      upperLimit: 100,
      cssClass: 'excellent',
    },
  };

  /**
   * Presenter for showing the results of a test.
   */
  class MarksPresenter extends Presenter {
    /**
     * @const
     */
    static RETRY_LESSON_ID = 'RETRY_LESSON';

    /**
     * @type {module:lessons/itemMarker~Marks}
     */
    #marks;

    /**
     *
     * @param {module:lessons/presenters/presenter~PresenterConfig} config
     */
    constructor(config) {
      super(config);
      this.#buildContent();
    }

    /**
     * Build the results content.
     */
    #buildContent() {
      this.#addHeadings();
      this.#addAnswers();
      this.#addResult();
      this.#addRetryButton();
      this.#adjustButtonsForOrigin();
    }

    /**
     * Adjust the buttons for the lesson origin.
     */
    #adjustButtonsForOrigin() {
      switch (this.config.lessonInfo.origin) {
        case LessonOrigin.EMBEDDED:
          this.hideHomeButton();
          this.applyIconToNextButton(icons.exit);
          this.showNextButton();
          break;
        case LessonOrigin.REMOTE:
          this.applyIconToNextButton(icons.selectLesson);
          this.showNextButton();
          break;
      }
    }
    /**
     * Add the titles.
     */
    #addHeadings() {
      const lessonTitle =
        this.config.lessonInfo.titles.lesson ||
        this.config.lesson.metadata.getValue('TITLE', i18n`Unknown title`);

      this.presentation.createAndAppendChild(
        'h1',
        null,
        i18n`Certificate of achievement`
      );
      this.presentation.createAndAppendChild('h2', null, lessonTitle);
      this.#addBookDetailsIfManaged();
    }

    /**
     * Add book details if managed lesson.
     */
    #addBookDetailsIfManaged() {
      if (this.config.lessonInfo.managed) {
        let bookDetails = '<p>from:</p>';
        if (lessonManager.usingLocalLibrary) {
          bookDetails += `<span class='library-title'>${this.config.lessonInfo.titles.library}</span>`;
        } else {
          bookDetails += `<span class='library-title'>${this.config.lessonInfo.titles.library}</span> 
        <span class='book-title'>${this.config.lessonInfo.titles.book}</span>
        <span class='chapter-title'>${this.config.lessonInfo.titles.chapter}</span>`;
        }
        this.presentation.createAndAppendChild('div', null, bookDetails);
      }
    }

    #addRetryButton() {
      const repeatButton = new ManagedElement('button');
      icons.applyIconToElement(icons.repeatLesson, repeatButton);
      this.addButtonToBar(repeatButton);
      this.listenToEventOn('click', repeatButton, MarksPresenter.RETRY_LESSON_ID);
    }

    /**
     * Add a list of answers.
     */
    #addAnswers() {
      const answers = new ManagedElement('ul');
      this.config.lesson.marks.markedItems.forEach((markedItem) => {
        const li = new ManagedElement('li');
        li.innerHTML = `${markedItem.item.question.plainText}`;
        li.classList.add(this.#getClassForMarkState(markedItem.state));
        answers.appendChild(li);
      });
      this.presentation.appendChild(answers);
    }

    /**
     * Add the score
     */
    #addResult() {
      const marks = this.config.lesson.marks;
      const totalQuestions = marks.correct + marks.incorrect + marks.skipped;
      const percent =
        totalQuestions == 0
          ? 0
          : Math.round((100 * marks.correct) / totalQuestions);
      const summary = i18n`Score: ${percent}% (${marks.correct}/${totalQuestions})`;
      const summaryItem = this.presentation.createAndAppendChild(
        'p',
        'result-summary',
        summary
      );
      summaryItem.classList.add(this.#calcMedalClass(percent));
    }

    /**
     * Add a medal based on the score.
     * The medal is added by adding a class to result which can then be styled in
     * CSS. Four classes are available:
     * bad, poor, good, excellent.
     */
    #calcMedalClass(percent) {
      for (const key in MedalDetails) {
        const details = MedalDetails[key];
        if (percent < details.upperLimit) {
          return details.cssClass;
        }
      }
      return MedalDetails.EXCELLENT.cssClass;
    }

    /**
     * Get a suitable class name for the state.
     * @param {module:lessons/markState.MarkState.MarkState} state
     */
    #getClassForMarkState(state) {
      switch (state) {
        case MarkState.CORRECT:
          return 'correct';
        case MarkState.INCORRECT:
          return 'incorrect';
        case MarkState.SKIPPED:
          return 'skipped';
      }
      return 'unknown-state';
    }

    /**
     * @override
     * @param {number | string} eventIndexOrId
     */
    next(eventId) {
      switch (eventId) {
        case MarksPresenter.RETRY_LESSON_ID:
          return this.config.factory.getProblemAgain(this, this.config);
        case Presenter.NEXT_ID:
          if (this.config.lessonInfo.origin === LessonOrigin.EMBEDDED) {
            window.top.location.replace(embeddedLesson.rootUrl);
            return;
          }
      }
      return super.next(eventId);
    }
  }

  /**
   * @file Presenter factory to remove circular dependendies with Presenter modules
   *
   * @module lessons/presenters/presenterFactory
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

  /**
   * Navigation definition for Presenters.
   * @type {Object<string,{previous:constructor, next:constructor}>}
   */
  const NAVIGATION = {
    HomePresenter: { previous: null, next: LibraryPresenter },
    LibraryPresenter: { previous: HomePresenter, next: BookPresenter },
    BookPresenter: { previous: LibraryPresenter, next: ChapterPresenter },
    ChapterPresenter: { previous: BookPresenter, next: LessonPresenter },
    LessonPresenter: { previous: ChapterPresenter, next: ProblemPresenter },
    LessonEditorPresenter: { previous: LessonPresenter, next: LessonPresenter },
    ProblemPresenter: { previous: null, next: ProblemPresenter },
    ChoiceProblemPresenter: { previous: null, next: ProblemPresenter },
    FillProblemPresenter: { previous: null, next: ProblemPresenter },
    OrderProblemPresenter: { previous: null, next: ProblemPresenter },
    SlideProblemPresenter: { previous: null, next: ProblemPresenter },
    MarksPresenter: { previous: null, next: ChapterPresenter },
  };

  /**
   * Factory for generating the navigation for Presenters.
   *
   * #Use of minifiers#
   * For this function to operate correctly, ensure that `Terser` is run
   * with the `keep_classnames` set to true. Otherwise the {@link Navigation} object
   * may be minified with anonymous classes and the use of `constructor.name` will
   * fail.
   * @type {module:lessons/presenters/presenter~PresenterFactory}
   */

  class PresenterFactory {
    /**
     * Get a suitable problem presenter based on the configuratoin.
     * @param {LessonConfig} config
     * @returns {Presenter}
     */
    getSuitableProblemPresenter(config) {
      const problem = config.lesson.peekAtNextProblem();
      switch (problem.questionType) {
        case QuestionType.ORDER:
          return new OrderProblemPresenter(config);
        case QuestionType.FILL:
          return new FillProblemPresenter(config);
        case QuestionType.MULTI:
          return new ChoiceProblemPresenter(config);
        case QuestionType.SIMPLE:
          return new ChoiceProblemPresenter(config);
        case QuestionType.SLIDE:
        default:
          return new SlideProblemPresenter(config);
      }
    }
    /**
     * Test if next exists for caller.
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @returns {boolean} True if supported.
     */
    hasNext(caller) {
      return !!NAVIGATION[caller.constructor.name].next;
    }
    /**
     * Test if previous exists for caller.
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @returns {boolean} True if supported.
     */
    hasPrevious(caller) {
      return !!NAVIGATION[caller.constructor.name].previous;
    }
    /**
     * Get the home presenter.
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
     * @returns {Presenter}  Presenter or null.
     */
    getHome(config) {
      return new HomePresenter(config);
    }

    /**
     * Get the appropriate editor for the calling {@link module:lessons/presenters/presenter.Presenter}
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
     * @returns {Presenter}  Presenter or null.
     */
    getEditor(caller, config) {
      if (caller instanceof LessonPresenter) {
        return new LessonEditorPresenter(config);
      } else {
        console.error(
          `Attempt to edit a presenter for which there is no editor. Going home.`
        );
        return new HomePresenter(config);
      }
    }
    /**
     * Get the appropriate navigator for the calling {@link module:lessons/presenters/presenter.Presenter}
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
     * @returns {Presenter} Presenter or null.
     */
    getNext(caller, config) {
      if (
        caller instanceof ProblemPresenter ||
        caller instanceof LessonPresenter
      ) {
        if (config.lesson.hasMoreProblems) {
          return this.getSuitableProblemPresenter(config);
        } else {
          return new MarksPresenter(config);
        }
      } else {
        const klass = this.#skipUnnecessaryListPresenters(
          NAVIGATION[caller.constructor.name].next
        );
        return klass ? new klass(config) : null;
      }
    }

    /**
     * Get the appropriate problem presenter to repeat the current problem.
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @returns {Presenter} Presenter or undefined.
     */
    getPrevious(caller, config) {
      const klass = NAVIGATION[caller.constructor.name].previous;
      return klass ? new klass(config) : null;
    }
    /**
     * Get the appropriate problem presenter to repeat the current problem.
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @returns {Presenter} Presenter or undefined.
     */
    getProblemAgain(caller, config) {
      if (!(caller instanceof MarksPresenter)) {
        console.error(
          'Attempt to retry problem from other than a MarksPresenter.'
        );
        return this.getHome(config);
      } else {
        config.lesson.restart();
        if (config.lesson.hasMoreProblems) {
          return this.getSuitableProblemPresenter(config);
        } else {
          return new MarksPresenter(config);
        }
      }
    }

    /**
     * @param {module:lessons/presenters/presenter.Presenter} caller - the calling presenter
     * @param {module:lessons/presenters/presenter~PresenterConfig} config - the required configuration
     * @returns {Presenter} Presenter or null.
     */
    getLibraryPresenter(callerIgnored, config) {
      const klass = this.#skipUnnecessaryListPresenters(LibraryPresenter);
      return new klass(config);
    }

    /**
     * For list presenters, skip to next if it only has one entry.
     * @param {Class} presenterClass
     * @returns {Class}
     */
    #skipUnnecessaryListPresenters(presenterClass) {
      for (;;) {
        const nextClass = this.#moveToNextPresenterIfUnnecessary(presenterClass);
        if (nextClass === presenterClass) {
          return presenterClass;
        }
        presenterClass = nextClass;
      }
    }

    /**
     * Move to the next presenter if the current one only has one option to choose
     * from.
     * @param {Class} presenterClass
     * @returns {Class} new Class. This will be unchanged if no switch occured.
     */
    #moveToNextPresenterIfUnnecessary(presenterClass) {
      switch (presenterClass.name) {
        case 'LibraryPresenter':
          if (lessonManager.bookTitles.length <= 1) {
            lessonManager.bookIndex = 0;
            return BookPresenter;
          }
          break;
        case 'BookPresenter':
          if (lessonManager.chapterTitles.length <= 1) {
            lessonManager.chapterIndex = 0;
            return ChapterPresenter;
          }
          break;
        case 'ChapterPresenter':
          if (lessonManager.lessonTitles.length <= 1) {
            lessonManager.lessonIndex = 0;
            return LessonPresenter;
          }
          break;
      }
      return presenterClass;
    }

    /**
     * Get the initial presenter.
     * @returns {Presenter}
     */
    static getInitial() {
      const config = { factory: new PresenterFactory() };
      if (embeddedLesson.hasLesson) {
        config.lesson = embeddedLesson.lesson;
        config.lessonInfo = embeddedLesson.lessonInfo;
        if (config.lesson.hasMoreProblems) {
          return config.factory.getSuitableProblemPresenter(config);
        } else {
          return new MarksPresenter(config);
        }
      }
      return new HomePresenter(config);
    }
  }

  /**
   * @file Handle messaged for first time use.
   *
   * @module data/firstTimeMessage
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


  /**
   * If this is the first time the application has been used, as defined by the
   * flag, a welcome message including privacy information is displayed.
   * The flag is set false once the dialog has been closed.
   * @returns {Promise} fulfils to undefined
   */
  function showFirstUseMessageIfAppropriate() {
    const FIRST_TIME_USE_KEY = 'showFirstUseMessage';
    const firstUse = persistentData.getFromStorage(FIRST_TIME_USE_KEY, true);
    if (firstUse) {
      const appName = BuildInfo.getProductName();
      const privacyLinkLabel = i18n`Privacy`;
      const privacyLink = `[${privacyLinkLabel}](${Urls.PRIVACY})`;
      const message = [
        i18n`${appName} has been designed to allow you to create lessons and quizzes quickly and easily by just writing simple, plain text.`,
        i18n`As this is your first time using the application, here is a quick summary of how your data are used and stored.`,
        '',
        i18n`- ${appName} holds no account details or personal information.`,
        i18n`- The only data stored are your preferences for using the application and any lessons you create.`,
        i18n`- No information that you enter when answering questions in a quiz is ever stored or transmitted to the server.`,
        i18n`- Data are stored on your device using your browser's localStorage.`,
        i18n``,
        i18n`- The application is hosted by GitHub, which does log your IP address for security purposes.`,
        i18n``,
        i18n`For more details please check out the ${privacyLink} information.`,
      ].join('\n');
      return ModalDialog.showInfo(parseMarkdown(message), i18n`Welcome`).then(
        () => persistentData.saveToStorage(FIRST_TIME_USE_KEY, false)
      );
    } else {
      return Promise.resolve();
    }
  }

  /**
   * @file Handle screen resizing.
   *
   * @module utils/userIo/screenSizer
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
  let throttleTimer = null;

  /**
   * Set the vh variable. This allows for browsers that include the address bar
   * in the vh calculation.
   */
  function setVhCssVariable() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  /**
   * Add event listener to handle resizing of the window.
   */
  window.addEventListener('resize', () => {
    if (throttleTimer !== null) {
      return; // it will get handled.
    }
    throttleTimer = window.setTimeout(() => {
      throttleTimer = null;
      setVhCssVariable();
    }, 200);
  });

  setVhCssVariable();

  /**
   * @file Main entry point for the application.
   *
   * @module main
   *
   * @license GPL-3.0-or-later
   * Lesson RunnerCreate quizzes and lessons from plain text files.
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

  /**
   * Display a fatal error.
   * This is shown in the console, written to the page's content. Nothing else is
   * used as it may not be safe to call complex functions such as ModalDialog
   * routines.
   * @param {Error} error
   */
  function showFatalError(error) {
    const html = `<h1>Whoops!</h1>
  <p>An error has occured from which I can't recover on my own.</p>
  <ul>
  <li>Name: ${error.name}</li>
  <li>Cause: ${error.cause}</li>
  <li>Message: ${error.message}</li>
  </ul>
  <p>Try reloading the application.</p>
  `;
    console.error(error);
    document.getElementById('content').innerHTML = html; // in case dialog cannot be shown.
  }

  /**
   * Load the application
   * @returns {Promise} fulfils to undefined.
   */
  function loadApplication() {
    console.info('Launching application.');
    persistentData.setStorageKeyPrefix(
      `LR_${BuildInfo.getBundleName().replace('.', '_')}`
    );

    return getLanguages(embeddedLesson.translations)
      .then(() => lessonManager.loadAllLibraries('assets/lessons/libraries.json'))
      .then(() => loadSettingDefinitions(getSettingDefinitions()))
      .then(() => {
        const language = i18n`language::`;
        if (language !== '') {
          console.info(`Language ${language}`);
          document.documentElement.setAttribute('lang', language);
        }
        return true;
      })
      .then(() => setHeaderAndFooter(getMainMenuItems()))
      .then(() => lessonManager.loadAllLibraryContent())
      .then(() =>
        toast(
          '<span style="font-size:3rem;">&#x1F631;</span>' +
            'This application is work in progress and not released yet. ' +
            'Things may change and things may break. Documentation may not be correct.')
      )
      .then(() => showFirstUseMessageIfAppropriate())
      .then(() => {
        const stage = document.getElementById('stage');
        return new StageManager(stage).startShow(PresenterFactory.getInitial());
      })
      .then(() => {
        console.warn('Did not expect to get here.');
        ModalDialog.showInfo(
          i18n`The application has finished. It will now start again.`
        ).then(() => window.location.reload());
      })
      .catch((error) => {
        showFatalError(error);
        ModalDialog.showFatal(error).then(() => window.location.reload());
      });
  }

  /**
   * Register the service worker if the application has been built. If running
   * directly from source, no service worker is registered.
   */
  function registerServiceWorkerIfBuilt() {
    if (BuildInfo.isBuilt()) {
      registerServiceWorker(BuildInfo.getMode());
    }
  }

  /**
   * Once the page has loaded, launch the application.
   */
  window.addEventListener('load', () => {
    try {
      registerServiceWorkerIfBuilt();
      return loadApplication();
    } catch (error) {
      showFatalError(error);
    }
  });

})();
