/**
 * @file Extract attributions
 *
 * @module lessons/presenters/attributions
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

import { ManagedElement } from '../../utils/userIo/managedElement.js';
import {
  getPrintableLink,
  parseMarkdownSpanOnly,
} from '../../utils/text/textProcessing.js';

/**
 * @typedef {Object} ExtendedTitle
 * @property {string} title
 * @property {string} source
 * @property {string} authors - comma separated list of the author followed by extended attributions
 * @property {string} licence
 
 */
/**
 * Parse extended title. This is expected to comprise it constituent parts separated by
 * forward slashes. The structure is as follows
 * title|source|authors|licenceName|licenceUrl|Notes
 * @param {Element} image
 * @returns {ExtendedTitle}
 */
function getExtendedTitle(image) {
  const title = image.getAttribute('title');
  if (!title) {
    return null;
  }
  const parts = title.split('|');

  return {
    title: parts[0]?.trim() ?? '',
    source: parts[1]?.trim() ?? '',
    authors: parts[2]?.trim() ?? '',
    licenceName: parts[3]?.trim() ?? '',
    licenceUrl: parts[4]?.trim() ?? '',
    notes: parts[5]?.trim() ?? '',
  };
}

/**
 * Create a link. Includes printable version.
 * @param {string} href
 * @param {string} text
 * @returns {string}
 */
function createLink(href, text) {
  return `<a href="${href}" target="_blank">${text}</a>${getPrintableLink(
    href,
    text,
    true
  )}`;
}

/**
 *
 * @param {ManagedElement} container
 * @param {string} source - url of image
 * @param {*} title
 */
function appendTitle(container, imageSource, imageTitle) {
  container.createAndAppendChild(
    'span',
    '',
    createLink(imageSource, imageTitle || 'Untitled')
  );
}

/**
 * Parse the authors field and appends to the container.
 * @param {ManagedElement} container
 * @param {string} authors
 */
function appendAuthors(container, authors) {
  if (authors) {
    container.createAndAppendChild('span', '', ` by ${authors}`);
  }
}

/**
 * Parse the licence field and appends to the container.
 * Span markdown replacements are allowed which
 * enables links to other licences to be added.
 * The function tries to match the licence to known licences
 * @param {ManagedElement} container
 * @param {string} licence
 */
function appendLicence(container, licenceName, licenceUrl) {
  if (licenceName || licenceUrl) {
    licenceUrl = licenceUrl || getLicenceUrl(licenceName);
    let text;
    if (licenceUrl) {
      text = `, licence: ${createLink(licenceUrl, licenceName || licenceUrl)}`;
    } else {
      text = `, ${licenceName}`;
    }

    container.createAndAppendChild('span', '', text);
  }
}

/**
 * Parse the notes field and appends to the container.
 * Span markdown replacements are allowed which
 * enables links to other licences to be added.
 * @param {ManagedElement} container
 * @param {string} notes
 */
function appendNotes(container, notes) {
  if (notes) {
    container.createAndAppendChild(
      'span',
      '',
      ` [${parseMarkdownSpanOnly(notes)}]`
    );
  }
}

/**
 * Get the licence URL.
 * @param {string} licenceName``
 * @returns {string} '' if unknown.
 */
function getLicenceUrl(licenceName) {
  if (/^\s*&CC0\s*$/.test(licenceName)) {
    return 'https://creativecommons.org/publicdomain/zero/1.0/';
  }
  if (/^\s*unsplash\s*$/i.test(licenceName)) {
    return 'https://unsplash.com/license';
  } else {
    const matchCC =
      /^\s*CC[ -](BY(?:-(?:SA|NC|NC-SA|ND|NC-ND))?) ?(\d+[.]\d)?\s*$/i.exec(
        licenceName
      );
    if (matchCC) {
      return `https://creativecommons.org/licenses/${matchCC[1].toLowerCase()}/${
        matchCC[2] || '4.0'
      }/`;
    }
  }
  return ''; // not CC
}

/**
 * Build an attribution
 * @param {*} extendedTitle - details extracted from the image.
 * @returns {ManagedElement}
 */
function buildAttribution(extendedTitle) {
  const container = new ManagedElement('li', 'attribution');
  if (!extendedTitle.source) {
    container.createAndAppendChild(
      'span',
      '',
      parseMarkdownSpanOnly(extendedTitle.title)
    );
    return container;
  }
  appendTitle(container, extendedTitle.source, extendedTitle.title);
  appendAuthors(container, extendedTitle.authors);
  appendNotes(container, extendedTitle.notes);
  appendLicence(container, extendedTitle.licenceName, extendedTitle.licenceUrl);
  return container;
}

/**
 * Extract attributes from DOM elements
 * @param {Element | ManagedElement} parent
 */
export function getAttributions(parent) {
  const container = new ManagedElement('ul', 'attributions');
  const images =
    ManagedElement.getElement(parent).querySelectorAll('img[title]');
  if (images.length === 0) {
    return null;
  }

  images.forEach((image) => {
    const extendedTitle = getExtendedTitle(image);
    if (extendedTitle) {
      const attribution = buildAttribution(extendedTitle);
      container.appendChild(attribution);
    }
  });
  return container;
}
