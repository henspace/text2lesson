/**
 * @file Test for the Presenter
 *
 * @module libs/utils/userIo/presenter.test
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
import { Presenter } from './presenter.js';
import { ManagedElement } from '../../libs/utils/dom/managedElement.js';

import { test, expect, beforeEach, beforeAll } from '@jest/globals';

let stage;

beforeAll(() => {
  stage = new ManagedElement('div', 'stage');
});

beforeEach(() => {
  stage.removeChildren();
});

test('constructor creates ManagedElement', () => {
  const presenter = new Presenter();
  expect(presenter).toBeInstanceOf(ManagedElement);
  expect(presenter.element.tagName).toBe('DIV');
});

test('constructor creates ManagedElement with class name', () => {
  const className = 'myClass';
  const presenter = new Presenter(className);
  expect(presenter).toBeInstanceOf(ManagedElement);
  expect(presenter.element.className).toBe(className);
});

test('presentOnStage displays content on stage', () => {
  const config = {
    titles: ['title1', 'title2'],
    itemClassName: 'test',
    next: (indexIgnored) => null,
  };
  const presenter = new Presenter('test', config);
  expect(stage.children).toHaveLength(0);
  const promise = presenter.presentOnStage(stage);
  expect(stage.children).toHaveLength(1);
  expect(stage.children[0]).toBe(presenter);

  const rootElement = presenter.element;
  expect(rootElement.children).toHaveLength(config.titles.length);
  for (let index = 0; index < rootElement.children.length; index++) {
    const child = rootElement.children.item(index);
    expect(child.tagName).toBe('A');
    expect(child.className).toBe(config.itemClassName);
    expect(child.textContent).toBe(config.titles[index]);
  }

  presenter.handleClickEvent(null, 1); // resolve promise
  return promise;
});

test('presentOnStage displays content with backbutton at end', () => {
  const config = {
    titles: ['title1', 'title2'],
    itemClassName: 'test',
    next: (indexIgnored) => null,
    previous: () => null,
  };
  const presenter = new Presenter('test', config);
  const promise = presenter.presentOnStage(stage);
  const rootElement = presenter.element;
  const backButton = rootElement.lastElementChild;
  expect(backButton.tagName).toBe('A');
  expect(backButton.className).toBe('backNavigation');
  presenter.handleClickEvent(null, 0); // resolve promise
  return promise;
});

test('presentOnStage displays content with no backbutton at end', () => {
  const config = {
    titles: ['title1', 'title2'],
    itemClassName: 'test',
    next: (indexIgnored) => null,
  };
  const presenter = new Presenter('test', config);
  const promise = presenter.presentOnStage(stage);
  expect(presenter.element.lastElementChild.className).toBe('test');
  presenter.handleClickEvent(null, 0); // resolve promise
  return promise;
});

test('presentOnStage fulfils on click of backbutton', () => {
  const presenter = new Presenter('test', {
    titles: [],
    itemClassName: 'item',
    next: (index) => index,
    previous: () => true,
  });
  expect.assertions(1);
  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBe(true);
  });
  console.log(`Class ${presenter.element.lastElementChild.className}`);
  presenter.element.lastElementChild.dispatchEvent(new Event('click'));
  return promise;
});

test('presenter created with listeners on targets', () => {
  const presenter = new Presenter('test', {
    titles: ['target 1', 'target 2', 'target 3'],
    itemClassName: 'item',
    next: (index) => index,
  });
  const childIndex = 1;

  expect.assertions(1);
  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(parseInt(nextPresenter)).toBe(childIndex);
  });

  presenter.element.children[childIndex].dispatchEvent(new Event('click'));
  return promise;
});

test('presentOnStage fulfils on click of target', () => {
  const presenter = new Presenter('test', {
    titles: [],
    itemClassName: 'item',
    next: () => null,
  });
  const target = new ManagedElement('div');
  presenter.appendChild(target);
  const eventId = 1;
  presenter.listenToEventOn('click', target, eventId);
  expect.assertions(1);
  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBeNull();
  });
  target.element.dispatchEvent(new Event('click'));
  return promise;
});

test('presentOnStage calls config next method with eventId', () => {
  expect.assertions(2);
  const triggerEventId = 1;
  const presenter = new Presenter('test', {
    titles: [],
    itemClassName: 'item',
    next: (eventId) => {
      expect(eventId).toBe(triggerEventId);
      return null;
    },
  });
  const target = new ManagedElement('div');
  presenter.appendChild(target);

  presenter.listenToEventOn('click', target, triggerEventId);

  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBeNull();
  });
  target.element.dispatchEvent(new Event('click'));
  return promise;
});

test('presentOnStage fulfils with result of config next function', () => {
  expect.assertions(1);
  const triggerEventId = 21;
  const returnedPresenter = {
    data: '1234',
  };
  const presenter = new Presenter('test', {
    titles: [],
    itemClassName: 'item',
    next: () => {
      return returnedPresenter;
    },
  });
  const target = new ManagedElement('div');
  presenter.appendChild(target);

  presenter.listenToEventOn('click', target, triggerEventId);

  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBe(returnedPresenter);
  });
  target.element.dispatchEvent(new Event('click'));
  return promise;
});
