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

import { lessonManager } from '../lessonManager.js';
import { ListPresenter } from './listPresenter.js';

/**
 * Class to present a chapter.
 * Presentation of a chapter involves displaying all of the lessons available in
 * the chapter.
 * @extends module:lessons/presenters/listPresenter.ListPresenter
 */
export class ChapterPresenter extends ListPresenter {
  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = lessonManager.lessonTitles;
    config.itemClassName = 'lesson';
    super(config);
    this.setupKeyboardNavigation();
  }
  /**
   * @override
   */
  next(index) {
    lessonManager.lessonIndex = index;
    return super.next(index);
  }
}
