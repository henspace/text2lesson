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
import * as base64 from '../text/base64.js';

beforeEach(() => {
  document.body.innerHTML = '';
  let div = document.createElement('div');
  div.id = 'div1';
  document.body.appendChild(div);
  div = document.createElement('div');
  div.id = 'div2';
  document.body.appendChild(div);
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

test('add listener to itself with handler function results in call to handler function', () => {
  const tag = 'div';
  const me = new ManagedElement(tag);
  const spy = jest.spyOn(me, 'handleEvent');
  let clickCount = 0;
  me.listenToOwnEvent('click', () => {
    clickCount++;
  });
  me.element.dispatchEvent(new Event('click'));
  me.element.dispatchEvent(new Event('click'));
  expect(spy.mock.calls).toHaveLength(0);
  expect(clickCount).toEqual(2);
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

test('Remove removes all listeners even if provided with handlers', () => {
  const parent = new ManagedElement('div', 'parent');
  const spies = [];
  for (let n = 0; n < 5; n++) {
    const child = new ManagedElement('div', `child${n}`);
    parent.listenToEventOn(`someevent${n}`, child, () => {
      console.log('click');
    });
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

test('Getter for children provides array of added children', () => {
  const me = new ManagedElement('div');
  const children = [];
  const N_CHILDREN = 4;
  for (let n = 0; n < N_CHILDREN; n++) {
    const child = new ManagedElement('div');
    child.id = `ID${n}`;
    children.push(child);
    me.appendChild(child);
  }

  expect(me.children.length).toBe(N_CHILDREN);
  me.children.forEach((value, index) => {
    expect(value.id).toBe(`ID${index}`);
  });
});

test('setSafeAttribute encodes attribute in base64', () => {
  const id = 'testElement';
  const me = new ManagedElement('div');
  document.body.appendChild(me.element);
  me.element.id = id;
  const attributeName = 'data-test';
  const attributeValue = 'a test value';
  me.setSafeAttribute(attributeName, attributeValue);
  expect(document.getElementById(id).getAttribute(attributeName)).toEqual(
    base64.stringToBase64(attributeValue)
  );
});

test('getSafeAttribute decodes attribute set in base64', () => {
  const id = 'testElement';
  const me = new ManagedElement('div');
  document.body.appendChild(me.element);
  me.id = id;
  const domElement = document.getElementById(id);
  expect(domElement).toBe(me.element);
  const attributeName = 'data-test';
  const attributeValue = 'a test value';
  domElement.setAttribute(attributeName, base64.stringToBase64(attributeValue));
  expect(me.getSafeAttribute(attributeName)).toEqual(attributeValue);
});

test('static getSafeAttribute decodes attribute set in base64', () => {
  const id = 'testElement';
  const element = document.createElement('div');
  document.body.appendChild(element);
  element.id = id;
  const attributeName = 'data-test';
  const attributeValue = 'a test value';
  element.setAttribute(attributeName, base64.stringToBase64(attributeValue));
  expect(ManagedElement.getSafeAttribute(element, attributeName)).toEqual(
    attributeValue
  );
});

test('setting innerHTML property accesses underlying element', () => {
  const me = new ManagedElement('div', 'test');
  const id = 'testEd';
  me.id = id;
  me.appendTo(document.body);
  const element = document.getElementById(id);
  const testString = '<p>Testing</p>';
  me.innerHTML = testString;
  expect(element.innerHTML).toBe(testString);
});

test('getting innerHTML property accesses underlying element', () => {
  const me = new ManagedElement('div', 'test');
  const id = 'testEd';
  me.id = id;
  me.appendTo(document.body);
  const element = document.getElementById(id);
  const testString = '<p>Testing</p>';
  element.innerHTML = testString;
  expect(me.innerHTML).toBe(testString);
});

test('setting textContent property accesses underlying element', () => {
  const me = new ManagedElement('div', 'test');
  const id = 'testEd';
  me.id = id;
  me.appendTo(document.body);
  const element = document.getElementById(id);
  const testString = '<p>Testing</p>';
  me.textContent = testString;
  expect(element.textContent).toBe(testString);
});

test('getting textContent property accesses underlying element', () => {
  const me = new ManagedElement('div', 'test');
  const id = 'testEd';
  me.id = id;
  me.appendTo(document.body);
  const element = document.getElementById(id);
  const testString = '<p>Testing</p>';
  element.textContent = testString;
  expect(me.textContent).toBe(testString);
});

test('hide element sets display property to none', () => {
  const me = new ManagedElement('div', 'test');
  me.id = 'test';
  me.appendTo(document.body);
  document.getElementById('test').style.display = 'block';
  me.hide();
  expect(document.getElementById('test').style.display).toBe('none');
});

test('show element sets display property to unset', () => {
  const me = new ManagedElement('div', 'test');
  me.id = 'test';
  me.appendTo(document.body);
  document.getElementById('test').style.display = 'none';
  me.show();
  expect(document.getElementById('test').style.display).toBe('unset');
});

test('fadeIn adds fade-in class and removes fade-out class', () => {
  const me = new ManagedElement('div', 'fade-out');
  expect(me.element.classList.contains('fade-out')).toBe(true);
  me.fadeIn();
  expect(me.element.classList.contains('fade-out')).toBe(false);
  expect(me.element.classList.contains('fade-in')).toBe(true);
});

test('fadeOut adds fade-out class and removes fade-in class', () => {
  const me = new ManagedElement('div', 'fade-in');
  expect(me.element.classList.contains('fade-in')).toBe(true);
  me.fadeOut();
  expect(me.element.classList.contains('fade-in')).toBe(false);
  expect(me.element.classList.contains('fade-out')).toBe(true);
});

test("classList accesses element's class list", () => {
  const me = new ManagedElement('div', 'test');
  me.id = 'test';
  document.body.append(me.element);
  expect(me.classList).toStrictEqual(document.getElementById('test').classList);
});
