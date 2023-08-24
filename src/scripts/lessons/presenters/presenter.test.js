/**
 * @file Test for the Presenter
 *
 * @module utils/userIo/presenter.test
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
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { footer } from '../../headerAndFooter.js';

import { jest, test, expect, beforeEach, beforeAll } from '@jest/globals';

class MockPresenter {
  constructor(config) {
    this.config = config;
  }
  next(indexIgnored) {
    return null;
  }
  previous() {
    return null;
  }
}

jest.unstable_mockModule('./presenterFactory.js', () => {
  return {
    presenterFactory: {
      hasNext: jest.fn((callerIgnored) => true),
      hasPrevious: jest.fn((callerIgnored, configIgnored) => true),
      getNext: jest.fn((callerIgnored, config) => new MockPresenter(config)),
      getPrevious: jest.fn(
        (callerIgnored, config) => new MockPresenter(config)
      ),
    },
  };
});

const { presenterFactory } = await import('./presenterFactory.js');

let stage;

beforeAll(() => {
  stage = new ManagedElement('div', 'stage');
  stage.appendTo(document.body);
  const footerElement = document.createElement('div');
  footerElement.id = 'footer';
  document.body.appendChild(footerElement);
  footer.setup();
});

beforeEach(() => {
  stage.removeChildren();
  presenterFactory.hasNext.mockClear();
  presenterFactory.getNext.mockClear();
  presenterFactory.getPrevious.mockClear();
});

test('constructor creates ManagedElement', () => {
  const config = {
    className: 'presenter',
    titles: [],
  };
  const presenter = new Presenter(config);
  expect(presenter).toBeInstanceOf(ManagedElement);
  expect(presenter.tagName).toBe('DIV');
});

test('constructor creates ManagedElement with class name base on interitance', () => {
  const config = {
    className: 'myClass',
    titles: [],
  };
  const presenter = new Presenter(config);
  expect(presenter).toBeInstanceOf(ManagedElement);
  expect(presenter.classList.contains('ManagedElement')).toBe(true);
  expect(presenter.classList.contains('Presenter')).toBe(true);
});

test('presentOnStage creates preamble and presentation elements.', () => {
  const config = {
    className: 'presenter',
    titles: ['title1', 'title2'],
    itemClassName: 'test',
    factory: presenterFactory,
  };
  presenterFactory.hasPrevious.mockReturnValueOnce(false);
  const presenter = new Presenter(config);
  expect(stage.children).toHaveLength(0);
  const promise = presenter.presentOnStage(stage);
  expect(stage.managedChildren).toHaveLength(1);
  expect(stage.managedChildren[0]).toBe(presenter);

  const rootElement = presenter.element;
  expect(rootElement.children).toHaveLength(2);
  expect(rootElement.children.item(0).classList.contains('preamble')).toBe(
    true
  );
  expect(rootElement.children.item(1).classList.contains('presentation')).toBe(
    true
  );

  presenter.handleClickEvent(null, 1); // resolve promise
  return promise;
});

test('presentOnStage displays content with home button at start', () => {
  const config = {
    titles: ['title1', 'title2'],
    itemClassName: 'test',
    factory: presenterFactory,
  };
  const presenter = new Presenter(config);
  const promise = presenter.presentOnStage(stage);
  const homeButton = document.querySelector('.button-bar').firstChild;
  expect(homeButton.tagName).toBe('BUTTON');
  expect(homeButton.classList.contains('home-navigation')).toBe(true);
  presenter.handleClickEvent(null, 0); // resolve promise
  return promise;
});

test('presentOnStage displays content with backbutton at end', () => {
  const config = {
    titles: ['title1', 'title2'],
    itemClassName: 'test',
    factory: presenterFactory,
  };
  const presenter = new Presenter(config);
  const promise = presenter.presentOnStage(stage);
  const backButton = document.querySelector('.button-bar').children.item(1);
  expect(backButton.tagName).toBe('BUTTON');
  expect(backButton.classList.contains('back-navigation')).toBe(true);
  presenter.handleClickEvent(null, 0); // resolve promise
  return promise;
});

test('presentOnStage fulfils on click of backbutton', () => {
  const presenter = new Presenter({
    className: 'presenter',
    titles: [],
    itemClassName: 'item',
    factory: presenterFactory,
  });
  jest.spyOn(presenter, 'next').mockReturnValue(new MockPresenter());
  jest.spyOn(presenter, 'previous').mockReturnValue(new MockPresenter());
  expect.assertions(1);
  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBeInstanceOf(MockPresenter);
  });
  console.log(`Class ${presenter.lastElementChild.className}`);
  document
    .querySelector('.button-bar')
    .lastElementChild.dispatchEvent(new Event('click'));
  return promise;
});

test('presentOnStage calls next method with index if eventId is parses as a number', () => {
  expect.assertions(1);
  const triggerEventId = 99;
  const config = {
    className: 'Presenter',
    titles: ['target 1', 'target 2', 'target 3'],
    itemClassName: 'item',
    factory: presenterFactory,
  };
  const presenter = new Presenter(config);
  const spyNext = jest
    .spyOn(presenter, 'next')
    .mockImplementation((index) => new MockPresenter({ index: index }));

  const target = new ManagedElement('div');
  presenter.appendChild(target);
  presenter.listenToEventOn('click', target, triggerEventId);

  const promise = presenter
    .presentOnStage(stage)
    .then((nextPresenterIgnored) => {
      expect(spyNext).toBeCalledWith(triggerEventId);
    });
  target.dispatchEvent(new Event('click'));
  return promise;
});

test('presentOnStage fulfils with result of next function for numeric ids', () => {
  expect.assertions(2);
  const triggerEventId = 99;
  const config = {
    className: 'Presenter',
    titles: ['target 1', 'target 2', 'target 3'],
    itemClassName: 'item',
    factory: presenterFactory,
  };
  const presenter = new Presenter(config);
  jest
    .spyOn(presenter, 'next')
    .mockImplementation((index) => new MockPresenter({ index: index }));

  const target = new ManagedElement('div');
  presenter.appendChild(target);
  presenter.listenToEventOn('click', target, triggerEventId);

  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBeInstanceOf(MockPresenter);
    expect(nextPresenter.config.index).toBe(triggerEventId);
  });
  target.dispatchEvent(new Event('click'));
  return promise;
});

test('presentOnStage fulfils with result of previous function for id of "BACKWARDS"', () => {
  expect.assertions(2);
  const triggerEventId = 'BACKWARDS';
  const config = {
    className: 'Presenter',
    titles: ['target 1', 'target 2', 'target 3'],
    itemClassName: 'item',
    factory: presenterFactory,
  };
  const presenter = new Presenter(config);
  jest
    .spyOn(presenter, 'next')
    .mockImplementation((index) => new MockPresenter({ index: index }));
  jest.spyOn(presenter, 'previous').mockImplementation(() => {
    console.log('Mock implementation of previous called.');
    return new MockPresenter({ index: 1001 });
  });

  const target = new ManagedElement('div');

  presenter.appendChild(target);
  presenter.listenToEventOn('click', target, triggerEventId);

  const promise = presenter.presentOnStage(stage).then((nextPresenter) => {
    expect(nextPresenter).toBeInstanceOf(MockPresenter);
    expect(nextPresenter.config.index).toBe(1001);
  });

  target.dispatchEvent(new Event('click'));
  return promise;
});
