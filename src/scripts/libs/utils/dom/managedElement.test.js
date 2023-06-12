/**
 * @file test code for element
 *
 * @module libs/utils/dom/element.test
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

import { ManagedElement } from './managedElement.js';
import { expect, test, jest, beforeEach } from '@jest/globals';

beforeEach(() => {
  document.body.innerHTML = `
  <div id="div1">
  </div>
  <div id="div2">
  </div>`;
});

test('creates element', () => {
  const tag = 'div';
  const me = new ManagedElement(tag);
  expect(me.element).toBeInstanceOf(Element);
  expect(me.element.tagName).toEqual(tag.toUpperCase());
});

test('sets class name', () => {
  const tag = 'div';
  const className = 'myclass';
  const me = new ManagedElement(tag, className);
  expect(me.element.className).toEqual(className);
});

test('appends ManagedElement to itself', () => {
  const tag = 'div';
  const tagChild = 'p';
  const me = new ManagedElement(tag);
  const meChild = new ManagedElement(tagChild);
  me.appendChild(meChild);
  expect(me.element.children).toHaveLength(1);
  expect(meChild.element.children).toHaveLength(0);
  expect(me.element.children[0].tagName).toEqual(tagChild.toUpperCase());
});

test('appends itself to another', () => {
  const tag = 'span';
  const parentElement = document.createElement('div');
  document.body.appendChild(parentElement);

  const me = new ManagedElement(tag);
  me.appendTo(parentElement);
  expect(me.element.children).toHaveLength(0);
  expect(parentElement.children).toHaveLength(1);
  expect(parentElement.children[0].tagName).toEqual(tag.toUpperCase());
});

test('appends ManagedElement to another', () => {
  const tag = 'div';
  const tagChild = 'p';
  const peerElement = document.createElement('span');
  document.body.appendChild(peerElement);

  const me = new ManagedElement(tag);
  const meChild = new ManagedElement(tagChild);
  me.appendChildTo(meChild, peerElement);
  expect(me.element.children).toHaveLength(0);
  expect(meChild.element.children).toHaveLength(0);
  expect(peerElement.children).toHaveLength(1);
  expect(peerElement.children[0].tagName).toEqual(tagChild.toUpperCase());
});

test('appends ManagedElement to another', () => {
  const tag = 'div';
  const tagChild = 'p';
  const peerElement = document.createElement('span');
  document.body.appendChild(peerElement);

  const me = new ManagedElement(tag);
  const meChild = new ManagedElement(tagChild);
  me.appendChildTo(meChild, peerElement);
  expect(me.element.children).toHaveLength(0);
  expect(meChild.element.children).toHaveLength(0);
  expect(peerElement.children).toHaveLength(1);
  expect(peerElement.children[0].tagName).toEqual(tagChild.toUpperCase());
});

test('add listener to itself results in call to handleEvent', () => {
  const tag = 'div';
  const me = new ManagedElement(tag);
  const spy = jest.spyOn(me, 'handleEvent');
  me.listenToOwnEvent('click');
  me.element.dispatchEvent(new Event('click'));
  expect(spy.mock.calls).toHaveLength(1);
  expect(spy.mock.calls[0][0].type).toEqual('click');
});

test('add listener to another in call to handleEvent', () => {
  const tag = 'div';
  const peerTag = 'span';
  const me = new ManagedElement(tag);
  const peer = new ManagedElement(peerTag);
  const spy = jest.spyOn(me, 'handleEvent');
  me.listenToEventOn('click', peer);
  peer.element.dispatchEvent(new Event('click'));
  expect(spy.mock.calls).toHaveLength(1);
  expect(spy.mock.calls[0][0].type).toEqual('click');
});

test('call handler for own event with event and eventId', () => {
  const tag = 'span';
  const me = new ManagedElement(tag);
  const eventType = 'action';
  const eventId = 'myevent';
  const handlerName = 'handleActionEvent';
  me[handlerName] = jest.fn();
  me.listenToOwnEvent(eventType, eventId);
  me.element.dispatchEvent(new Event(eventType));
  expect(me[handlerName].mock.calls).toHaveLength(1);
  expect(me[handlerName].mock.calls[0][0].type).toEqual('action');
  expect(me[handlerName].mock.calls[0][1]).toEqual(eventId);
});

test("call handler for different element's event with event and eventId", () => {
  const tag = 'span';
  const peerTag = 'div';
  const me = new ManagedElement(tag);
  const peer = new ManagedElement(peerTag);
  const eventType = 'action';
  const eventId = 'myevent';
  const handlerName = 'handleActionEvent';
  me[handlerName] = jest.fn();
  me.listenToEventOn(eventType, peer, eventId);
  peer.element.dispatchEvent(new Event(eventType));
  expect(me[handlerName].mock.calls).toHaveLength(1);
  expect(me[handlerName].mock.calls[0][0].type).toEqual('action');
  expect(me[handlerName].mock.calls[0][1]).toEqual(eventId);
});

test('call handler with eventId set even when delegated', () => {
  const tag = 'span';
  const peerTag = 'div';
  const peerChildTag = 'p';
  const me = new ManagedElement(tag);
  const peer = new ManagedElement(peerTag);
  const peerChild = new ManagedElement(peerChildTag);

  const eventType = 'action';
  const eventId = 'myevent';
  const handlerName = 'handleActionEvent';
  me[handlerName] = jest.fn();
  document.body.appendChild(me.element);
  document.body.appendChild(peer.element);
  peer.appendChild(peerChild);
  me.listenToEventOn(eventType, peer, eventId);
  peerChild.element.dispatchEvent(new Event(eventType, { bubbles: true }));
  expect(me[handlerName].mock.calls).toHaveLength(1);
  expect(me[handlerName].mock.calls[0][0].type).toEqual('action');
  expect(me[handlerName].mock.calls[0][1]).toEqual(eventId);
});

test('Remove calls remove on all children', () => {
  const parent = new ManagedElement('div', 'parent');
  const children = [];
  const spies = [];
  for (let n = 0; n < 5; n++) {
    const child = new ManagedElement('div', `child${n}`);
    children.push(child);
    parent.appendChild(child);
    spies.push(jest.spyOn(child, 'remove'));
  }
  document.body.appendChild(parent.element);
  for (let n = 0; n < children.length; n++) {
    expect(document.querySelector(`.child${1}`)).toBeInstanceOf(Element);
  }
  expect(document.querySelector(`.parent`)).toBeInstanceOf(Element);
  parent.remove();
  for (let n = 0; n < 5; n++) {
    expect(document.querySelector(`.child${1}`)).toBeNull();
    expect(spies[n]).toBeCalledTimes(1);
  }
  expect(document.querySelector(`.parent`)).toBeNull();
});

test('Remove removes all listeners', () => {
  const parent = new ManagedElement('div', 'parent');
  const spies = [];
  for (let n = 0; n < 5; n++) {
    const child = new ManagedElement('div', `child${n}`);
    parent.listenToEventOn(`someevent${n}`, child);
    spies.push(jest.spyOn(child.element, 'removeEventListener'));
  }
  parent.remove();
  for (let n = 0; n < 5; n++) {
    expect(spies[n]).toBeCalledTimes(1);
    expect(spies[n]).toHaveBeenCalledWith(`someevent${n}`, parent);
  }
});

test('Remove removes child from existing element but leaves element', () => {
  const parent = new ManagedElement('div', 'parent');
  const existing = document.getElementById('div1');
  const child = new ManagedElement('div', 'child');
  parent.appendChildTo(child, existing);
  const spy = jest.spyOn(child, 'remove');
  document.body.appendChild(parent.element);

  expect(document.querySelector('.parent')).toBeInstanceOf(Element);
  expect(document.querySelector('.child')).toBeInstanceOf(Element);
  expect(document.getElementById('div1')).toBeInstanceOf(Element);

  parent.remove();

  expect(spy).toBeCalledTimes(1);
  expect(document.querySelector('.parent')).toBeNull();
  expect(document.querySelector('.child')).toBeNull();
  expect(document.getElementById('div1')).toBeInstanceOf(Element);
});

test('Getter for element accesses underlying element', () => {
  const className = 'testClass';
  const testId = 'testId';
  const me = new ManagedElement('div', className);
  document.body.appendChild(me.element);
  me.element.id = testId;
  expect(me.element).toBe(document.getElementById(testId));
});

test('Getter for id accesses underlying element', () => {
  const className = 'testClass';
  const testId = 'testId';
  const me = new ManagedElement('div', className);
  document.body.appendChild(me.element);
  me.element.id = testId;
  expect(me.id).toBe(testId);
});

test('Setter for id accesses underlying element', () => {
  const className = 'testClass';
  const testId = 'testId';
  const me = new ManagedElement('div', className);
  document.body.appendChild(me.element);
  me.id = testId;
  expect(me.element.id).toBe(testId);
});
