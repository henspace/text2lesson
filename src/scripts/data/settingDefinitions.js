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

import { i18n } from '../libs/utils/i18n/i18n.js';
import {
  setCssFromPalette,
  createPalette,
} from '../libs/utils/color/colorPalettes.js';

import * as lessonManager from '../lessons/lessonManager.js';

import { getFromStorage } from '../libs/utils/userIo/settings.js';
import * as cssVariables from '../libs/utils/color/cssVariables.js';

const DEFAULT_HUE = 120;
const DEFAULT_SATURATION = 50;
const DEFAULT_COLOR_SPREAD = 120;
const DEFAULT_DARK_MODE = false;
const DEFAULT_FONT_SIZE = 15;
const DEFAULT_LIBRARY_KEY = 'EN';

/**
 * Create a palette.
 * @param {module:utils/color/colorPalettes~PaletteSettings} settings
 */
function setPalette(settings) {
  settings.hue = settings.hue ?? getFromStorage('hue', DEFAULT_HUE);
  settings.saturation =
    settings.saturation ?? getFromStorage('saturation', DEFAULT_SATURATION);
  settings.spread =
    settings.spread ?? getFromStorage('spread', DEFAULT_COLOR_SPREAD);
  settings.dark =
    settings.dark ?? getFromStorage('darkMode', DEFAULT_DARK_MODE);
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
        return Promise.resolve(undefined);
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
        return Promise.resolve(undefined);
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
        return Promise.resolve(undefined);
      },
    },
    darkMode: {
      type: 'toggle',
      label: i18n`Dark mode`,
      defaultValue: DEFAULT_DARK_MODE,
      onupdate: (value) => {
        setPalette({ dark: value });
        return Promise.resolve(undefined);
      },
    },
    fontSize: {
      type: 'range',
      label: i18n`Font size`,
      defaultValue: DEFAULT_FONT_SIZE,
      min: 10,
      max: 22,
      onupdate: (value) => {
        cssVariables.setProperty('--font-base-size', `${value}px`);
        return Promise.resolve(undefined);
      },
    },
    lessonInfo: {
      type: 'separator',
      label: i18n`Lesson settings`,
    },
    library: {
      type: 'select',
      label: i18n`Library`,
      defaultValue: DEFAULT_LIBRARY_KEY,
      onupdate: (value) => lessonManager.setCurrentLibrary(value),
      options: () => lessonManager.getLibraryOptions(),
      dependents: ['bookIndex'],
    },
    bookIndex: {
      type: 'select',
      label: i18n`Book`,
      defaultValue: 0,
      options: () => lessonManager.getBookTitles(),
      onupdate: (value) => {
        value = parseInt(value);
        lessonManager.setBookIndex(value);
        return Promise.resolve(undefined);
      },
      dependents: ['chapterIndex'],
    },
    chapterIndex: {
      type: 'select',
      label: i18n`Chapter`,
      defaultValue: 0,
      options: () => lessonManager.getChapterTitles(),
      onupdate: (value) => {
        value = parseInt(value);
        lessonManager.setChapterIndex(value);
        return Promise.resolve(undefined);
      },
      dependents: ['lessonIndex'],
    },
    lessonIndex: {
      type: 'select',
      label: i18n`Lesson`,
      defaultValue: 0,
      options: () => lessonManager.getLessonTitles(),
      onupdate: (value) => {
        value = parseInt(value);
        lessonManager.setLessonIndex(value);
        return Promise.resolve(undefined);
      },
    },
  };
}
