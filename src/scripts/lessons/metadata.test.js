/**
 * @file Test meta data construction
 *
 * @module lessons/metadata.test
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

import * as metadata from './metadata.js';
import { test, expect } from '@jest/globals';

test('Constructor private', () => {
  expect(() => {
    new metadata.Metadata();
  }).toThrowError('Private constructor');
});

test('Factory method extracts key words from source', () => {
  const source = 'author: this is the author\ndate: this is the date';
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('AUTHOR')).toBe('this is the author');
  expect(meta.getValue('DATE')).toBe('this is the date');
});

test('Factory method extracts key words allows multiple separators', () => {
  const source = `colon: colon
colonAndDash:- colon and dash
semiColon; semicolon
semiColonAndDash;- semicolon and dash
period. period
periodAndDash.- period and dash
`;
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('COLON')).toBe('colon');
  expect(meta.getValue('COLONANDDASH')).toBe('colon and dash');
  expect(meta.getValue('SEMICOLON')).toBe('semicolon');
  expect(meta.getValue('SEMICOLONANDDASH')).toBe('semicolon and dash');
  expect(meta.getValue('PERIOD')).toBe('period');
  expect(meta.getValue('PERIODANDDASH')).toBe('period and dash');
});

test('Factory method extracts key words allows multiple separators', () => {
  const source = `colon: colon
invalid line
semiColon; semicolon
`;
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('COLON')).toBe('colon');
  expect(meta.getValue('SEMICOLON')).toBe('semicolon');
});

test('Factory method strips extra spaces around key word, separator and value', () => {
  const source = `    colon    :     colon      
     invalid line   
        semiColon   ;     semicolon
`;
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('COLON')).toBe('colon');
  expect(meta.getValue('SEMICOLON')).toBe('semicolon');
});

test('Getter for keys returns metadata value if found', () => {
  const source = 'author: this is the author\ndate: this is the date';
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('author')).toBe('this is the author');
  expect(meta.getValue('date')).toBe('this is the date');
});

test('getValue returns metadata value for upper or lower case', () => {
  const source = 'author: this is the author\ndate: this is the date';
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('AuThOr')).toBe('this is the author');
  expect(meta.getValue('DaTe')).toBe('this is the date');
});

test('getValue returns default value if key not found', () => {
  const source = 'author: this is the author\ndate: this is the date';
  const meta = metadata.Metadata.createFromSource(source);
  expect(meta.getValue('AuThOr', 'my default')).toBe('this is the author');
  expect(meta.getValue('garbage', 'my default')).toBe('my default');
});
