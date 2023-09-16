/**
 * @file Chapter presenter
 *
 * @module lessons/presenters/chapterPresenter
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
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { lessonManager } from '../lessonManager.js';
import { ListPresenter } from './listPresenter.js';
import { icons } from '../../utils/userIo/icons.js';
/**
 * Class to present a chapter.
 * Presentation of a chapter involves displaying all of the lessons available in
 * the chapter.
 * @extends module:lessons/presenters/listPresenter.ListPresenter
 */
export class ChapterPresenter extends ListPresenter {
  ADD_LESSON_EVENT_ID = 'add-lesson';
  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presenter
   */
  constructor(config) {
    config.titles = lessonManager.lessonTitles;
    config.itemClassName = 'lesson';
    super(config);
    this.#buildPreamble();
    if (lessonManager.usingLocalLibrary) {
      this.#addNewSlotButton();
    }
    this.autoAddKeydownEvents();
  }

  /**
   * Set up the preamble
   */
  #buildPreamble() {
    if (lessonManager.usingLocalLibrary) {
      this.addPreamble(
        `<span class='library-title'>${lessonManager.libraryTitle}</span>`
      );
    } else {
      this.addPreamble(
        `<span class='library-title'>${lessonManager.libraryTitle}</span>
        <span class='book-title'>${lessonManager.bookTitle}</span>
        <span class='chapter-title'>${lessonManager.chapterTitle}</span>
        `
      );
    }
  }

  #addNewSlotButton() {
    const button = new ManagedElement('button');
    icons.applyIconToElement(icons.addLesson, button);
    this.listenToEventOn('click', button, this.ADD_LESSON_EVENT_ID);
    this.addButtonToBar(button);
  }

  /**
   * Local library scrolls to bottom as this is more helpful when adding slots.
   * @override
   */
  onPostPresentActions() {
    if (lessonManager.usingLocalLibrary) {
      const stage = document.getElementById('stage');
      stage.scrollTo({ top: stage.scrollHeight, behavior: 'smooth' });
    }
  }
  /**
   *
   * @override
   */
  handleClickEvent(event, eventId) {
    if (eventId === this.ADD_LESSON_EVENT_ID) {
      return lessonManager.addLessonToLocalLibrary().then(() => {
        super.handleClickEvent(event, eventId);
      });
    }
    super.handleClickEvent(event, eventId);
  }
  /**
   * @override
   */
  next(index) {
    if (index === this.ADD_LESSON_EVENT_ID) {
      return new ChapterPresenter(this.config);
    } else {
      lessonManager.lessonIndex = index;
      return super.next(index);
    }
  }
}
