/**
 * @file Test for manager.
 *
 * @module utils/userIo/manager.test
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

import { DataStoreManager, persistentData } from './storage.js';
import { beforeAll, beforeEach, test, expect } from '@jest/globals';
import { InMemoryStorage } from './inMemoryStorage.js';

const TEST_KEY = '998d71e8777d9c57eee4552c4d203c12';
const inMemoryStorage = new InMemoryStorage();
const manager = new DataStoreManager(inMemoryStorage);

beforeAll(() => {
  expect(manager.createStorageKey('TEST')).toBe('appTEST');
  manager.setStorageKeyPrefix(TEST_KEY);
  persistentData.setStorageKeyPrefix(TEST_KEY);
  expect(manager.createStorageKey('TEST')).toBe(`${TEST_KEY}TEST`);
  expect(persistentData.createStorageKey('TEST')).toBe(`${TEST_KEY}TEST`);
});

beforeEach(() => {
  manager.setStorageKeyPrefix(TEST_KEY);
});

test('persistentData is a DataStorageManager accessing localStorage', () => {
  expect(persistentData).toBeInstanceOf(DataStoreManager);
  const key = 'A_KEY';
  const value = 'A random value';
  localStorage.setItem(`${TEST_KEY}${key}`, JSON.stringify(value));
  expect(persistentData.getFromStorage(key)).toBe(value);
  inMemoryStorage.removeItem(`${TEST_KEY}${key}`);
});

test('createStorageKey provides key using storage key prefix', () => {
  console.log('Default key of app tested by beforeAll.');
  expect(manager.createStorageKey('TEST')).toBe(`${TEST_KEY}TEST`);
});

test('getFromStorage gets data from local storage using key prefixed by the storageKey', () => {
  const key = 'A_KEY';
  const value = 'A random value';
  inMemoryStorage.setItem(`${TEST_KEY}${key}`, JSON.stringify(value));
  expect(manager.getFromStorage(key)).toBe(value);
  inMemoryStorage.removeItem(`${TEST_KEY}${key}`);
});

test('getFromStorage provides default in local storage does not contain value', () => {
  const key = 'A_KEY';
  const value = 'A random value';
  const defaultValue = 'fallback value';
  inMemoryStorage.setItem(`${TEST_KEY}${key}`, value);
  expect(manager.getFromStorage('XXXX', defaultValue)).toBe(defaultValue);
  inMemoryStorage.removeItem(`${TEST_KEY}${key}`);
});

test('saveToStorage saves stringified data to local storage using key prefixed by the storageKey', () => {
  const key = 'A_KEY';
  const value = 'A random value';
  manager.saveToStorage(`${key}`, value);
  expect(inMemoryStorage.getItem(`${TEST_KEY}${key}`)).toBe(
    JSON.stringify(value)
  );
  inMemoryStorage.removeItem(`${TEST_KEY}${key}`);
});

test('setStorageKeyPrefix alters key prefix used for local storage', () => {
  console.log('Tested by beforeAll');
});
