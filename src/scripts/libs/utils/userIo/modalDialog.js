/**
 * @file Simple popup dialog.
 *
 * @module libs/utils/dialog/modalDialog
 *
 * @license GPL-3.0-or-later
 * Lesson RunnerCreate quizzes and lessons from plain text files.
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

import { i18n } from '../i18n/i18n.js';
import { ManagedElement } from '../dom/managedElement.js';
import { showModalMask, hideModalMask } from './modalMask.js';
import * as icons from '../../../data/icons.js';

/**
 * Enum for different dialogs
 * @readonly
 * @enum {string}
 */
export const DialogType = {
  ERROR: 'error',
  FATAL: 'fatal',
  INFO: 'info',
  QUESTION: 'question',
  SETTINGS: 'settings',
};

/**
 * Store timer used for hiding dialog.
 */
let dialogHideTimeout;

/**
 * @typedef {Object} DialogDefinition
 * @property {string} title
 * @property {string} content
 * @property {DialogType} dialogType
 * @property {string[]} iconClasses - array of classes that are applied to the icon
 * @property {string[]} buttons - array of labels for buttons. These normally
 * only apply to questions.
 */

/**
 * Get the appropriate FontAwesome classes for dialogType
 * @param {DialogType} dialogType
 * @returns {string[]} array of FontAwesome class names.
 */
function getFaClassForType(dialogType) {
  switch (dialogType) {
    case DialogType.ERROR:
      return ['fa-solid', 'fa-triangle-exclamation'];
    case DialogType.FATAL:
      return ['fa-solid', 'fa-skull-crossbones'];
    case DialogType.QUESTION:
      return ['fa-solid', 'fa-circle-question'];
    case DialogType.SETTINGS:
      return ['fa-solid', 'fa-gear'];
    case DialogType.INFO:
    default:
      return ['fa-solid', 'fa-circle-info'];
  }
}

/**
 * Managed button.
 */
class BarButton extends ManagedElement {
  /**
   * Button
   * @param {string | {content: string, label: string}} detail - if just a string
   * it is assumed to hold a string that is suitable for accessibility.
   * @param {string} detail.content the text to display
   * @param {string} detail.accessibleName text for accessibility
   */
  constructor(detail) {
    super('button');
    this.element.innerHTML = detail.content ?? detail;
    if (detail.accessibleName) {
      this.element.innerHTML += ` ${detail.accessibleName}`;
      this.element.setAttribute('aria-label', detail.accessibleName);
      this.element.setAttribute('title', detail.accessibleName);
    }
  }
}

/**
 * Button bar. This is a managed element so when it is removed, its children
 * and any attached listeners are also removed.
 */
class ButtonBar extends ManagedElement {
  constructor() {
    const buttonBar = document.querySelector('#utils-dialog .utils-button-bar');
    super(buttonBar);
  }
  /**
   * Add buttons to the button bar. If there are no buttons, an OK button is
   * automatically added.
   * @param {string[] | {content: string, accessibleName: string}} definition of buttons.
   * @returns {Promise} Fulfils to the index of the button that fulfils.
   */
  showButtons(buttons) {
    if (!buttons?.length) {
      buttons = [icons.ICON_HTML.OK];
    }
    this.resolutionFunction = null;
    const promise = new Promise((resolve) => {
      this.resolutionFunction = resolve;
    });

    buttons.forEach((value, index) => {
      const button = new BarButton(value);
      button.element.setAttribute('data-index', index);
      this.appendChild(button, index);
      this.listenToEventOn('click', button, index);
    });
    return promise;
  }

  /**
   * Handle the click event from the buttons.
   * @param {Event} event
   * @param {string} eventId
   */
  handleClickEvent(event, eventId) {
    const index = parseInt(eventId);
    this.remove();
    hideDialog();
    this.resolutionFunction(index);
  }
}

/**
 * Show a dialog based on its DialogDefintion. Note that any existing classes
 * that may have been applied to the icon are **not** removed. It is the
 * responsiblity of the caller to ensure this is done before calling this
 * function.
 * @param {DialogDefinition} dialogDefinition
 * @returns {Promise} Fulfils to index of button pressed.
 */
function showDialogDefinition(dialogDefinition) {
  const dialogTitleBarText = document.querySelector(
    '#utils-dialog .utils-title-bar span'
  );
  dialogTitleBarText.innerText = dialogDefinition.title;
  const dialogContent = document.querySelector(
    '#utils-dialog .utils-dialog-content'
  );
  if (dialogDefinition.content instanceof Element) {
    dialogContent.innerHTML = '';
    dialogContent.appendChild(dialogDefinition.content);
  } else {
    dialogContent.innerHTML = dialogDefinition.content;
  }

  clearTimeout(dialogHideTimeout);
  dialog.style.visibility = 'visible';
  dialog.style.opacity = 1;
  const icon = document.querySelector(
    '.utils-dialog-content-frame .utils-dialog-icon'
  );
  icon.classList.add(...dialogDefinition.iconClasses);
  showModalMask();
  const buttonBar = new ButtonBar();
  return buttonBar.showButtons(dialogDefinition.buttons);
}

