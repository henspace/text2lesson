/**
 * @jest-environment jsdom
 */
/**
 * @file Test routines for cssVariables
 * @module utils/cssVariables.test
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

/*global test, expect, beforeAll */
import { jest } from '@jest/globals';

let cssVariables;

const testProperties = { prop1: 'ONE', prop2: 'TWO', prop3: 'THREE' };
const rootElement = {
  style: {
    getPropertyValue: (key) => testProperties[key],
    setProperty: (key, value) => (testProperties[key] = value),
  },
};

beforeAll(() => {
  document.querySelector = jest.fn((key) => {
    if (key === ':root') {
      return rootElement;
    }
    return null;
  });

  window.getComputedStyle = jest.fn((element) => {
    if (element === rootElement) {
      return rootElement.style;
    }
    return null;
  });

  return import('./cssVariables').then((result) => {
    cssVariables = result;
    return true;
  });
});

test('getProperty - test access of root style', () => {
  for (const prop in rootElement.style.properties) {
    expect(cssVariables.getProperty(prop)).toBe(
      rootElement.style.properties[prop]
    );
  }
});

test('setProperty - test access of root style', () => {
  const testProperty = '--some-property';
  const testValue = 'some test value';

  cssVariables.setProperty(testProperty, testValue);
  expect(testProperties[testProperty]).toBe(testValue);
});
