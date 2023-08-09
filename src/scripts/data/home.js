/**
 * @file Home screen markdown
 *
 * @module data/home
 *
 * @license Apache-2.0
 * Copyright 2023 Steve Butler (henspace.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Implemented as function to prevent it being computed if module load
 * occurs before languages have been resolved.
 * @returns {string} Text for welcome message.
 */

import { i18n } from '../utils/i18n/i18n.js';

export const getHomeText = () => i18n`
Hi! Welcome to $_PRODUCT_NAME_TXT_$.
This is the fun way to learn coding. This is intend to take you from absolutely
no knowledge to being able to write code in HTML, CSS and JavaScript. What!
you don't know what those are! Don't worry, you soon will.
Let's get started.

Click continue to access the lesson library and see what is available.

`;
