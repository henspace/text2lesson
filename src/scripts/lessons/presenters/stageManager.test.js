/**
 * Test the stage manager
 *
 * @module lessons\presenters\stageManager.test
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

import { StageManager } from './stageManager.js';
import { Presenter } from './presenter.js';
import { jest, test, expect, beforeAll, beforeEach } from '@jest/globals';

/**
 * @type {Element}
 */
let stageElement;

beforeAll(() => {
  stageElement = document.createElement('div');
  document.body.appendChild(stageElement);
});

beforeEach(() => {
  stageElement.innerHTML = '';
});

test('startShow waits until presenter fulfils to null', () => {
  const presenterA = new Presenter();
  const presenterB = new Presenter();
  const presenterC = new Presenter();
  const spyA = jest.spyOn(presenterA, 'presentOnStage');
  const spyB = jest.spyOn(presenterB, 'presentOnStage');
  const spyC = jest.spyOn(presenterC, 'presentOnStage');
  spyA.mockReturnValue(Promise.resolve(presenterB));
  spyB.mockReturnValue(Promise.resolve(presenterC));
  spyC.mockReturnValue(Promise.resolve(null));

  const stageManager = new StageManager(stageElement);
  stageManager.startShow(presenterA).then(() => {
    expect(spyA).toBeCalledTimes(1);
    expect(spyB).toBeCalledTimes(1);
    expect(spyC).toBeCalledTimes(1);
  });
});

test('startShow clears stage content before each presentation and on fulfilment', () => {
  const presenterA = new Presenter();
  const presenterB = new Presenter();
  const presenterC = new Presenter();
  const spyA = jest.spyOn(presenterA, 'presentOnStage');
  const spyB = jest.spyOn(presenterB, 'presentOnStage');
  const spyC = jest.spyOn(presenterC, 'presentOnStage');
  expect.assertions(4);
  spyA.mockImplementation(() => {
    expect(stageElement.innerHTML).toBe('');
    stageElement.innerHTML = 'presenter A';
    return Promise.resolve(presenterB);
  });
  spyB.mockImplementation(() => {
    expect(stageElement.innerHTML).toBe('');
    stageElement.innerHTML = 'presenter B';
    return Promise.resolve(presenterC);
  });
  spyC.mockImplementation(() => {
    expect(stageElement.innerHTML).toBe('');
    stageElement.innerHTML = 'presenter C';
    return Promise.resolve(null);
  });

  const stageManager = new StageManager(stageElement);
  stageManager.startShow(presenterA).then(() => {
    expect(stageElement.innerHTML).toBe('');
  });
});
