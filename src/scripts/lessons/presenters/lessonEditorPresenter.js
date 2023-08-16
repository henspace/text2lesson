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

export class LessonEditorPresenter extends Presenter {
  static SAVE_EVENT_ID = 'SAVE';
  #lessonTitleElement;
  #lessonTitleValue;
  #mainEditorElement;
  #saveButton;
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
  }
  /**
   * Set the editor as dirty. The saveButton is hidden and the Presenter set not to
   * require confirmation to leave.
   */
  #setEditorAsClean() {
    this.#saveButton.disabled = true;
    this.#dirty = false;
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
  handleClickEvent(event, eventId) {
    if (eventId === LessonEditorPresenter.SAVE_EVENT_ID) {
      lessonManager.updateCurrentLessonContent(
        this.#lessonTitleValue,
        this.#mainEditorElement.value
      );
      this.#setEditorAsClean();
      return;
    }
    super.handleClickEvent(event, eventId);
  }
}
