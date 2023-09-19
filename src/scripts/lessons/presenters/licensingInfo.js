/**
 * @file Create element containing licensing information.
 *
 * @module lessons/presenters/licensingInfo
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
import { getLicenceUrl } from './attributions.js';
import { i18n } from '../../utils/i18n/i18n.js';
import {
  getPrintableLink,
  parseMarkdownSpanOnly,
} from '../../utils/text/textProcessing.js';

/**
 * Build a ManagedElement that contains licence information extracted from the
 * metadata.
 * @param {module:lessons/metadata.Metadata}
 * @returns {ManagedElement} null if nothing to build.
 */
export function getLicenceElement(metadata) {
  const author = parseMarkdownSpanOnly(metadata.getValue('AUTHOR', ''));
  let copyright = metadata.getValue('COPYRIGHT', '');
  let licence = metadata.getValue('LICENCE', metadata.getValue('LICENSE', ''));
  const licenceUrl = getLicenceUrl(licence);
  if (licence && licenceUrl) {
    licence = `<a href="${licenceUrl}" target="_blank">${licence}</a>${getPrintableLink(
      licenceUrl,
      true
    )}`;
  }
  const attribution = metadata.getValue('ATTRIBUTION', '');
  if (author || copyright) {
    const metaContainer = new ManagedElement('div', 'lesson-metadata');
    metaContainer.createAndAppendChild('span', '', i18n`Lesson` + ' ');
    const showAuthor =
      copyright.toLowerCase().indexOf(author.toLowerCase()) < 0;
    if (showAuthor) {
      metaContainer.createAndAppendChild('span', '', i18n`author: ${author}`);
    }
    if (copyright) {
      metaContainer.createAndAppendChild(
        'span',
        '',
        `${showAuthor ? '; ' : ''}&copy; ${copyright}`
      );
    }

    if (licence) {
      metaContainer.createAndAppendChild(
        'span',
        '',
        '; ' + i18n`license: ${licence}`
      );
    }
    if (attribution) {
      metaContainer.createAndAppendChild('span', '', `; ${attribution}`);
    }
    return metaContainer;
  } else {
    return null;
  }
}
