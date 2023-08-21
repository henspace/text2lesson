/**
 * @file Test import and export
 *
 * @module lessons/lessonImportExport.test
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

import { base64ToString } from '../utils/text/base64.js';
import { LessonExporter, LessonImporter } from './lessonImportExport.js';
import { jest, test, expect } from '@jest/globals';

test('exporter exports a base64 lesson', () => {
  const title = 'Hello World';
  const content = '(i) Slideshow';

  const exporter = new LessonExporter(title, content);
  const spy = jest
    .spyOn(exporter, 'saveDataToFile')
    .mockImplementation(() => true);
  exporter.exportBase64Lesson();
  const data = spy.mock.calls[0][0];
  const obj = JSON.parse(base64ToString(data));
  expect(obj.title).toBe(title);
  expect(obj.content).toBe(content);
});

test('exporter exports an Autorun lesson', () => {
  const title = 'Hello World';
  const content = '(i) Slideshow';

  const exporter = new LessonExporter(title, content);
  const spy = jest
    .spyOn(exporter, 'saveDataToFile')
    .mockImplementation(() => true);
  exporter.exportAutorunLesson();
  const data = spy.mock.calls[0][0];
  expect(data).toMatch(/^<!DOCTYPE html>/);
  const titleB64 = data.match(
    /const LESSON_TITLE_B64 = "([A-Za-z0-9/+=]+)";/
  )[1];
  const contentB64 = data.match(
    /const LESSON_SOURCE_B64 = "([A-Za-z0-9/+=]+)";/
  )[1];
  const exportedTitle = base64ToString(titleB64);
  const exportedContent = base64ToString(contentB64);
  expect(exportedTitle).toBe(title);
  expect(exportedContent).toBe(content);
});

test('Importer can import an exported base64 file', () => {
  const title = 'Hello World';
  const content = '(i) Slideshow';

  const exporter = new LessonExporter(title, content);
  const spy = jest
    .spyOn(exporter, 'saveDataToFile')
    .mockImplementation(() => true);
  exporter.exportBase64Lesson();
  const data = spy.mock.calls[0][0];
  const importer = new LessonImporter();
  const result = importer.convert(data);
  expect(result.title).toBe(title);
  expect(result.content).toBe(content);
});

test('Importer can import an exported autorun file', () => {
  const title = 'Hello World';
  const content = '(i) Slideshow';

  const exporter = new LessonExporter(title, content);
  const spy = jest
    .spyOn(exporter, 'saveDataToFile')
    .mockImplementation(() => true);
  exporter.exportAutorunLesson();
  const data = spy.mock.calls[0][0];
  const importer = new LessonImporter();
  const result = importer.convert(data);
  expect(result.title).toBe(title);
  expect(result.content).toBe(content);
});

test('Importer can import a plain text file', () => {
  const data = '(i) Slideshow';
  const importer = new LessonImporter();
  const result = importer.convert(data);
  expect(result.title).toBe('');
  expect(result.content).toBe(data);
});

test('Importer returns null if converting an invalid file', () => {
  const data = 'just some garbage\nthat is not a lesson.';
  const importer = new LessonImporter();
  const result = importer.convert(data);
  expect(result).toBeNull();
});
