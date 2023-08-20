/**
 * @file Simple home page
 *
 * @module lessons/presenters/homePresenter
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
import { getHomeText } from '../../data/home.js';
import { parseMarkdown } from '../../utils/text/textProcessing.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { LessonOrigin, lessonManager } from '../lessonManager.js';
import { ManagedElement } from '../../utils/userIo/managedElement.js';
import { icons } from '../../utils/userIo/icons.js';
import { FileInputButton } from '../../utils/userIo/fileInput.js';
import { LessonImporter } from '../lessonImportExport.js';
import { toast } from '../../utils/userIo/toast.js';
import { UnmanagedLesson } from '../unmanagedLesson.js';

/**
 * Class to present a slide show.
 * Presentation of a Problem provides the full problem and answer.
 * @class
 * @extends module:lessons/presenters/Presenter.Presenter
 */
export class HomePresenter extends Presenter {
  static REMOTE_LIBRARY_ID = 'REMOTE';
  static LOCAL_LIBRARY_ID = 'LOCAL';
  static FILE_LIBRARY_ID = 'FILE_SYSTEM';

  /**
   * @type { module:lessons/lessonImportExport~LessonImportExportSummary }
   */
  #importSummary;

  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = [i18n`Open library`, i18n`Open local library`];
    config.itemClassName = 'library';
    super(config);
    this.#buildContent();
    this.hideHomeButton();
  }

  #buildContent() {
    let button = new ManagedElement('button');
    icons.applyIconToElement(icons.library, button, {
      overrideText: i18n`Open remote library`,
    });
    this.presentation.appendChild(button);
    this.listenToEventOn('click', button, HomePresenter.REMOTE_LIBRARY_ID);

    button = new ManagedElement('button');
    icons.applyIconToElement(icons.library, button, {
      overrideText: i18n`Open internal library`,
    });
    this.presentation.appendChild(button);
    this.listenToEventOn('click', button, HomePresenter.LOCAL_LIBRARY_ID);

    button = new FileInputButton(i18n`Open lesson from file system`);
    this.presentation.appendChild(button);
    this.listenToEventOn(
      FileInputButton.DATA_AVAILABLE_EVENT_NAME,
      button,
      HomePresenter.FILE_LIBRARY_ID
    );

    this.addPreamble(parseMarkdown(getHomeText()));
  }

  /**
   * Handle file input.
   * @param {*} event
   * @param {*} eventId
   */
  handleDataAvailableEvent(event, eventIdIgnored) {
    const importer = new LessonImporter();
    this.#importSummary = importer.convert(event.detail.content);
    if (!this.#importSummary) {
      toast(
        `Unable to import the file ${event.detail?.file?.name}. The file may be corrupt or the wrong type of file.`
      );
      return;
    }
    this.handleClickEvent(event, HomePresenter.FILE_LIBRARY_ID);
  }

  /**
   * @override
   */
  next(index) {
    if (index === HomePresenter.FILE_LIBRARY_ID) {
      const unmanagedLesson = new UnmanagedLesson(
        this.#importSummary.title,
        this.#importSummary.content,
        LessonOrigin.FILE_SYSTEM
      );
      this.config.lesson = unmanagedLesson.lesson;
      this.config.lessonInfo = unmanagedLesson.lessonInfo;
      return this.config.factory.getSuitableProblemPresenter(this.config);
    } else {
      lessonManager.usingLocalLibrary =
        index === HomePresenter.LOCAL_LIBRARY_ID;
      return super.next(index);
    }
  }
}
