/**
 * @file Takes attributions as provided by online sources and converts them to Markdown
 *
 * @module utils/text/attributionsReverser
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
 * Extract the licence details from the WikiMedia attribution text. The text is
 * of the form `attribution, licence name, licence url`
 * @param {string} attribution
 * @returns {{attribution: string, shortName: string, licenceUrl: string}}
 */
function extractWikiMediaLicence(attribution) {
  const match =
    /^(.+?),\s*([^&,<]+)\s*(?:(?:<|&lt;)(.+)(?:>|&gt;))?,\s*via Wikimedia Commons$/gs.exec(
      attribution
    );
  if (match) {
    return {
      attribution: match[1],
      shortName: match[2],
      url: match[3],
    };
  } else {
    return {
      attribution: attribution,
      shortName: '',
      url: '',
    };
  }
}

/**
 * Remove newlines as this will prevent parsing of Markdown url
 * @param {string} data
 * @returns {string}
 */
function safeWhiteSpace(data) {
  return data?.replace(/\s/g, ' ');
}

/**
 * Form a Markdown image link with attribution
 * @param {Object} data 
 * @param {string} data.alignment
 * @param {string} data.altText
 * @param {string} data.imageUrl
 * @param {string} data.imageSourceUrl
 * @param {string} data.attribution
 
 * @param {string} data.authors
 * @param {string} data.licenceName
 * @param {string} data.licenceUrl
 * @param {string} data.notes
 * 
 */
function formMarkdownUrl(data) {
  const prefix = data.alignment === '<' ? '!<' : `${data.alignment ?? ''}!`;

  return safeWhiteSpace(
    `${prefix}[${data.altText}](${data.imageUrl} "${data.altText}: ${
      data.attribution
    }|${data.imageSourceUrl}|${data.authors ?? ''}|${data.licenceName ?? ''}|${
      data.licenceUrl ?? ''
    }|${data.notes ?? ''}")`
  );
}

const attributionPatterns = {
  WikimediaHtml: {
    re: /([<])?<a\s+title="([^"]+Wikimedia Commons)"\s+href="([^"]+)"><img\s+(?:width="(\d+)")?\s?alt="([^"]+)"\s+src="([^"]+)">\s*<\/a>/g,
    rep: (
      match,
      alignment,
      attribution,
      imageSourceUrl,
      width,
      altText,
      imageUrl
    ) => {
      const licence = extractWikiMediaLicence(attribution);
      return formMarkdownUrl({
        alignment: alignment,
        altText: altText?.trim(),
        imageUrl: imageUrl,
        imageSourceUrl: imageSourceUrl,
        attribution: licence.attribution?.trim(),
        authors: '',
        licenceName: licence.shortName?.trim(),
        licenceUrl: licence.url,
        notes: 'via Wikimedia Commons',
      });
    },
  },
  WikimediaBbcode: {
    re: /{bbcode}\s*([<])?\[url=([^\]]+?)]\s*\[img\]([^[]+?)\[\/img\]\s*\[\/url\]\s*\[url=([^\]]+?)\]([^[]+?)\[\/url\]\s*(.*?){bbcode}/gs,
    rep: (
      match,
      alignment,
      imageSourceUrl,
      imageUrl,
      imageSourceUrlRepeated,
      altText,
      attribution
    ) => {
      const licence = extractWikiMediaLicence(attribution);
      return formMarkdownUrl({
        alignment: alignment,
        altText: altText?.trim(),
        imageUrl: imageUrl,
        imageSourceUrl: imageSourceUrl,
        attribution: licence.attribution?.trim(),
        authors: '',
        licenceName: licence.shortName?.trim(),
        licenceUrl: licence.url,
        notes: 'via Wikimedia Commons',
      });
    },
  },
};

/**
 * Look for standard online attribution formats and convert them into Markdown.
 * @param {string} data
 * @returns {string}
 */
export function reverseAttributions(data) {
  for (const key in attributionPatterns) {
    const pattern = attributionPatterns[key];
    data = data.replace(pattern.re, pattern.rep);
  }
  return data;
}
