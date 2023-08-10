/**
 * @file Simple managed element. This simplifies clean up of elements and
 * attached listeners.
 *
 * @module utils/userIo/managedElement
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

import * as base64 from '../text/base64.js';

/**
 * ManagedElement class. This wraps a DOM element which is accessible via the
 * element property. The remove method unregisters any listners and calls remove
 * on all children. It also removes itself from the DOM if it created the element
 * itself. If it was passed an existing element, this is left in the DOM.
 * @classnp
 */
export class ManagedElement {
  /**
   * Underlying element.
   * @type {Element}
   */
  #element;

  /**
   * Targets which the element is listening to.
   * @type {ManagedElement[]}
   */
  #listeningTargets;

  /**
   * Children
   * @type {ManagedElement[]}
   */
  #children;

  /**
   * Flag whether the underlying element should be removed from the DOM on calls
   * to `remove`.
   * @type {boolean}
   */
  #elementRemovable;

  /**
   * Create a managed element.If passed a tag, a new element is created. If
   * passed an Element, the element is assumed to already exist.
   * @param {string | Element} tagOrElement
   * @param {string} className
   */
  constructor(tagOrElement, className) {
    if (tagOrElement instanceof Element) {
      this.#element = tagOrElement;
      this.#elementRemovable = false;
    } else {
      this.#element = document.createElement(tagOrElement);
      this.#elementRemovable = true;
    }
    if (className) {
      this.#element.className = className;
    }
    this.#listeningTargets = [];
    this.#children = [];
  }

  /**
   * Get the id of the underlying element.
   * @return {string}
   */
  get id() {
    return this.#element.id;
  }

  /**
   * Set the id of the underlying element.
   * @param {string} value
   */
  set id(value) {
    this.#element.id = value;
  }

  /**
   * Get the underlying element
   * @returns {Element}
   */
  get element() {
    return this.#element;
  }

  /**
   * Get the children
   * @returns {ManagedElement[]}
   */
  get children() {
    return this.#children;
  }

  /**
   * @returns {string} the inner element's html.
   */
  get innerHTML() {
    return this.#element.innerHTML;
  }

  /**
   * Sets the inner element's html.
   * @param {string} data - the content.
   */
  set innerHTML(data) {
    this.#element.innerHTML = data;
  }

  /**
   * @returns {string} the inner element's textContent
   */
  get textContent() {
    return this.#element.textContent;
  }

  /**
   * Set the inner element's textContent.
   * @param {string} data - content
   */
  set textContent(data) {
    this.#element.textContent = data;
  }

  /**
   * Get the inner element's classList
   */
  get classList() {
    return this.#element.classList;
  }

   /**
   * Get the inner element's className
   */
   get className() {
    return this.#element.className;
  }

  /**
   * Set the inner element's className
   */
  set className(value) {
    this.#element.className = value;
  }

  /**
   * Hide the element
   */
  hide() {
    this.#element.style.display = 'none';
  }

  /**
   * Fade out the element. This is done by applying the fade-out class and removing
   * the fade-in class.
   */
  fadeOut() {
    this.#element.classList.remove('fade-in');
    this.#element.classList.add('fade-out');
  }

  /**
   * Fade in the element. This is done by applying the fade-in class and removing
   * the fade-out class.
   */
  fadeIn() {
    this.#element.classList.remove('fade-out');
    this.#element.classList.add('fade-in');
  }

  /**
   * Show or unhide the element
   */
  show() {
    this.#element.style.display = 'unset';
  }

  /**
   * Append child. These are removed when this is removed.
   * @param {module:utils/userIo/managedElement.ManagedElement} managedElement
   * @param {string | number} childId - id for child/
   * @returns {module:utils/userIo/managedElement.ManagedElement} element as received to allow chaining
   */
  appendChild(managedElement) {
    this.#element.appendChild(managedElement.element);
    this.#children.push(managedElement);
    return managedElement;
  }

