/**
 * @file Test for the Presenter
 *
 * @module libs/utils/userIo/presenter.test
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
import { Presenter } from './presenter.js';
import { test, expect, beforeEach } from '@jest/globals';

beforeEach(() => {
  const element = document.getElementById('presenter-stage');
  element?.remove();
});

test('constructor creates stage', () => {
  expect(document.getElementById('presenter-stage')).toBeNull();
  new Presenter();
  expect(document.getElementById('presenter-stage')).not.toBeNull();
});

test('present merely writes escaped text', () => {
  const presenter = new Presenter();
  expect(document.getElementById('presenter-stage')).not.toBeNull();
  presenter.present('<div>test</div>');
  expect(document.getElementById('presenter-stage').innerHTML).toEqual(
    '<div>test</div>'
  );
});
