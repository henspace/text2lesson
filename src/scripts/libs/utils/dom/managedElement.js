/**
 * @file Simple managed element. This simplifies clean up of elements and
 * attached listeners.
 *
 * @module libs/utils/dom/elements
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

/**
 * ManagedElement class. This wraps a DOM element which is accessible via the
 * element property. The remove method unregisters any listners and calls remove
 * on all children. It also removes itself from the DOM if it created the element
 * itself. If it was passed an existing element, this is left in the DOM.
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
   * Append child. These are removed when this is removed.
   * @param {ManagedElement} managedElement
   * @param {string | number} childId - id for child/
   * @returns {ManagedElement} element as received to allow chaining
   */
  appendChild(managedElement) {
    this.#element.appendChild(managedElement.element);
    this.#children.push(managedElement);
    return managedElement;
  }

  /**
   * Add an element to another existing DOM element. The child is added to a list of
   * elements that are removed when this element is removed. The parent, as it
   * is prexisting, is not touched on removal.
   * @param {ManagedElement} managedElement
   * @param {Element} parent - parent to which the element is added.
   */
  appendChildTo(managedElement, parent) {
    parent.appendChild(managedElement.element);
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
   * @param {string | number} eventId - id that will be returned to event handlers/
   * This is done by adding a data-event-id attribute to the element.
   */
  listenToOwnEvent(eventType, eventId) {
    this.listenToEventOn(eventType, this, eventId);
  }
  /**
   * Add event listener to the target element.
   * This just adds an event listener for which this is the handler.
   * When this element is removed, any listeners are also removed.
   * @param {string} eventType
   * @param {ManagedElement} target
   * @param {string | number} eventId - id that will be returned to event handlers/
   * This is done by adding a data-event-id attribute to the element.
   */
  listenToEventOn(eventType, target, eventId) {
    if (!(target instanceof ManagedElement)) {
      throw new Error('Expect ManagedElement');
    }
    this.#listeningTargets.push({
      managedElement: target,
      eventType: eventType,
    });
    target.element.setAttribute('data-event-id', eventId);
    target.element.addEventListener(eventType, this);
  }

  /**
   * Handle event for which this object has been registered as a listener.
   * @param {Event} event
   */
  handleEvent(event) {
    console.log(
      `${event.type} fired on ${event.currentTarget.tagName}. Class ${event.target.className}.`
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

  /** Remove children only. */
  removeChildren() {
    this.#children.forEach((child) => {
      child.remove();
    });
    this.#children = [];
  }
}
