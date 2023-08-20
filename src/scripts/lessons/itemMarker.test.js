/**
 * @file Test marker
 *
 * @module lessons/itemMarker.test
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

import { ItemMarker, MarkState } from './itemMarker.js';
import { test, expect } from '@jest/globals';

test('constructor initialises values to zero', () => {
  const marker = new ItemMarker();
  expect(marker.marks).toEqual({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    markedItems: [],
  });
});

test('reset returns values to zero', () => {
  const testData = [
    { item: { value: 'test1' }, state: MarkState.CORRECT },
    { item: { value: 'test2' }, state: MarkState.INCORRECT },
    { item: { value: 'test3' }, state: MarkState.INCORRECT },
    { item: { value: 'test4' }, state: MarkState.SKIPPED },
    { item: { value: 'test5' }, state: MarkState.SKIPPED },
    { item: { value: 'test6' }, state: MarkState.SKIPPED },
  ];
  const marker = new ItemMarker();
  testData.forEach((data) => {
    marker.markItem(data.item, data.state);
  });
  const marks = marker.marks;

  expect(marker.marks.correct).toEqual(1);
  expect(marker.marks.incorrect).toEqual(2);
  expect(marker.marks.skipped).toEqual(3);
  testData.forEach((data, index) => {
    expect(marks.markedItems[index].item).toBe(data.item);
    expect(marks.markedItems[index].state).toBe(data.state);
  });
  marker.reset();
  expect(marker.marks).toEqual({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    markedItems: [],
  });
});

test('markItem', () => {
  console.log('No test necessary as covered by reset test.');
});

test('marks property', () => {
  console.log('No test necessary as covered by reset test.');
});