  /**
   * Append child. These are removed when this is removed.
   * @param {module:utils/userIo/managedElement.ManagedElement} managedElement
   * @param {string | number} childId - id for child/
   * @returns {module:utils/userIo/managedElement.ManagedElement | Element} element as received to allow chaining
   */
  insertChildAtTop(managedElement) {
    this.#element.insertBefore(
      managedElement.element ?? managedElement,
      this.#element.firstChild
    );
    this.#children.push(managedElement);
    return managedElement;
  }

  /**
   * Add an element to another existing DOM element. The child is added to a list of
   * elements that are removed when this element is removed. The parent, as it
   * is prexisting, is not touched on removal.
   * @param {module:utils/userIo/managedElement.ManagedElement | Element} managedElement
   * @param {Element} parent - parent to which the element is added.
   */
  appendChildTo(managedElement, parent) {
    parent.appendChild(managedElement.element ?? managedElement);
    this.#children.push(managedElement);
  }

  /**
   * Add this element to another existing DOM element.
   * @param {Element} parent - parent to which the element is added.
   */
  appendTo(parent) {
    parent.appendChild(this.#element);
  }

  /**
   * Add event listener to own element.
   * This is just a convenience method that calls listenToEventOn(eventType, this, eventId);
   * @param {string} eventType - type of event.
   * @param {string | number | function} eventIdOrHandler - if a string or number
   * is provide, this is the id that will be returned to event handlers.
   * This is done by adding a data-event-id attribute to the element. If it is
   * a function, then that function will be called.
   */
  listenToOwnEvent(eventType, eventIdOrHandler) {
    this.listenToEventOn(eventType, this, eventIdOrHandler);
  }
  /**
   * Add event listener to the target element.
   * This just adds an event listener for which this is the handler.
   * When this element is removed, any listeners are also removed.
   * @param {string} eventType
   * @param {module:utils/userIo/managedElement.ManagedElement} target
   * @param {string | number | function} eventIdOrHandler - if a string or number
   * is provide, this is the id that will be returned to event handlers.
   * This is done by adding a data-event-id attribute to the element. If it is
   * a function, then that function will be called.
   */
  listenToEventOn(eventType, target, eventIdOrHandler) {
    if (!(target instanceof ManagedElement)) {
      throw new Error('Expect ManagedElement');
    }

    this.#listeningTargets.push({
      managedElement: target,
      eventType: eventType,
    });

    if (eventIdOrHandler instanceof Function) {
      target.element.addEventListener(eventType, eventIdOrHandler);
    } else {
      if (eventIdOrHandler !== null && eventIdOrHandler !== undefined) {
        target.element.setAttribute('data-event-id', eventIdOrHandler);
      }
      target.element.addEventListener(eventType, this);
    }
  }

  /**
   * Handle event for which this object has been registered as a listener.
   * @param {Event} event
   */
  handleEvent(event) {
    console.debug(
      `Event ${event.type} fired on <${event.currentTarget.tagName}>: class ${event.target.className}.`
    );

    const handlerName =
      'handle' +
      event.type.charAt(0).toUpperCase() +
      event.type.substring(1) +
      'Event';
    const eventId = event.currentTarget.getAttribute('data-event-id');
    this[handlerName]?.(event, eventId);
  }

  /**
   * Remove the element from the DOM if it was created from a tag passed to the
   * constructor. If an existing element was passed in, the element is not removed.
   * In all cases, all children and listeners are removed.
   */
  remove() {
    this.#listeningTargets.forEach((target) => {
      const element = target.managedElement.element;
      element.removeEventListener(target.eventType, this);
    });
    this.#listeningTargets = [];
    this.removeChildren();
    if (this.#elementRemovable) {
      this.#element.remove();
    }
  }

  /**
   * Remove children only.
   * This calls replaceChildren on the element after removing any managed
   * elements to ensure the anything added via a direct call to the element's
   * innerHTML is also removed.
   */
  removeChildren() {
    this.#children.forEach((child) => {
      child.remove();
    });
    this.#children = [];
    this.#element.replaceChildren();
  }

  /**
   * Encode a value to make it safe for attributes.
   * @param {*} value
   */
  static encodeString(value) {
    return base64.stringToBase64(value);
  }

  /** Decode a value that was previously encoded.
   * @param {string} value encoded value;
   * @returns {string} the decoded value
   */
  static decodeString(value) {
    return base64.base64ToString(value);
  }
  /**
   * Sets an attribute on the element. The value is encoded to ensure it cannot
   * corrupt any html and to prevent script injection.
   * @param {string} name
   * @param {string} value
   */
  setSafeAttribute(name, value) {
    this.#element.setAttribute(name, ManagedElement.encodeString(value));
  }

  /**
   * Gets an attribute previous set by setSafeAttribute.
   * @param {string} name
   * @returns {string}
   */
  getSafeAttribute(name) {
    return ManagedElement.decodeString(this.#element.getAttribute(name));
  }

  /**
   * Set attributes on the element. These are not encoded and the method is
   * typically used for adding aria elements.
   * If an item's value is null, undefined or an empty string, it is ignored.
   * @param {Object.<string, string>} attributes
   */
  setAttributes(attributes) {
    for (const key in attributes) {
      const value = attributes[key];
      if (value != null && value != undefined && value !== '') {
        this.#element.setAttribute(key, value);
      }
    }
  }

  /**
   * Set attribute on the element. These are not encoded and the method is
   * typically used for adding aria elements.
   * If an item's value is null, undefined or an empty string, it is ignored.
   * @param {string} name - name
   * @param {string} value - value
   */
  setAttribute(name, value) {
    this.#element.setAttribute(name, value);
  }

  /**
   * Give focus to the element
   */
  focus() {
    this.#element.focus();
  }

 
  /**
   * Gets an attribute previous set by setSafeAttribute.
   * Unlike the instance method, this retrieves it from a Element. This
   * is normally used when handling DOM events where the ManagedElement is not
   * available.
   * @param {Element} element
   * @param {string} name
   * @returns {string}
   */
  static getSafeAttribute(element, name) {
    return ManagedElement.decodeString(element.getAttribute(name));
  }

  /**
   * Get the underlying element from either a ManagedElement or Element
    @param {Element | module:utils/userIo/managedElement.ManagedElement} item - the Element or ManagedElement
   */
  static getElement(item) {
    return item.element ?? item;
  }
}
