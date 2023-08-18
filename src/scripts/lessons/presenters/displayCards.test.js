/**
 * @file Test for display cards.
 *
 * @module lessons\presenters\displayCards.test
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

import { DisplayCards } from './displayCards.js';

import { test, expect } from '@jest/globals';

test('Check html broken into blocks on divs and paragraphs.', () => {
  const html =
    '<p>first line\n\nsecond line</p>\n\n<div>third line\nfourth line\n</div>';
  const cards = new DisplayCards(html);
  expect(cards.getNext().html).toBe('<p>first line\n\nsecond line</p>');
  expect(cards.getNext().html).toBe('<div>third line\nfourth line\n</div>');
  expect(cards.getNext()).toBeNull();
});

test('Check html broken into blocks on divs and paragraphs in upper case.', () => {
  const html =
    '<P>first line\n\nsecond line</P>\n\n<DIV>third line\nfourth line\n</DIV>';
  const cards = new DisplayCards(html);
  expect(cards.getNext().html).toBe('<P>first line\n\nsecond line</P>');
  expect(cards.getNext().html).toBe('<DIV>third line\nfourth line\n</DIV>');
  expect(cards.getNext()).toBeNull();
});

test('Check html broken into blocks on divs and paragraphs with unterminated last element.', () => {
  const html =
    '<p>first line\n\nsecond line</p>\n\n<div>third line\nfourth line\n';
  const cards = new DisplayCards(html);
  expect(cards.getNext().html).toBe('<p>first line\n\nsecond line</p>');
  expect(cards.getNext().html).toBe('<div>third line\nfourth line');
  expect(cards.getNext()).toBeNull();
});

test('Check html broken into blocks on divs and paragraphs with no breaks.', () => {
  const html = 'this is a test';
  const cards = new DisplayCards(html);
  expect(cards.getNext().html).toBe('this is a test');
  expect(cards.getNext()).toBeNull();
});

test('Read time provided', () => {
  const expectedWordsPerMinute = 130;
  const nWords = 260;
  const expectedDuration = (nWords * 60.0) / expectedWordsPerMinute;
  let data = '  <i> random_word </i>'.repeat(nWords);
  const cards = new DisplayCards(data);
  expect(cards.getNext().readTimeSecs).toBeCloseTo(expectedDuration, 0);
});

test('hasMore detects if there are more elements.', () => {
  const html =
    '<P>first line\n\nsecond line</P>\n\n<DIV>third line\nfourth line\n</DIV>';
  const cards = new DisplayCards(html);
  expect(cards.hasMore).toBe(true);
  expect(cards.getNext().html).toBe('<P>first line\n\nsecond line</P>');
  expect(cards.hasMore).toBe(true);
  expect(cards.getNext().html).toBe('<DIV>third line\nfourth line\n</DIV>');
  expect(cards.hasMore).toBe(false);
  expect(cards.getNext()).toBeNull();
});

test('setWordsPerMinute adjusts reading speed', () => {
  const expectedWordsPerMinute = 200;
  const nWords = 260;
  const expectedDuration = (nWords * 60.0) / expectedWordsPerMinute;
  let data = '  <i> random_word </i>'.repeat(nWords);
  const cards = new DisplayCards(data);
  cards.setWordsPerMinute(expectedWordsPerMinute);
  expect(cards.getNext().readTimeSecs).toBeCloseTo(expectedDuration, 0);
});
