/**
 * @file Test the textItem-parser
 * @module lessons/textItem.test
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

import * as textItemParser from './textItem.js';
import * as obfuscator from '../utils/text/obfuscator.js';
import * as emoji from './emojiParser.js';
import { unescapeAttribute } from '../utils/errorHandling/errors.js';
import { Metadata } from './metadata.js';

import { test, expect } from '@jest/globals';

test("Function getItemReplacement's regex extracts simple item", () => {
  let source = 'test ...one ...two string';
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('test[ ][one][][ ][two][] string');
});

test("Function getItemReplacement's regex extracts all characters except the set [<>,;:.?!] or space.", () => {
  let item = 'az09AZ"£$%^&*()_-+={}[]@\'~/\\|`';
  let source = `test ...${item} string`;
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe(`test[ ][${item}][] string`);
});

test("Function getItemReplacement's regex handles entities.", () => {
  let item = 'here&lt;&amp;&#36;&gt;now';
  let source = `test ...${item} string`;
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe(`test[ ][${item}][] string`);
});

test("Function getItemReplacement's regex terminates with punctuation.", () => {
  const punctuation = ',;:.?!';
  for (const end of punctuation) {
    let item = 'KEYWORD';
    let source = `test ...${item}${end}`;
    let replacement = textItemParser.getItemReplacement('[.]{3}', '');
    let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
    expect(result).toBe(`test[ ][${item}][]${end}`);
  }
});

test("Function getItemReplacement's regex terminates with punctuation even with entity at end.", () => {
  const punctuation = ',;:.?!';
  for (const end of punctuation) {
    let item = 'KEYWORD&amp;';
    let source = `test ...${item}${end}`;
    let replacement = textItemParser.getItemReplacement('[.]{3}', '');
    let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
    expect(result).toBe(`test[ ][${item}][]${end}`);
  }
});

test("Function getItemReplacement's regex extracts simple item at start of line", () => {
  let source = '...one string';
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('[][one][] string');
});

test("Function getItemReplacement's regex extracts simple item at end of line", () => {
  let source = 'test ...one';
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('test[ ][one][]');
});

test("Function getItemReplacement's regex extracts simple item after HTML tag", () => {
  let source = '<p>...one string';
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('<p[>][one][] string');
});

test("Function getItemReplacement's regex extracts simple item before HTML closing tag", () => {
  let source = 'test ...one</p>';
  let replacement = textItemParser.getItemReplacement('[.]{3}', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('test[ ][one][]</p>');
});

test("Function getItemReplacement's regex extracts class", () => {
  let source = 'test123>myClass';
  let replacement = textItemParser.getItemReplacement('test', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('[][123][myClass]');
});

test("Function getItemReplacement's regex provides empty class for >", () => {
  let source = 'test123>';
  let replacement = textItemParser.getItemReplacement('test', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('[][123][]');
});

test("Function getItemReplacement's regex is case insensitive >", () => {
  let source = 'test123>';
  let replacement = textItemParser.getItemReplacement('TEST', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('[][123][]');
});

test("Function getItemReplacement's regex is case multiline >", () => {
  let source = 'test123\ntest456';
  let replacement = textItemParser.getItemReplacement('test', '');
  let result = source.replaceAll(replacement.re, '[$1][$2][$3]');
  expect(result).toBe('[][123][]\n[][456][]');
});

test("Function getItemReplacement's rep set to replace parameter", () => {
  let replace = () => {
    console.log('test');
  };
  let replacement = textItemParser.getItemReplacement('test', replace);
  expect(replacement.rep).toEqual(replace);
});

test('TextItem constructor is private.', () => {
  expect.assertions(1);
  try {
    new textItemParser.TextItem();
  } catch (error) {
    expect(error.message).toMatch('Private constructor');
  }
});

test('TextItem html contains parsed Markdown', () => {
  const source = 'This is *emphasised* text';
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch('This is <em>emphasised</em> text');
});

test('Missing words added to array', () => {
  const source = `Test ...one and ...two test line.
Test two ...second_word test line.
`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.missingWords).toHaveLength(3);
  expect(textItem.missingWords[0]).toBe('one');
  expect(textItem.missingWords[1]).toBe('two');
  expect(textItem.missingWords[2]).toBe('second_word');
});

test('Missing words replaced by span with class of missing word', () => {
  const source = `123 ...one 456 ...two 789
ABC ...second_word DEF
`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /123 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 789/
  );
  expect(textItem.html).toMatch(
    /ABC <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> DEF/
  );
});

test('Missing words on line boundaries replaced by span with class of missing word', () => {
  const source = `...one 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with row class replaced by span with class of align-row', () => {
  const source = `...one>row 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-row" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with line class replaced by span with class of align-row', () => {
  const source = `...one>line 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-row" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with col class replaced by span with class of align-column', () => {
  const source = `...one>col 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-column" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with column class replaced by span with class of align-column', () => {
  const source = `...one>column 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-column" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with COL class replaced by span with class of align-column', () => {
  const source = `...one>COL 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-column" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with left class replaced by span with class of align-left', () => {
  const source = `...one>left 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-left" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with alignment class but no word replaced by span with class alignment', () => {
  const source = `...>col 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch('...>col');
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words at end with alignment class but no word replaced by span with class alignment', () => {
  const source = ` 123>col`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word align-column" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('Missing words with unrecognised class replaced by span with no alignment class', () => {
  const source = `...one>garbage 456 ...two`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    /<span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span> 456/
  );
  expect(textItem.html).toMatch(
    /456 <span class="missing-word" data-missing-word="[a-zA-Z0-9/+=]+?"><\/span>/
  );
});

test('data-missing-word attribute contains objuscated missing words', () => {
  const source = `123 ...one 456`;
  const textItem = textItemParser.TextItem.createFromSource(source);
  const match = textItem.html.match(/data-missing-word="([a-zA-Z0-9/+=]+?)">/);
  expect(match).toHaveLength(2);
  const obfuscated = match[1];
  expect(obfuscated).not.toEqual('one');
  expect(obfuscated.length).toBeGreaterThan(3);
  const deobfuscated = obfuscator.deobfuscate(obfuscated);
  expect(deobfuscated).toBe('one');
});

test('Class delimiter > can be escaped', () => {
  let source = `123 ...one>test 456`;
  let textItem = textItemParser.TextItem.createFromSource(source);
  let match = textItem.html.match(/data-missing-word="([a-zA-Z0-9/+=]+?)">/);
  expect(obfuscator.deobfuscate(match[1])).toBe('one');

  source = `123 ...one\\>test 456`;
  textItem = textItemParser.TextItem.createFromSource(source);
  match = textItem.html.match(/data-missing-word="([a-zA-Z0-9/+=]+?)">/);
  expect(obfuscator.deobfuscate(match[1])).toBe('one&gt;test');
});

test('emoji passed without class', () => {
  for (const key in emoji.PREDEFINED_EMOJIS) {
    const emojiHtml = emoji.getEmojiHtml(key);
    let source = `123 emoji:${key} 456`;
    let textItem = textItemParser.TextItem.createFromSource(source);
    expect(textItem.html).toMatch(
      `123 <span class="emoji">${emojiHtml}</span> 456`
    );
  }
});

test('emoji passed with class', () => {
  for (const key in emoji.PREDEFINED_EMOJIS) {
    const emojiHtml = emoji.getEmojiHtml(key);
    let source = `123 emoji:${key}>big 456`;
    let textItem = textItemParser.TextItem.createFromSource(source);
    expect(textItem.html).toMatch(
      `123 <span class="emoji big">${emojiHtml}</span> 456`
    );
  }
});

test('emoji passed with unsafe class', () => {
  for (const key in emoji.PREDEFINED_EMOJIS) {
    const emojiHtml = emoji.getEmojiHtml(key);
    let source = `123 emoji:${key}>garbage 456`;
    let textItem = textItemParser.TextItem.createFromSource(source);
    expect(textItem.html).toMatch(
      `123 <span class="emoji">${emojiHtml}</span> 456`
    );
  }
});

test('emoji uses original text if not found', () => {
  const emojiName = 'garbage';
  const source = `123 emoji:${emojiName}>garbage 456`;
  let textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    `123 <span class="emoji">${emojiName}</span> 456`
  );
});

test('Metadata replaced ', () => {
  const source = `Testing meta:KEY1 and meta:KEY2.`;
  const metadata = Metadata.createFromSource('KEY1: key one\nKEY2: key two');
  let textItem = textItemParser.TextItem.createFromSource(source, metadata);
  expect(textItem.html).toMatch(`Testing key one and key two.`);
});

test('Metadata replaced with escaped HTML', () => {
  const source = `Testing meta:KEY1 string`;
  const metadata = Metadata.createFromSource('KEY1: <div>key one</div>');
  let textItem = textItemParser.TextItem.createFromSource(source, metadata);
  expect(textItem.html).toMatch(`Testing &lt;div>key one&lt;/div> `);
});

test('Nonexistent metadata returned as key word wrapped in error span', () => {
  const key = 'garbage';
  const source = ` meta:${key} `;
  const metadata = Metadata.createFromSource('KEY1: key one\nKEY2: key two');
  let textItem = textItemParser.TextItem.createFromSource(source, metadata);
  const match = textItem.html.match(
    /<span data-error="([a-zA-Z0-9+/=]+)">(.*?)<\/span>/
  );
  expect(match).not.toBeNull();
  const attr = unescapeAttribute(match[1]);
  expect(attr).toMatch(key);
  expect(match[2]).toBe(key);
});

test('Html is escaped when passed in', () => {
  const source = 'Testing <div>html</div><script>code</script>';
  const textitem = textItemParser.TextItem.createFromSource(source);
  expect(textitem.html).toMatch(
    'Testing &lt;div>html&lt;/div>&lt;script>code&lt;/script>'
  );
});

test('Null is replaced by unicode replacement character when passed in', () => {
  const source = 'Testing \0 Null';
  const textitem = textItemParser.TextItem.createFromSource(source);
  expect(textitem.html).toMatch('Testing \ufffd Null');
});

test('Extract first word correctly finds first word in html', () => {
  const firstWord = 'TheFirstWord';
  const source = `\n\n${firstWord} from sentence\n\n`;
  const textitem = textItemParser.TextItem.createFromSource(source);
  expect(textitem.firstWord).toEqual(firstWord);
});

test('Extract first word correctly finds first word in html ignoring formatting', () => {
  const firstWord = 'TheFirstWord';
  const source = `\n\n_${firstWord}_ from sentence\n\n`;
  const textitem = textItemParser.TextItem.createFromSource(source);
  expect(textitem.firstWord).toEqual(firstWord);
});
test('Extract first word correctly finds first word in html ignoring formatting around whole sentence', () => {
  const firstWord = 'TheFirstWord';
  const source = `\n\n_${firstWord} from sentence_\n\n`;
  const textitem = textItemParser.TextItem.createFromSource(source);
  expect(textitem.firstWord).toEqual(firstWord);
});

test('icon passed without class', () => {
  let source = `123 icon:circle-right`;
  let textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(`<i class="fa-solid fa-circle-right"></i>`);
});

test('icon passed with class', () => {
  let source = `123 icon:circle-right>bigger `;
  let textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(
    `<i class="fa-solid fa-circle-right bigger"></i>`
  );
});

test('text passed without class', () => {
  let source = `123 text:circle-right`;
  let textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(`<span class="">circle-right</span>`);
});

test('text passed with class', () => {
  let source = `123 text:circle-right>bigger `;
  let textItem = textItemParser.TextItem.createFromSource(source);
  expect(textItem.html).toMatch(`<span class="bigger">circle-right</span>`);
});
