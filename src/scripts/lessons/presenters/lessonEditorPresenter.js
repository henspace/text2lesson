/**
 * @file Lesson editor
 *
 * @module lessons/presenters/lessonEditorPresenter
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
import { LocalLibrary } from '../localLibrary.js';
import { lessonManager } from '../lessonManager.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { LabeledControl } from '../../utils/userIo/labeledControl.js';
import { icons } from '../../utils/userIo/icons.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { LessonExporter, LessonImporter } from '../lessonImportExport.js';
import { FileInputButton } from '../../utils/userIo/fileInput.js';
import { ModalDialog } from '../../utils/userIo/modalDialog.js';
import { toast } from '../../utils/userIo/toast.js';

export class LessonEditorPresenter extends Presenter {
  static SAVE_EVENT_ID = 'SAVE';
  static EXPORT_EVENT_ID = 'EXPORT';
  static IMPORT_EVENT_ID = 'IMPORT';
  static DELETE_EVENT_ID = 'DELETE';

  #lessonTitleElement;
  #lessonTitleValue;
  #mainEditorElement;
  #saveButton;
  #importForm;
  #importButton;
  #exportButton;
  #dirty;
  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = ['placeholder']; // this will be replaced later.
    config.itemClassName = 'lesson-editor';
    super(config);
    this.#buildCustomContent();
    this.#addSaveButton();
    this.#addImportButton();
    this.#addExportButton();
    if (new LocalLibrary().okayToDeleteSlot) {
      this.#addDeleteButton();
    }
    this.expandPresentation();
    this.#setEditorAsClean();
    this.applyIconToNextButton(icons.closeEditor);
    this.showNextButton();
    this.#dirty = false;
  }

  /**
   * Build the content.
   */
  async #buildCustomContent() {
    const cachedLesson = await lessonManager.loadCurrentLesson();
    this.#lessonTitleValue = this.config.lessonInfo.titles.lesson;
    this.#lessonTitleElement = new LabeledControl(
      LocalLibrary,
      {
        defaultValue: this.#lessonTitleValue,
        label: i18n`Title`,
        type: 'input',
        onupdate: (value) => {
          this.#lessonTitleValue = value;
          this.#setEditorAsDirty();
        },
      },
      { storage: null }
    );
    this.addPreamble(this.#lessonTitleElement);
    this.#mainEditorElement = this.presentation.createAndAppendChild(
      'textarea',
      'lesson-editor',
      cachedLesson.content
    );
    this.listenToEventOn('input', this.#mainEditorElement);
  }

  /**
   * Set the editor as dirty. The saveButton is shown and the Presenter set to
   * require confirmation to leave.
   */
  #setEditorAsDirty() {
    this.#saveButton.disabled = false;
    this.#dirty = true;
    this.classList.add(Presenter.DO_NOT_CLOSE_CLASS_NAME);
  }
  /**
   * Set the editor as dirty. The saveButton is hidden and the Presenter set not to
   * require confirmation to leave.
   */
  #setEditorAsClean() {
    this.#saveButton.disabled = true;
    this.#dirty = false;
    this.classList.remove(Presenter.DO_NOT_CLOSE_CLASS_NAME);
  }

  /**
   * Add a save button */
  #addSaveButton() {
    this.#saveButton = new ManagedElement('button');
    icons.applyIconToElement(icons.save, this.#saveButton);
    this.listenToEventOn(
      'click',
      this.#saveButton,
      LessonEditorPresenter.SAVE_EVENT_ID
    );
    this.addButtonToBar(this.#saveButton);
  }

  /**
   * Add an import button
   */
  #addImportButton() {
    this.#importForm = new ManagedElement('form', 'button-wrapper');
    this.#importButton = new FileInputButton();
    this.#importForm.appendChild(this.#importButton);
    this.listenToEventOn(
      FileInputButton.DATA_AVAILABLE_EVENT_NAME,
      this.#importButton,
      LessonEditorPresenter.IMPORT_EVENT_ID
    );
    this.addButtonToBar(this.#importForm);
  }
  /**
   * Add an export button */
  #addExportButton() {
    this.#exportButton = new ManagedElement('button');
    icons.applyIconToElement(icons.export, this.#exportButton);
    this.listenToEventOn(
      'click',
      this.#exportButton,
      LessonEditorPresenter.EXPORT_EVENT_ID
    );
    this.addButtonToBar(this.#exportButton);
  }

  /**
   * Add a delete button
   */
  #addDeleteButton() {
    const deleteButton = new ManagedElement('button');
    icons.applyIconToElement(icons.delete, deleteButton);
    this.listenToEventOn(
      'click',
      deleteButton,
      LessonEditorPresenter.DELETE_EVENT_ID
    );
    this.addButtonToBar(deleteButton);
  }
  /**
   * Handle file input.
   * @param {*} event
   * @param {*} eventId
   */
  handleDataAvailableEvent(event, eventIdIgnored) {
    this.#importForm.element.reset(); // If we don't do this, we won't get new events for the same file.
    const importer = new LessonImporter();
    const importSummary = importer.convert(event.detail.content);
    if (!importSummary) {
      toast(
        `Unable to import the file ${event.detail?.file?.name}. The file may be corrupt or the wrong type of file.`
      );
      return;
    }
    return ModalDialog.showConfirm(
      i18n`Are you sure you want to overwrite your lesson?`
    ).then((answer) => {
      if (answer === ModalDialog.DialogIndex.CONFIRM_YES) {
        this.#lessonTitleElement.setValue(importSummary.title);
        this.#lessonTitleValue = importSummary.title;
        this.#mainEditorElement.value = importSummary.content;
        this.#setEditorAsDirty();
      }
      return;
    });
  }
  /**
   * Handle update of the editor.
   * @param {Event} eventIgnored
   * @param {string} eventIdIgnored
   */
  handleInputEvent(eventIgnored, eventIdIgnored) {
    this.#setEditorAsDirty();
  }

  /**
   * @override
   */
  async allowNavigation(eventIgnored, eventIdIgnored) {
    if (this.#dirty) {
      return this.askIfOkayToLeave(
        i18n`Are you sure you want to leave the editor? You will lose your changes.`
      );
    } else {
      return true;
    }
  }

  /**
   * @override
   */
  async handleClickEvent(event, eventId) {
    switch (eventId) {
      case LessonEditorPresenter.DELETE_EVENT_ID:
        {
          const deleted = await this.#deleteLessonIfConfirmed();
          if (!deleted) {
            return;
          }
        }
        break;
      case LessonEditorPresenter.SAVE_EVENT_ID:
        return this.#saveLessonLocally();
      case LessonEditorPresenter.EXPORT_EVENT_ID:
        return this.#exportLesson();
    }
    return super.handleClickEvent(event, eventId);
  }

  /**
   * @override
   * @param {string} eventId
   */
  next(eventId) {
    if (eventId === LessonEditorPresenter.DELETE_EVENT_ID) {
      return this.config.factory.getLibraryPresenter(this, this.config);
    } else {
      return super.next(eventId);
    }
  }

  /**
   * Delete the lesson if the user confirms the action.
   * @returns {Promise} fulfils to true if deleted.
   */
  #deleteLessonIfConfirmed() {
    return ModalDialog.showConfirm(
      i18n`Are you sure you want to delete this lesson?`,
      i18n`Confirm deletion`
    ).then((response) => {
      if (response === ModalDialog.DialogIndex.CONFIRM_YES) {
        return this.#deleteLesson();
      } else {
        return false;
      }
    });
  }

  /**
   * Delete the lesson without waiting for confirmation.
   * @returns {Promise} fulfils to true;
   */
  #deleteLesson() {
    return lessonManager.deleteLocalLibraryCurrentLesson().then(() => true);
  }

  /**
   * Save the lesson to local storage.
   */
  #saveLessonLocally() {
    lessonManager.updateCurrentLessonContent(
      this.#lessonTitleValue,
      this.#mainEditorElement.value
    );
    this.#setEditorAsClean();
  }
  /**
   * Export the lesson.
   */
  #exportLesson() {
    const exporter = new LessonExporter(
      this.#lessonTitleValue,
      this.#mainEditorElement.value
    );
    exporter.exportLesson();
  }
}
