/**
 * @file Test for inMemoryStorage
 *
 * @module utils/userIo/inMemoryStorage.test
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
import { InMemoryStorage } from './inMemoryStorage.js';
import { test, expect } from '@jest/globals';

test('get length returns number of items stored', () => {
  const store = new InMemoryStorage();
  expect(store.length).toBe(0);
  store.setItem('A', 'first');
  store.setItem('B', 'second');
  expect(store.length).toBe(2);
});

test('clear removes all elements from store.', () => {
  const store = new InMemoryStorage();
  expect(store.length).toBe(0);
  store.setItem('A', 'first');
  store.setItem('B', 'second');
  expect(store.length).toBe(2);
  store.clear();
  expect(store.length).toBe(0);
});

test('get and set items work in conjunction to store and retrieve values', () => {
  const store = new InMemoryStorage();
  const key = 'testKey';
  const value = 'testValue';
  store.setItem(key, value);
  expect(store.getItem(key)).toBe(value);
});

test('using set with existing name, replaces current value', () => {
  const store = new InMemoryStorage();
  const key = 'testKey';
  const value = 'testValue';
  const replacementValue = 'XXXtestXXX';
  store.setItem(key, value);
  store.setItem(key, replacementValue);
  expect(store.getItem(key)).toBe(replacementValue);
  expect(store.length).toBe(1);
});

test('using set with nonexistent key, returns null', () => {
  const store = new InMemoryStorage();
  const key = 'testKey';
  const value = 'testValue';
  store.setItem(key, value);
  expect(store.getItem('XXX')).toBeNull();
});

test('set ignores nonstring values', () => {
  const store = new InMemoryStorage();
  const key = 'testKey';
  const value = { testValue: 'test' };
  store.setItem(key, value);
  expect(store.getItem(key)).toBeNull();
});

test("key returns key at index or null if it doesn't exist", () => {
  const store = new InMemoryStorage();
  const numberOfEntries = 4;
  for (let n = 0; n < numberOfEntries; n++) {
    const key = `key${n}`;
    const value = `value${n}`;
    store.setItem(key, value);
  }
  for (let n = 0; n < numberOfEntries; n++) {
    const key = `key${n}`;
    expect(store.key(n)).toBe(key);
  }
  expect(store.key(numberOfEntries)).toBeNull();
});

test('remove item removes item under the key name', () => {
  const store = new InMemoryStorage();
  const numberOfEntries = 4;
  for (let n = 0; n < numberOfEntries; n++) {
    const key = `key${n}`;
    const value = `key${n}`;
    store.setItem(key, value);
  }

  expect(store).toHaveLength(numberOfEntries);
  const removedKey = 'key2';
  store.removeItem(removedKey);
  expect(store).toHaveLength(numberOfEntries - 1);
  for (let n = 0; n < numberOfEntries; n++) {
    const key = `key${n}`;
    const value = `key${n}`;
    expect(store.getItem(key)).toBe(key === removedKey ? null : value);
  }
});