/** Appends a reload warning to the content.
 * @param {string} content
 * @returns {string | Element} Paragraph appended
 */
function addReloadWarning(content) {
  let reloadText = i18n`A serious error has occurred. Wait a few minutes and then close this dialog to try to reload the application.`;
  if (reloadText === '') {
    reloadText =
      'A serious error has occurred and languages cannot be loaded. Wait a few minutes and then close this dialog to try to reload the application.';
  }
  if (content instanceof Element) {
    const para = document.createElement('p');
    para.innerText = reloadText;
    content.appendChild(para);
    return content;
  }
  return `${content}<p>${reloadText}</p>`;
}

/**
 * Popup the dialog box. If called multiple times, each call will be stacked
 * on top of the previous calls.
 *
 * When the dialog is closed, by clicking on the close icon or on the background,
 * the previous dialog will be displayed. The one exception is for dialogs with
 * dialogType equal to DialogType.ERROR. This dialog type will reload the
 * application when closed. Automatic boiler plate text is added to the content
 * to explain this.
 * @param {string} title - any HTML <> characters will be escaped.
 * @param {*} content - content to display. This is treated as HTML
 * @param {Object} options - additional settings
 * @param {DialogType} options.dialogType - dialog type.
 * @param {string[]} options.buttons - buttons to display.
 * @returns {Promise} Fulfils to 0 for all types except DialogType.QUESTION.
 * For questions it Fulfils to the index of the button that was pressed. Rejects
 * if a dialog is already showing.
 */
export default function showDialog(title, content, options) {
  if (document.getElementById('utils-dialog').style.display === 'block') {
    return Promise.reject(
      new Error('Cannot call dialog when another is already visible.')
    );
  }
  if (options?.dialogType === DialogType.FATAL) {
    content = addReloadWarning(content);
  }

  const iconClasses = getFaClassForType(options?.dialogType);
  const dialogDefinition = {
    title: title && title.length > 0 ? title : ':',
    buttons: options?.buttons,
    content: content,
    dialogType: options?.dialogType,
    iconClasses: iconClasses,
  };
  return showDialogDefinition(dialogDefinition);
}

/**
 * Shorthand call for showDialog('Error', content, DialogType.ERROR)
 * @param {string} content
 * @returns {Promise} Fulfils to index of button pressed.
 */
export function showError(content) {
  return showDialog(i18n`Error`, content, { dialogType: DialogType.ERROR });
}

/**
 * Shorthand call for showDialog('Information', content, DialogType.INFO)
 * @param {string} content
 * @returns {Promise} Fulfils to index of button pressed.
 */
export function showInfo(content) {
  return showDialog(i18n`Information`, content, {
    dialogType: DialogType.INFO,
  });
}

/**
 * Shorthand call for showDialog('Question', content, DialogType.QUESTION)
 * @param {string} content
 * @returns {Promise} Fulfils to index of button pressed.
 */
export function showConfirm(content) {
  return showDialog(i18n`Question`, content, {
    dialogType: DialogType.QUESTION,
    buttons: [icons.ICON_HTML.YES, icons.ICON_HTML.NO],
  });
}

/**
 * Shorthand call for showDialog('Fatal error', content, DialogType.FATAL)
 * @param {string} content
 * @returns {Promise} Fulfils to index of button pressed.
 */
export function showFatal(content) {
  return showDialog(i18n`Fatal error`, content, {
    dialogType: DialogType.FATAL,
  });
}

/**
 * Shorthand call for showDialog('Settings', content, DialogType.SETTINGS)
 * @param {string} content
 * @returns {Promise} Fulfils to index of button pressed.
 */
export function showSettingsDialog(content) {
  const options = {
    dialogType: DialogType.SETTINGS,
    buttons: [icons.ICON_HTML.OK, icons.ICON_HTML.RESET_TO_FACTORY],
  };
  return showDialog(i18n`Settings`, content, options);
}

/**
 * Hide the dialog box. If an existing dialog had been shown, this is restored.
 */
function hideDialog() {
  dialog.style.visibility = 'hidden';
  dialog.style.opacity = 0;
  dialogHideTimeout = setTimeout(
    () => (dialog.style.visibility = 'hidden'),
    500
  );
  hideModalMask();
  const icon = document.querySelector(
    '.utils-dialog-content-frame .utils-dialog-icon'
  );
  icon.className = 'utils-dialog-icon';
}

/**
 * Create the dialog's inner HTML.
 * @returns {Element} the root dialog Element.
 */
function createDialogHtml() {
  const dialog = document.createElement('div');
  dialog.setAttribute('id', 'utils-dialog');
  document.body.appendChild(dialog);
  dialog.innerHTML = `
    <div class="utils-title-bar">
      <span></span>
    </div>
    <div class="utils-dialog-content-frame">
      <div class="utils-dialog-icon"></div>
      <div class="utils-dialog-content"></div>
    </div>
    <div class="utils-button-bar"></div>
  `;
  return dialog;
}
/**
 * Element used for displaying popup modal dialogs.
 * @type {Element}
 */
const dialog = createDialogHtml('utils-dialog');
