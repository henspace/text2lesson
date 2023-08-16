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

import { ListPresenter } from './listPresenter.js';
import { getHomeText } from '../../data/home.js';
import { parseMarkdown } from '../../utils/text/textProcessing.js';
import { i18n } from '../../utils/i18n/i18n.js';
import { lessonManager } from '../lessonManager.js';

/**
 * Class to present a slide show.
 * Presentation of a Problem provides the full problem and answer.
 * @class
 * @extends module:lessons/presenters/listPresenter.ListPresenter
 */
export class HomePresenter extends ListPresenter {
  /**
   * Construct.
   * @param {module:lessons/presenters/presenter~PresenterConfig} config - configuration for the presentor
   */
  constructor(config) {
    config.titles = [i18n`Open library`, i18n`Open local library`];
    config.itemClassName = 'library';
    super(config);
    this.#buildContent();
    this.setupKeyboardNavigation();
  }

  #buildContent() {
    this.addPreamble(parseMarkdown(getHomeText()));
  }

  /**
   * @override
   */
  next(index) {
    lessonManager.usingLocalLibrary = index === 1;
    return super.next(index);
  }
}
