/**
 * @file Utilities for sharing
 *
 * @module utils/share/share
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
import { getCertificateHtml } from '../../data/templates/certificate.js';
import {
  LessonExporter,
  makeSafeFilename,
} from '../../lessons/lessonImportExport.js';
import { i18n } from '../i18n/i18n.js';
import { toast } from '../userIo/toast.js';

/**
 * Create url for mailing.
 * @param {Object} options
 * @param {string} options.to - recipient
 * @param {string} options.subject
 * @param {string} options.body
 * @returns {string} encoded uri
 */
function constructMailUrl(options) {
  const url = `mailto:${options.to}?subject=${options.subject}&body=${options.body}`;
  return encodeURI(url);
}

/**
 * Shar simple data by email.
 * @param {Object} data
 * @param {string} data.to - recipient
 * @param {string} data.subject
 * @param {string} data.body
 */
export function shareByEmail(data) {
  const url = constructMailUrl(data);
  window.open(url, '_blank');
}

/**
 * Share a certificate using the Web Api.
 * @param {string} content - html content that is inserted into a certificate template.
 * @returns {Promise} fulfils to true on success.
 */
export function shareCertificateContent(content) {
  const html = getCertificateHtml(content);
  const shareData = {
    filename: 'Text2Lesson_certificate.html',
    text: i18n`My Text2Lesson certificate`,
    title: i18n`Text2Lesson Certificate of Achievement`,
    html: html,
  };
  return shareHtmlFile(shareData).then((shareResult) => {
    if (!shareResult) {
      toast(shareResult.message);
    }
    return shareResult.success;
  });
}

/**
 * Share an autorun lesson.
 * @param {string} title
 * @param {module:lessons/lesson/Lesson} lesson
 * @returns {Promise} fulfils to true on success.
 */
export function shareAutorunLesson(title, lesson) {
  const exporter = new LessonExporter(title, lesson.rawSource);
  const html = exporter.createAutorunLessonHtml();
  const shareData = {
    filename: makeSafeFilename('autorun_' + title, 'html'),
    text: title,
    title: i18n`Text2Lesson autorun lesson`,
    html: html,
  };
  return shareHtmlFile(shareData).then((shareResult) => {
    if (!shareResult) {
      toast(shareResult.message);
    }
    return shareResult.success;
  });
}

/**
 * @typedef {Object} ShareResult
 * @property {boolean} success - true if completed share.
 * @property {string} errorMessage - only set if success is false.
 */
/**
 * Share an html file using the Web Share Api.
 * @param {Object} data
 * @param {string} data.filename
 * @param {string} data.html
 * @param {string} data.text - text included in message.
 * @param {string} data.title - title included in message.
 * @returns {Promise} fulfils to ShareResult.
 */
function shareHtmlFile(data) {
  const fileToShare = new File([data.html], data.filename, {
    type: 'text/html',
  });
  const shareData = {
    text: data.text,
    title: data.title,
    files: [fileToShare],
  };
  if (!navigator?.canShare(shareData)) {
    console.error('Cannot share:', shareData);
    return Promise.resolve({
      success: false,
      errorMessage: i18n`Sharing not available on this device.`,
    });
  }

  return navigator
    .share(shareData)
    .then(() => {
      console.debug('Share completed okay.');
      return { success: true, errorMessage: '' };
    })
    .catch((error) => {
      console.error(error.message);
      return {
        success: false,
        errorMessage: error.message,
      };
    });
}
