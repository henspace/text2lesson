/**
 * @file Simple popup dialog.
 *
 * @module utils/dialog/modalDialog
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
import { ManagedElement } from './managedElement.js';
import { icons } from './icons.js';
import { ButtonBar } from './button.js';
import { focusManager } from './focusManager.js';
/**
 * @typedef {Object} DialogDefinition
 * @property {string} title
 * @property {string | Element} content - html to display. This is not escaped and as
 * such is vulnerable to script injection. It is the caller's responsibility to
 * santise the data.
 * @property {ModalDialog.DialogType} dialogType
 * @property {string[]} iconClasses - array of classes that are applied to the icon
 * @property {string[]} buttons - array of labels for buttons. These normally
 * only apply to questions.
 */

/**
 * Get the appropriate FontAwesome classes for dialogType
 * @param {ModalDialog.DialogType} dialogType
 * @returns {module:utils/icons~IconDetails} icon
 */
function getIconDetailsForType(dialogType) {
  switch (dialogType) {
    case ModalDialog.DialogType.WARNING:
      return icons.warning;
    case ModalDialog.DialogType.ERROR:
      return icons.error;
    case ModalDialog.DialogType.FATAL:
      return icons.fatal;
    case ModalDialog.DialogType.QUESTION:
      return icons.question;
    case ModalDialog.DialogType.SETTINGS:
      return icons.settings;
    case ModalDialog.DialogType.INFO:
    default:
      return icons.info;
  }
}

/**
 * ModalDialog class.
 */
export class ModalDialog {
  /**
   * Enum for different dialog types
   * @const
   * @enum {string}
   */
  static DialogType = {
    ERROR: 'error',
    FATAL: 'fatal',
    INFO: 'info',
    QUESTION: 'question',
    SETTINGS: 'settings',
    WARNING: 'warning',
  };

  /**
   * Enum of return values from dialogs. These are the indexes of the associated buttons.
   * @const
   * @enum{number}
   */
  static DialogIndex = {
    SETTINGS_OK: 0,
    SETTINGS_RESET: 1,
    CONFIRM_YES: 0,
    CONFIRM_NO: 1,
  };

  /** @type{boolean} */
  static #isConstructing = false;

  /**
   * Main dialog container
   * @type{module:utils/userIo/managedElement.ManagedElement}
   */
  #dialog;

  /**
   * Element containing the dialog title.
   * @type{module:utils/userIo/managedElement.ManagedElement}
   */
  #titleText;

  /**
   * Element containing the dialog icon.
   * @type{module:utils/userIo/managedElement.ManagedElement}
   */
  #icon;

  /**
   * Element containing the dialog content.
   * @type{module:utils/userIo/managedElement.ManagedElement}
   */
  #content;

  /**
   * Element containing the button bar.
   * @type{module:utils/userIo/managedElement.ManagedElement}
   */
  #buttonBar;

  /**
   * Constructor. Do not call directly. A factory method should be used.
   * @throws {Error} Constructor must be called via factory method.
   */
  constructor() {
    if (!ModalDialog.#isConstructing) {
      throw new Error('ModalDialog should be instantiated via factory method.');
    }
    this.#createHtml();
  }

