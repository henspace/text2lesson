/**
 * @file test code for element
 *
 * @module utils/dom/element.test
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
  expect(me.tagName).toEqual(tag.toUpperCase());
});

test('$ provides access to underlying element', () => {
  const me = new ManagedElement('div', 'test-class');
  me.appendTo(document.body);
  const htmlElement = document.querySelector('.test-class');
  expect(me.$).toBe(htmlElement);
});

test('Static $ provides access to underlying element of a ManagedElement', () => {
  const me = new ManagedElement('div', 'test-class');
  me.appendTo(document.body);
  const htmlElement = document.querySelector('.test-class');
  expect(ManagedElement.$(me)).toBe(htmlElement);
});

test('Static $ just returns element if passed an Element instead of a ManagedElement', () => {
  const htmlElement = document.createElement('div');
  expect(ManagedElement.$(htmlElement)).toBe(htmlElement);
});

test('Static getElement provides access to underlying element of a ManagedElement', () => {
  const me = new ManagedElement('div', 'test-class');
  me.appendTo(document.body);
  const htmlElement = document.querySelector('.test-class');
  expect(ManagedElement.getElement(me)).toBe(htmlElement);
});

test('Static getElement just returns element if passed an Element instead of a ManagedElement', () => {
  const htmlElement = document.createElement('div');
  expect(ManagedElement.getElement(htmlElement)).toBe(htmlElement);
});

test('Getter for element provides access to underlying element', () => {
  const me = new ManagedElement('div', 'test-class');
  me.appendTo(document.body);
  const htmlElement = document.querySelector('.test-class');
  expect(me.element).toBe(htmlElement);
});

test('sets class name', () => {
  const tag = 'div';
  const className = 'myclass';
  const me = new ManagedElement(tag, className);
  expect(me.className).toEqual(className);
});

test('appends ManagedElement to itself', () => {
  const tag = 'div';
  const tagChild = 'p';
  const me = new ManagedElement(tag);
  const meChild = new ManagedElement(tagChild);
  me.appendChild(meChild);
  expect(me.managedChildren).toHaveLength(1);
  expect(me.$.children).toHaveLength(1);
  expect(meChild.managedChildren).toHaveLength(0);
  expect(meChild.$.children).toHaveLength(0);
  expect(me.$.children.item(0).tagName).toEqual(tagChild.toUpperCase());
});

test('appends itself to another', () => {
  const tag = 'span';
  const parentElement = document.createElement('div');
  document.body.appendChild(parentElement);

  const me = new ManagedElement(tag);
  me.appendTo(parentElement);
  expect(me.managedChildren).toHaveLength(0);
  expect(me.$.children).toHaveLength(0);
  expect(parentElement.children).toHaveLength(1);
  expect(parentElement.children.item(0).tagName).toEqual(tag.toUpperCase());
});

test('appends ManagedElement to another', () => {
  const tag = 'div';
  const tagChild = 'p';
  const peerElement = document.createElement('span');
  document.body.appendChild(peerElement);

  const me = new ManagedElement(tag);
  const meChild = new ManagedElement(tagChild);
  me.appendChildTo(meChild, peerElement);
  expect(me.managedChildren).toHaveLength(1);
  expect(me.$.children).toHaveLength(0);
  expect(meChild.managedChildren).toHaveLength(0);
  expect(meChild.$.children).toHaveLength(0);
  expect(peerElement.children).toHaveLength(1);
  expect(peerElement.children.item(0).tagName).toEqual(tagChild.toUpperCase());
});

test('add listener to itself results in call to handleEvent', () => {
  const tag = 'div';
  const me = new ManagedElement(tag);
  const spy = jest.spyOn(me, 'handleEvent');
  me.listenToOwnEvent('click');
  me.dispatchEvent(new Event('click'));
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
  me.dispatchEvent(new Event('click'));
  me.dispatchEvent(new Event('click'));
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
  peer.dispatchEvent(new Event('click'));
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
  me.dispatchEvent(new Event(eventType));
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
  peer.dispatchEvent(new Event(eventType));
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
  peerChild.dispatchEvent(new Event(eventType, { bubbles: true }));
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
    expect(spies[n]).toHaveBeenCalledWith(`someevent${n}`, parent, undefined);
  }
});

test('Remove removes all listeners providing option as well', () => {
  const parent = new ManagedElement('div', 'parent');
  const useCapture = true;
  const spies = [];
  for (let n = 0; n < 5; n++) {
    const child = new ManagedElement('div', `child${n}`);
    parent.listenToEventOn(`someevent${n}`, child, 'someId', useCapture);
    spies.push(jest.spyOn(child.element, 'removeEventListener'));
  }
  parent.remove();
  for (let n = 0; n < 5; n++) {
    expect(spies[n]).toBeCalledTimes(1);
    expect(spies[n]).toHaveBeenCalledWith(`someevent${n}`, parent, useCapture);
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
    expect(spies[n]).toHaveBeenCalledWith(`someevent${n}`, parent, undefined);
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
  me.$.id = testId;
  expect(me.element).toBe(document.getElementById(testId));
});

test('Getter for id accesses underlying element', () => {
  const className = 'testClass';
  const testId = 'testId';
  const me = new ManagedElement('div', className);
  document.body.appendChild(me.element);
  me.$.id = testId;
  expect(me.id).toBe(testId);
});

test('Setter for id accesses underlying element', () => {
  const className = 'testClass';
  const testId = 'testId';
  const me = new ManagedElement('div', className);
  document.body.appendChild(me.element);
  me.id = testId;
  expect(me.$.id).toBe(testId);
});

test('Getter for managed children provides array of added children', () => {
  const me = new ManagedElement('div');
  const children = [];
  const N_CHILDREN = 4;
  for (let n = 0; n < N_CHILDREN; n++) {
    const child = new ManagedElement('div');
    child.id = `ID${n}`;
    children.push(child);
    me.appendChild(child);
  }

  expect(me.managedChildren.length).toBe(N_CHILDREN);
  me.managedChildren.forEach((value, index) => {
    expect(value.id).toBe(`ID${index}`);
  });
});

test("Getter for children provides the underlying element's html collection", () => {
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
  expect(me.children).toBe(me.element.children);
});

test('setSafeAttribute encodes attribute in base64', () => {
  const id = 'testElement';
  const me = new ManagedElement('div');
  document.body.appendChild(me.element);
  me.$.id = id;
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

test('static encodeString and decodeString use base64 and work in harmony', () => {
  const testString = 'this is a test';
  const expectedEncoding = base64.stringToBase64(testString);
  expect(ManagedElement.encodeString(testString)).toBe(expectedEncoding);
  expect(ManagedElement.decodeString(expectedEncoding)).toBe(testString);
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
  expect(me.$.classList.contains('fade-out')).toBe(true);
  me.fadeIn();
  expect(me.$.classList.contains('fade-out')).toBe(false);
  expect(me.$.classList.contains('fade-in')).toBe(true);
});

test('fadeOut adds fade-out class and removes fade-in class', () => {
  const me = new ManagedElement('div', 'fade-in');
  expect(me.$.classList.contains('fade-in')).toBe(true);
  me.fadeOut();
  expect(me.$.classList.contains('fade-in')).toBe(false);
  expect(me.$.classList.contains('fade-out')).toBe(true);
});

test("classList accesses element's class list", () => {
  const me = new ManagedElement('div', 'test');
  me.id = 'test';
  document.body.append(me.element);
  expect(me.classList).toStrictEqual(document.getElementById('test').classList);
});

test('setAttributes sets attributes on element but ignores empty values', () => {
  const me = new ManagedElement('div', 'test');
  me.id = 'test';
  document.body.append(me.element);
  const domElement = document.getElementById('test');
  const testAttributes = {
    'data-one': 'one',
    'data-two': 'two',
    'data-three': '',
  };
  me.setAttributes(testAttributes);
  for (const key in testAttributes) {
    if (testAttributes[key]) {
      expect(domElement.getAttribute(key)).toBe(testAttributes[key]);
    } else {
      expect(domElement.getAttribute(key)).toBeNull();
    }
  }
});
