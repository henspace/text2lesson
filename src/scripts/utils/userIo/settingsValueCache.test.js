/**
 * @file Test for SettingsValueCache
 *
 * @module utils/userIo/settingsValueCache.test
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

import { jest, beforeEach, test, expect } from '@jest/globals';
import { InMemoryStorage } from './inMemoryStorage.js';

const inMemoryStorage = new InMemoryStorage();

jest.unstable_mockModule('./storage.js', () => {
  return {
    persistentData: {
      getFromStorage: (key) => inMemoryStorage.getItem(key),
    },
  };
});

const { SettingsValueCache } = await import('./settingsValueCache.js');
await import('./settings.js');

beforeEach(() => {
  inMemoryStorage.clear();
  inMemoryStorage.setItem('settingA', '10');
  inMemoryStorage.setItem('settingB', '20');
  inMemoryStorage.setItem('settingC', '30');
  inMemoryStorage.setItem('settingD', '40');
});

test('changes returns empty string if nothing changed', () => {
  const definitions = {
    settingA: {
      label: 'labelA',
    },
    settingB: {
      label: 'labelB',
      reloadIfChanged: true,
    },
    settingC: {
      label: 'labelC',
    },
    settingD: {
      label: 'labelD',
      reloadIfChanged: true,
    },
  };
  const cache = new SettingsValueCache(definitions);
  expect(cache.changes).toBe('');
});

test('changes ignores changes to values which do not have reloadIfChanged set', () => {
  const definitions = {
    settingA: {
      label: 'labelA',
    },
    settingB: {
      label: 'labelB',
      reloadIfChanged: true,
    },
    settingC: {
      label: 'labelC',
    },
    settingD: {
      label: 'labelD',
      reloadIfChanged: true,
    },
  };
  const cache = new SettingsValueCache(definitions);
  inMemoryStorage.setItem('settingA', '99');
  inMemoryStorage.setItem('settingC', '99');
  expect(cache.changes).toBe('');
});

test('changes returns changes to values which have reloadIfChanged set', () => {
  const definitions = {
    settingA: {
      label: 'labelA',
    },
    settingB: {
      label: 'labelB',
      reloadIfChanged: true,
    },
    settingC: {
      label: 'labelC',
    },
    settingD: {
      label: 'labelD',
      reloadIfChanged: true,
    },
  };
  const cache = new SettingsValueCache(definitions);
  inMemoryStorage.setItem('settingA', '99');
  inMemoryStorage.setItem('settingB', '99');
  inMemoryStorage.setItem('settingC', '99');
  inMemoryStorage.setItem('settingD', '99');
  expect(cache.changes).toBe('labelB, labelD');
});