  /** Instantiate a new ModalDialog.
   * @returns {ModalDialog}
   * @private
   */
  static #constructDialog() {
    ModalDialog.#isConstructing = true;
    const dialog = new ModalDialog();
    ModalDialog.#isConstructing = false;
    return dialog;
  }

  /**
   * Create the html infrastructure for the dialog.
   * @private
   */
  #createHtml() {
    this.#dialog = new ManagedElement('div', 'utils-dialog');
    this.#dialog.classList.add('framed', 'modal');
    const titleBar = new ManagedElement('div', 'utils-title-bar');
    titleBar.classList.add('container');

    this.#icon = new ManagedElement('span', 'utils-dialog-icon');
    titleBar.appendChild(this.#icon);

    this.#titleText = new ManagedElement('span');
    titleBar.appendChild(this.#titleText);

    const contentFrame = new ManagedElement(
      'div',
      'utils-dialog-content-frame'
    );
    contentFrame.classList.add('container');

    this.#content = new ManagedElement('div', 'utils-dialog-content');
    contentFrame.appendChild(this.#content);

    this.#buttonBar = new ButtonBar();

    this.#dialog.appendChild(titleBar);
    this.#dialog.appendChild(contentFrame);
    this.#dialog.appendChild(this.#buttonBar);

    this.#dialog.appendTo(document.body);
  }

  /**
   * Show the dialog based on its DialogDefinition.
   * Note that the dialogDefinition can contain raw HTML so the caller should make
   * sure the data are sanitised to prevent code injection.
   * @param {DialogDefinition} dialogDefinition
   * @returns {Promise} Fulfils to index of button pressed.
   * @private
   */
  #showDialogDefinition(dialogDefinition) {
    this.#titleText.textContent = dialogDefinition.title;
    if (
      dialogDefinition.content instanceof Element ||
      dialogDefinition.content instanceof ManagedElement
    ) {
      this.#content.textContent = '';
      this.#content.appendChild(dialogDefinition.content);
    } else {
      this.#content.innerHTML = dialogDefinition.content;
    }

    icons.applyIconToElement(dialogDefinition.iconDetails, this.#icon, {
      hideText: true,
    });

    return this.#buttonBar
      .showButtons(dialogDefinition.buttons)
      .then((index) => {
        this.#hideDialog();
        focusManager.findBestFocus();
        return index;
      });
  }

  /**
   * Hide the dialog box.
   * @private
   */
  #hideDialog() {
    this.#dialog.remove();
  }

  /**
   * Appends a reload warning to the content.
   * @param {string} content - html to add. This will be wrapped in a <p> element.
   * @returns {string | Element} Content with paragraph appended
   * @private
   */
  static #addReloadWarning(content) {
    let reloadText = i18n`A serious error has occurred. Wait a few minutes and then close this dialog to try to reload the application.`;
    if (reloadText === '') {
      reloadText =
        'A serious error has occurred and languages cannot be loaded. Wait a few minutes and then close this dialog to try to reload the application.';
    }
    if (content instanceof Element) {
      const para = document.createElement('p');
      para.textContent = reloadText;
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
   * dialogType equal to {@link ModalDialog.DialogType.ERROR}. This dialog type will reload the
   * application when closed. Automatic boiler plate text is added to the content
   * to explain this.
   * @param {string} title - any HTML <> characters will be escaped.
   * @param {*} content - content to display. This is treated as HTML
   * @param {Object} options - additional settings
   * @param {ModalDialog.DialogType} options.dialogType - dialog type.
   * @param {string[]} options.buttons - buttons to display.
   * @returns {Promise} Fulfils to 0 for all types except ModalDialog.DialogType.QUESTION.
   * For questions it Fulfils to the index of the button that was pressed. Rejects
   * if a dialog is already showing.
   */
  static showDialog(title, content, options) {
    const dialog = ModalDialog.#constructDialog();
    if (options?.dialogType === ModalDialog.DialogType.FATAL) {
      content = ModalDialog.#addReloadWarning(content);
    }

    const iconDetails = getIconDetailsForType(options?.dialogType);
    const dialogDefinition = {
      title: title && title.length > 0 ? title : ':',
      buttons: options?.buttons,
      content: content,
      dialogType: options?.dialogType,
      iconDetails: iconDetails,
    };
    return dialog.#showDialogDefinition(dialogDefinition);
  }

  /**
   * Shorthand method to call ModalDialog.showDialog('Settings', content, ModalDialog.DialogType.SETTINGS)
   * @param {string} content
   * @returns {Promise} Fulfils to index of button pressed.
   */
  static showSettingsDialog(content) {
    const options = {
      dialogType: ModalDialog.DialogType.SETTINGS,
      buttons: [icons.ok, icons.resetToFactory],
    };
    return ModalDialog.showDialog(i18n`Settings`, content, options);
  }

  /**
   * Shorthand call for ModalDialog.showDialog('Error', content, ModalDialog.DialogType.WARNING)
   * @param {string} content
   * @param {string} [title] - optional title.
   * @returns {Promise} Fulfils to index of button pressed.
   */
  static showWarning(content, title) {
    return ModalDialog.showDialog(title ?? i18n`Error`, content, {
      dialogType: ModalDialog.DialogType.WARNING,
    });
  }

  /**
   * Shorthand call for ModalDialog.showDialog('Error', content, ModalDialog.DialogType.ERROR)
   * @param {string} content
   * @param {string} [title] - optional title.
   * @returns {Promise} Fulfils to index of button pressed.
   */
  static showError(content, title) {
    return ModalDialog.showDialog(title ?? i18n`Error`, content, {
      dialogType: ModalDialog.DialogType.ERROR,
    });
  }

  /**
   * Shorthand call for ModalDialog.showDialog('Information', content, ModalDialog.DialogType.INFO)
   * @param {string} content
   * @param {string} [title] - optional title.
   * @returns {Promise} Fulfils to index of button pressed.
   */
  static showInfo(content, title) {
    return ModalDialog.showDialog(title ?? i18n`Information`, content, {
      dialogType: ModalDialog.DialogType.INFO,
    });
  }

  /**
   * Shorthand call for ModalDialog.showDialog('Question', content, ModalDialog.DialogType.QUESTION)
   * @param {string} content
   * @param {string} [title] - optional title.
   * @returns {Promise} Fulfils to index of button pressed.
   */
  static showConfirm(content, title) {
    return ModalDialog.showDialog(title ?? i18n`Question`, content, {
      dialogType: ModalDialog.DialogType.QUESTION,
      buttons: [icons.yes, icons.no],
    });
  }

  /**
   * Shorthand call for ModalDialog.showDialog('Fatal error', content, ModalDialog.DialogType.FATAL)
   * @param {string} content
   * @param {string} [title] - optional title.
   * @returns {Promise} Fulfils to index of button pressed.
   */
  static showFatal(content, title) {
    return ModalDialog.showDialog(title ?? i18n`Fatal error`, content, {
      dialogType: ModalDialog.DialogType.FATAL,
    });
  }
}
