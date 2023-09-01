/**
 * @file Test fontAwesomeTools
 *
 * @module lessons/fontAwesomeTools.test
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

import { test, expect } from '@jest/globals';
import { getHtmlForIconName } from './fontAwesomeTools.js';

test('Html created for icon with fa prefix', () => {
  expect(getHtmlForIconName('fa-circle-right')).toBe(
    '<i class="fa-solid fa-circle-right"></i>'
  );
});

test('Html created for icon without fa prefix', () => {
  expect(getHtmlForIconName('circle-right')).toBe(
    '<i class="fa-solid fa-circle-right"></i>'
  );
});

test('Html created for icon provide in upper case', () => {
  expect(getHtmlForIconName('fa-circle-RIGHT')).toBe(
    '<i class="fa-solid fa-circle-right"></i>'
  );
});

test('Html created for notdef icon id icon name invalid', () => {
  expect(getHtmlForIconName('fa-<script>-right')).toBe(
    '<i class="fa-solid fa-notdef"></i>'
  );
});

test('Html created with additional class name if valid', () => {
  expect(getHtmlForIconName('circle-right', 'bigger')).toBe(
    '<i class="fa-solid fa-circle-right bigger"></i>'
  );
});

test('Html created for icon without class name if classname invalid', () => {
  expect(getHtmlForIconName('circle-right', '<script>')).toBe(
    '<i class="fa-solid fa-circle-right"></i>'
  );
});
