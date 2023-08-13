/**
 * @file Test markdown light
 *
 * @module utils/text/textProcessing.test
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

import { test, expect } from '@jest/globals';
import {
  decodeFromEntities,
  encodeToEntities,
  parseMarkdown,
  escapeHtml,
  getPlainTextFromHtml,
} from './textProcessing.js';

test('Paragraphs split on blank lines', () => {
  const data = 'line 1\nline 2\n\nline 3\nline 4\n\nline 5\nline 6';
  expect(parseMarkdown(data)).toMatch(
    /<p>line 1\nline 2<\/p>\s*<p>line 3\nline 4<\/p>\s*<p>line 5\nline 6<\/p>/
  );
});

test('Line endings normalised to newline', () => {
  expect(parseMarkdown('line 1\r\nline 2\nline 3')).toMatch(
    'line 1\nline 2\nline 3'
  );
});

test('Atx headings return correct levels', () => {
  expect(parseMarkdown('# test\n')).toBe('\n<h1>test</h1>\n');
  expect(parseMarkdown('# test####\n')).toBe('\n<h1>test</h1>\n');
  expect(parseMarkdown('#test\n')).toBe('\n<h1>test</h1>\n');
  expect(parseMarkdown('## test\n')).toBe('\n<h2>test</h2>\n');
  expect(parseMarkdown('##### test\n')).toBe('\n<h5>test</h5>\n');
  expect(parseMarkdown('########## test\n')).toBe('\n<h6>test</h6>\n');

  expect(parseMarkdown(`# test1\n## test2\n`)).toBe(
    '\n<h1>test1</h1>\n\n<h2>test2</h2>\n'
  );
});

test('Setext headings return correct levels', () => {
  expect(parseMarkdown('test\n======\n')).toBe('\n<h1>test</h1>\n');
  expect(parseMarkdown('test\n----\n')).toBe('\n<h2>test</h2>\n');
});

test('Block quote returns block', () => {
  expect(parseMarkdown('start\n> line 1\n> line 2\nend')).toBe(
    '\n<p>start</p>\n\n<blockquote>\nline 1\nline 2\n</blockquote>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n> line 1\n> line 2')).toBe(
    '\n<p>start</p>\n\n<blockquote>\nline 1\nline 2</blockquote>\n'
  );
});

test('Code block returns preformatted code', () => {
  expect(parseMarkdown('start\n    line 1\n    line 2\nend')).toBe(
    '\n<p>start</p>\n\n<pre><code>\nline 1\nline 2\n</code></pre>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\tline 1\n\tline 2\nend')).toBe(
    '\n<p>start</p>\n\n<pre><code>\nline 1\nline 2\n</code></pre>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n        line 1\n        line 2\nend')).toBe(
    '\n<p>start</p>\n\n<pre><code>\n    line 1\n    line 2\n</code></pre>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\t\tline 1\n\t\t\tline 2\nend')).toBe(
    '\n<p>start</p>\n\n<pre><code>\n\tline 1\n\t\tline 2\n</code></pre>\n\n<p>end</p>\n'
  );
});

test('Unordered list returns ul block', () => {
  expect(parseMarkdown('start\n* line 1\n* line 2\nend')).toBe(
    '\n<p>start</p>\n\n<ul>\n<li>line 1</li>\n<li>line 2</li>\n</ul>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n+ line 1\n+ line 2\nend')).toBe(
    '\n<p>start</p>\n\n<ul>\n<li>line 1</li>\n<li>line 2</li>\n</ul>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n- line 1\n- line 2\nend')).toBe(
    '\n<p>start</p>\n\n<ul>\n<li>line 1</li>\n<li>line 2</li>\n</ul>\n\n<p>end</p>\n'
  );
});

test('Ordered list returns ol block', () => {
  expect(parseMarkdown('start\n1. line 1\n2. line 2\nend')).toBe(
    '\n<p>start</p>\n\n<ol>\n<li>line 1</li>\n<li>line 2</li>\n</ol>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n1. line 1\n1. line 2\nend')).toBe(
    '\n<p>start</p>\n\n<ol>\n<li>line 1</li>\n<li>line 2</li>\n</ol>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n10. line 1\n11. line 2\nend')).toBe(
    '\n<p>start</p>\n\n<ol>\n<li>line 1</li>\n<li>line 2</li>\n</ol>\n\n<p>end</p>\n'
  );
});

test('Horizontal rules returns <hr> block', () => {
  expect(parseMarkdown('start\n\n---\nend')).toBe(
    '\n<p>start</p>\n\n<hr>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\n***\nend')).toBe(
    '\n<p>start</p>\n\n<hr>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\n___\nend')).toBe(
    '\n<p>start</p>\n\n<hr>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\n- - -\nend')).toBe(
    '\n<p>start</p>\n\n<hr>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\n* * *\nend')).toBe(
    '\n<p>start</p>\n\n<hr>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\n_ _ _\nend')).toBe(
    '\n<p>start</p>\n\n<hr>\n\n<p>end</p>\n'
  );
  expect(parseMarkdown('start\n\n__\nend')).toBe(
    '\n<p>start</p>\n\n<p>__\nend</p>\n'
  );
});

test('Image links create img elements', () => {
  expect(
    parseMarkdown('![test title](https://example.com "with title")')
  ).toMatch(
    '<img alt="test title" src="https://example.com" title="with title"/>'
  );
  expect(parseMarkdown('![test title](https://example.com)')).toMatch(
    '<img alt="test title" src="https://example.com" title=""/>'
  );
});

test('Links create anchors', () => {
  expect(
    parseMarkdown('[test title](https://example.com "with title")')
  ).toMatch(
    '<a target="_blank" href="https://example.com" title="with title">test title</a>'
  );
  expect(parseMarkdown('[test title](http://example.com)')).toMatch(
    '<a target="_blank" href="http://example.com" title="">test title</a>'
  );
});

test('Auto links create anchors', () => {
  expect(parseMarkdown('<http://example.com>')).toMatch(
    '<a target="_blank" href="http://example.com">http://example.com</a>'
  );
  expect(parseMarkdown('<https://example.com>')).toMatch(
    '<a target="_blank" href="https://example.com">https://example.com</a>'
  );
});

test('Email addresses create email links', () => {
  const email = 'john.doe@somedomain.com';
  const encoded = encodeToEntities(email);

  expect(parseMarkdown(`<${email}>`)).toMatch(
    `<a href="${encoded}">${encoded}</a>`
  );
  expect(parseMarkdown(email)).toMatch(email);
});

test('Encode html entities is valid', () => {
  expect(encodeToEntities('ABC012')).toBe('&#65;&#66;&#67;&#48;&#49;&#50;');
});

test('Decode html entities is valid', () => {
  expect(decodeFromEntities('&#65;&#66;&#67;&#48;&#49;&#50;')).toBe('ABC012');
});

test('Markdown characters can be escaped', () => {
  const chrSet = '\\`*_{}[]()#+-.!';
  for (const chr of chrSet) {
    console.log(`test: ${chr}`);
    expect(parseMarkdown(`\\${chr}`)).toMatch(encodeToEntities(chr));
  }
});

test('Inline code creates <code> element', () => {
  expect(parseMarkdown('`this is code` and `more code`')).toMatch(
    '<code>this is code</code> and <code>more code</code>'
  );
  expect(parseMarkdown('``this is (`) code``')).toMatch(
    '<code>this is (`) code</code>'
  );
});

test('Ampersand escaped unless entity', () => {
  expect(parseMarkdown('test & ampersand')).toMatch('test &amp; ampersand');
  expect(parseMarkdown('test &copy; entity')).toMatch('test &copy; entity');
  expect(parseMarkdown('test &#34; entity')).toMatch('test &#34; entity');
  expect(parseMarkdown('test &#x3f; entity')).toMatch('test &#x3f; entity');
});

test('Less than escaped unless linebreak', () => {
  expect(parseMarkdown('test <tag> here')).toMatch('test &lt;tag> here');
  expect(parseMarkdown('test <br> here')).toMatch('test <br> here');
  expect(parseMarkdown('test <BR> here')).toMatch('test <BR> here');
});

test('Double asterisk creates strong element', () => {
  expect(parseMarkdown('test **some words** text')).toMatch(
    'test <strong>some words</strong> text'
  );
  expect(parseMarkdown('test **some * words** text')).toMatch(
    'test <strong>some * words</strong> text'
  );
  expect(parseMarkdown('test ** some words** text')).toMatch(
    'test <em>* some words</em>* text'
  );
  expect(parseMarkdown('test **some words ** text')).toMatch(
    'test <em>*some words *</em> text'
  );
  expect(parseMarkdown('test ** some words ** text')).toMatch(
    'test <em>* some words *</em> text'
  );
});

test('Double underscore creates strong element', () => {
  expect(parseMarkdown('test __some words__ text')).toMatch(
    'test <strong>some words</strong> text'
  );
  expect(parseMarkdown('test __some _ words__ text')).toMatch(
    'test <strong>some _ words</strong> text'
  );
  expect(parseMarkdown('test __ some words__ text')).toMatch(
    'test <em>_ some words</em>_ text'
  );
  expect(parseMarkdown('test __some words __ text')).toMatch(
    'test <em>_some words _</em> text'
  );
  expect(parseMarkdown('test __ some words __ text')).toMatch(
    'test <em>_ some words _</em> text'
  );
});

test('Single asterisk creates em element', () => {
  expect(parseMarkdown('test *some words* text')).toMatch(
    'test <em>some words</em> text'
  );
  expect(parseMarkdown('test *some * words* text')).toMatch(
    'test <em>some * words</em> text'
  );
  expect(parseMarkdown('test * some words* text')).toMatch(
    'test * some words* text'
  );
  expect(parseMarkdown('test *some words * text')).toMatch(
    'test *some words * text'
  );
  expect(parseMarkdown('test * some words * text')).toMatch(
    'test * some words * text'
  );
});

test('preProcessing applied', () => {
  const test = 'test =strong=input=strong=';
  const preProcess = [
    {
      re: /=strong=/g,
      rep: '**',
    },
    {
      re: /input/g,
      rep: 'output',
    },
  ];
  expect(parseMarkdown(test)).toMatch(test);
  expect(parseMarkdown(test, { pre: preProcess })).toMatch(
    'test <strong>output</strong>'
  );
});

test('postProcessing applied', () => {
  const test = 'test **input**';
  const postProcess = [
    {
      re: /strong/g,
      rep: 'TAG',
    },
    {
      re: /input/g,
      rep: 'output',
    },
  ];
  expect(parseMarkdown(test)).toMatch('test <strong>input</strong>');
  expect(parseMarkdown(test, { post: postProcess })).toMatch(
    'test <TAG>output</TAG>'
  );
});

test('parse uses replacement character for null', () => {
  const result = parseMarkdown('test\x00string');
  expect(result).toMatch('test\ufffdstring');
});

test('escapeHtml escapes < and &', () => {
  expect(escapeHtml('test<here> & now')).toBe('test&lt;here> &amp; now');
});

test('escapeHtml escapes < and & but not character entities', () => {
  expect(escapeHtml('test<here> &copy; now')).toBe('test&lt;here> &copy; now');
});

test('escapeHtml escapes <br>', () => {
  expect(escapeHtml('test <br> now')).toBe('test &lt;br> now');
});

test('escapeHtml uses replacement character for null', () => {
  const result = escapeHtml('test\x00string');
  expect(result).toHaveLength(11);
  expect(result).toBe('test\ufffdstring');
});

test('getPlainTextFromHtml handles plain text', () => {
  expect(getPlainTextFromHtml(' one two three four')).toBe(
    ' one two three four'
  );
});

test('getPlainTextFromHtml handles removes html tags', () => {
  expect(
    getPlainTextFromHtml(
      ' one <i>two</i> <div class="a class">three</div> four'
    )
  ).toBe(' one two three four');
});
