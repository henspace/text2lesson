/**
 * @jest-environment node
 */
/**
 * @file test of routines in postbuild.
 * @module
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
/*global test, expect */
import * as postBuildUtils from './postbuild-utils.js';

test('getScriptReplacement - test with various script tags', () => {
  const subName = 'mod.js';
  var replacement = postBuildUtils.getScriptReplacement(
    'test.js',
    subName,
    'somefiletype'
  );
  expect(replacement.filetype).toBe('somefiletype');
  expect(
    `prefix<script src="test.js">suffix`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix<script src="${subName}">suffix`);
  expect(
    `prefix <script src="test.js"> suffix`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix <script src="${subName}"> suffix`);
  expect(
    `prefix <SCRIPT src="test.js"> suffix`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix <SCRIPT src="${subName}"> suffix`);
  expect(
    `prefix <script type="module" src="test.js"> suffix`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix <script type="module" src="${subName}"> suffix`);
  expect(
    `prefix <script src="test.js"> <script src="test.js">`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix <script src="${subName}"> <script src="${subName}">`);
  expect(
    `prefix <script src="test.js"> <script src="tost.js">`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix <script src="${subName}"> <script src="tost.js">`);
  expect(
    `prefix <script src="./src/test.js"> suffix">`.replaceAll(
      replacement.search,
      replacement.sub
    )
  ).toBe(`prefix <script src="${subName}"> suffix">`);
});

test('extractHeader should extract the JSDoc block', () => {
  const content = `
    This is ignored.
    This is also ignored
    /**
     * this is line 1
     * this is line 2
     * this is line 3
     */
    this is ignored`;
  const results = postBuildUtils.extractHeader(content);
  const lines = results.split('\n');
  expect(lines).toHaveLength(3);
  expect(lines[0]).toBe('this is line 1');
  expect(lines[1]).toBe('this is line 2');
  expect(lines[2]).toBe('this is line 3');
});
