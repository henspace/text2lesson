/**
 * @file Privacy information
 *
 * @module data/privacy
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

import { i18n } from '../libs/utils/i18n/i18n.js';

/**
 * Markdown text describing the privacy policy.
 * @type {string}
 */
export const PRIVACY = i18n`# $_PRODUCT_NAME_TXT_$
## Privacy
The application does not collect any data at all. No information is stored
or sent back to the server. No cookies are used.
### Local storage
Your results are stored locally on your device. This is the only place they
are stored.
### Sharing
If your device supports it, your progress can be shared with others using the 
Web Share api. Where you can share information depends upon the other apps
installed on your device.`;
