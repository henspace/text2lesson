/**
 * @file Presenter for books
 *
 * @module lessons/presenters/bookPresenter.js
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
import { Presenter } from './presenter.js';
import { ChapterPresenter } from './chapterPresenter.js';
import { LibraryPresenter } from './libraryPresenter.js';
/**
 * Class to present a library.
 * Presentation of a library involves displaying all of the books available in
 * the library.
 */
export class BookPresenter extends Presenter {
  /**
   * Construct.
   */
  constructor() {
    super('bookPresenter', {
      titles: lessonManager.chapterTitles,
      itemClassName: 'chapter',
      next: (index) => {
        lessonManager.chapterIndex = index;
        return Promise.resolve(new ChapterPresenter(index));
      },
      previous: () => Promise.resolve(new LibraryPresenter()),
    });
  }
}
