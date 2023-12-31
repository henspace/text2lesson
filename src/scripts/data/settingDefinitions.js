/**
 * @file Definition of settings.
 *
 * @module data/settingDefinitions
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

import { i18n } from '../utils/i18n/i18n.js';
import {
  setCssFromPalette,
  createPalette,
} from '../utils/color/colorPalettes.js';

import { lessonManager } from '../lessons/lessonManager.js';

import { persistentData } from '../utils/userIo/storage.js';
import * as cssVariables from '../utils/color/cssVariables.js';
import { icons } from '../utils/userIo/icons.js';
import { focusManager } from '../utils/userIo/focusManager.js';
import { soundManager, Enthusiasm } from '../utils/audio/soundManager.js';

const DEFAULT_HUE = 120;
const DEFAULT_SATURATION = 50;
const DEFAULT_COLOR_SPREAD = 120;
const DEFAULT_DARK_MODE = false;
const DEFAULT_FONT_SIZE = 15;
const DEFAULT_LIBRARY_KEY = 'EN';
const DEFAULT_READING_SPEED = '180';

/**
 * Create a palette.
 * @param {module:utils/color/colorPalettes~PaletteSettings} settings
 */
function setPalette(settings) {
  settings.hue =
    settings.hue ?? persistentData.getFromStorage('hue', DEFAULT_HUE);
  settings.saturation =
    settings.saturation ??
    persistentData.getFromStorage('saturation', DEFAULT_SATURATION);
  settings.spread =
    settings.spread ??
    persistentData.getFromStorage('spread', DEFAULT_COLOR_SPREAD);
  settings.dark =
    settings.dark ??
    persistentData.getFromStorage('darkMode', DEFAULT_DARK_MODE);
  setCssFromPalette(createPalette(settings));
}

/**
 * Get the definitions for all settings. Definition contain key, value settings.
 * This provided as a function to ensure template tags are executed after
 * languages have been loaded.
 * @returns  {SettingDefinitions}
 */
export function getSettingDefinitions() {
  return {
    palette: {
      type: 'separator',
      label: i18n`Colour settings`,
    },
    hue: {
      type: 'range',
      label: i18n`Palette hue`,
      defaultValue: DEFAULT_HUE,
      min: 0,
      max: 360,
      onupdate: (value) => {
        value = parseInt(value);
        setPalette({ hue: value });
      },
    },
    saturation: {
      type: 'range',
      label: i18n`Palette saturation`,
      defaultValue: DEFAULT_SATURATION,
      min: 0,
      max: 100,
      onupdate: (value) => {
        value = parseInt(value);
        setPalette({ saturation: value });
      },
    },
    spread: {
      type: 'range',
      label: i18n`Palette spread`,
      defaultValue: DEFAULT_COLOR_SPREAD,
      min: 0,
      max: 180,
      onupdate: (value) => {
        value = parseInt(value);
        setPalette({ spread: value });
      },
    },
    darkMode: {
      type: 'checkbox',
      label: i18n`Dark mode`,
      defaultValue: DEFAULT_DARK_MODE,
      onupdate: (value) => {
        setPalette({ dark: value });
      },
    },
    ui: {
      type: 'separator',
      label: i18n`User interface settings`,
    },
    fontSize: {
      type: 'range',
      label: i18n`Font size`,
      defaultValue: DEFAULT_FONT_SIZE,
      min: 10,
      max: 22,
      onupdate: (value) => {
        cssVariables.setProperty('--font-base-size', `${value}px`);
      },
    },
    hideButtonText: {
      type: 'checkbox',
      label: i18n`Hide button labels`,
      defaultValue: false,
      onupdate: (value) => {
        icons.hideText = value;
      },
    },
    focusOnStage: {
      type: 'checkbox',
      label: i18n`Keyboard focus on content`,
      defaultValue: false,
      onupdate: (value) => {
        focusManager.focusOnStage = value;
      },
    },
    readingSpeed: {
      type: 'range',
      label: i18n`Reading speed (wpm)`,
      defaultValue: DEFAULT_READING_SPEED,
      min: 80,
      max: 1000,
    },
    enthusiasm: {
      type: 'range',
      label: i18n`Audio level`,
      defaultValue: Enthusiasm.LOW,
      min: Enthusiasm.OFF,
      max: Enthusiasm.HIGH,
      onupdate: (value) => (soundManager.enthusiasm = value),
    },
    showFirstUseMessage: {
      type: 'checkbox',
      label: i18n`Show first use message`,
      defaultValue: true,
    },
    lessonInfo: {
      type: 'separator',
      label: i18n`Lesson settings`,
    },
    library: {
      type: 'select',
      label: i18n`Remote library`,
      defaultValue: DEFAULT_LIBRARY_KEY,
      onupdate: (value) => {
        lessonManager.remoteLibraryKey = value;
      },
      options: () => lessonManager.remoteLibraryTitles,
      reloadIfChanged: true,
    },
  };
}
