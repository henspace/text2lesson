/**
 * @file Test the errors routine
 *
 * @module libs/utils/errorHandling/errors.test
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

import * as errors from './errors.js';
import { test, expect } from '@jest/globals';

test('escaped version removes characters <> and quotation marks', () => {
  const data = `test"'<>`;
  expect(errors.escapeAttribute(data)).not.toMatch(/["'<>]/);
});

test('unescaped attribute matches original prior to escaping', () => {
  const data = `abcxyxABCXYX012345678890!"£$%^&*(){}[]-_+="'<>`;
  const escaped = errors.escapeAttribute(data);
  expect(escaped).not.toEqual(data);
  expect(errors.unescapeAttribute(escaped)).toBe(data);
});

test('Attribute HTML creates escaped data-error attribute string', () => {
  const data = `abcxyxABCXYX012345678890!"£$%^&*(){}[]-_+="'<>`;
  const escaped = errors.escapeAttribute(data);
  const attributeHtml = errors.getErrorAttributeHtml(data);
  const match = attributeHtml.match(/^data-error="([a-zA-Z0-9+\\/=]+)"$/);
  expect(match).not.toBeNull();
  expect(match[1]).toBe(escaped);
  expect(errors.unescapeAttribute(match[1])).toBe(data);
});
