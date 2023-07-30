/**
 * @file Test for SettingsValueCache
 *
 * @module libs/utils/userIo/settingsValueCache.test
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

let storage = new Map();

jest.unstable_mockModule('./settings.js', () => {
  return {
    getFromStorage: (key) => storage.get(key),
  };
});

const { SettingsValueCache } = await import('./settingsValueCache.js');
await import('./settings.js');

beforeEach(() => {
  storage = new Map();
  storage.set('settingA', 10);
  storage.set('settingB', 20);
  storage.set('settingC', 30);
  storage.set('settingD', 40);
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
  storage.set('settingA', 99);
  storage.set('settingC', 99);
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
  storage.set('settingA', 99);
  storage.set('settingB', 99);
  storage.set('settingC', 99);
  storage.set('settingD', 99);
  expect(cache.changes).toBe('labelB, labelD');
});
