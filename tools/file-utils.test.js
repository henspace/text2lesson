/**
 * @jest-environment node
 */
/**
 * @file Test module for the file-utils module.
 * @module
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

/*global describe, test, expect, beforeEach */

import { Buffer } from 'node:buffer';
import * as nodePath from 'node:path';

import { jest } from '@jest/globals';

jest.unstable_mockModule('node:fs/promises', () => ({
  mkdir: jest.fn(() => Promise.resolve(undefined)),
  readdir: jest.fn(() => Promise.reject('Implement data handling per test.')),
  readFile: jest.fn(() => Promise.reject('Implement data handling per test.')),
  rm: jest.fn(() => Promise.resolve(undefined)),
  writeFile: jest.fn(() => Promise.resolve(undefined)),
}));

const { mkdir, readdir, readFile, rm, writeFile } = await import(
  'node:fs/promises'
);

const { CSS_TRANSFORMER, FileManager, StringTransformer, doFiletypesMatch } =
  await import('./file-utils.js');

/** Name of subdirectory */
const SUBDIR = 'subdir';

/**
 * Array of dirent objects use for response to fsPromises.readdir calls.
 */
const ROOTDIR_DIRENTS = [
  {
    name: 'root1.txt',
    isFile: () => true,
    isDirectory: () => false,
  },
  {
    name: 'root2.txt',
    isFile: () => true,
    isDirectory: () => false,
  },
  {
    name: 'root3.txt',
    isFile: () => true,
    isDirectory: () => false,
  },
  {
    name: SUBDIR,
    isFile: () => false,
    isDirectory: () => true,
  },
];

/**
 * Array of dirent objects use for response to fsPromises.readdir calls on a
 * sub directory.
 */
const SUBDIR_DIRENTS = [
  {
    name: 'sub1.txt',
    isFile: () => true,
    isDirectory: () => false,
  },
  {
    name: 'sub2.txt',
    isFile: () => true,
    isDirectory: () => false,
  },
];
/**
 * Clear mock data before the tests.
 */
beforeEach(() => {
  readdir.mockClear();
  readFile.mockClear();
  writeFile.mockClear();
});

/** Custom matcher for paths. As file-utils could be using relative or
 * absolute paths, this checks that the paths resolve to the same location.
 * The expected path can take more than one compenent which will be joined to
 * create the expectedPath.
 * @param {string} actualPath
 * @param {string} expectedPathsToJoin
 *
 * @returns {{message:function, pass: boolean}}
 */
function toMatchPath(actualPath, ...expectedPathsToJoin) {
  const expectedPath = nodePath.join(...expectedPathsToJoin);
  const pass = nodePath.relative(actualPath, expectedPath).length === 0;
  const message = () =>
    `expected ${this.utils.printReceived(actualPath)} ` +
    `to match ${this.utils.printReceived(expectedPath)}`;
  return {
    message: message,
    pass: pass,
  };
}

expect.extend({
  toMatchPath,
});

describe('FileManager tests', () => {
  test(
    'makeDir should call Promise version of mkdir with recursive true',
    fileManagerMakeDirTest
  );
  test(
    'removeDir should call Promise version of rmdir with force and ' +
      'recursive options.',
    fileManagerRemoveDirTest
  );
  test(
    'getBasename should work with posix and win32 paths.',
    fileManagerGetBasenameTest
  );
  test(
    'getFileType should get uppercase extension without dot for posix and ' +
      ' win32 paths.',
    fileManagerGetFileTypeTest
  );
  test(
    'doFileTypesMatch should match upper and lower case extensions and ' +
      'arrays',
    doFileTypesMatchTest
  );
  test(
    'extractText should extract matching text from file',
    fileManagerExtractTextTest
  );
  test(
    'createJsonDirListing should create JSON file with all files',
    fileManagerCreateJsonDirListing
  );
  test(
    'createJsonDirListing should create JSON file with all files matching filter',
    fileManagerCreateJsonDirListingFiltered
  );
  test(
    'createJsonDirListingMeta should create JSON file with the meta object',
    fileManagerCreateJsonDirListingMeta
  );
  describe('copyFile', () => {
    test('copyFile should call mkdir for target', fileManagerCopyFileMkdirTest);
    test(
      'copyFile output should be the same as input',
      fileManagerCopyFileInOutTest
    );
    test(
      'copyFile output should be transformed from the input',
      fileManagerCopyFileTranformTest
    );
  });

  describe('copyFiles', () => {
    test(
      'getAllMatchingFiles should return files matching filter reg. exp.',
      fileManagerGetAllMatchingFilesTest
    );
    test(
      'should traverse directory and call copyFile without transformer',
      fileManagerCopyFilesNoTranformTest
    );

    test(
      'should traverse directory and call copyFile with transformer',
      fileManagerCopyFilesWithTransformTest
    );

    test(
      'should traverse directory applying filter',
      fileManagerCopyFilesWithFilterTest
    );
  });
});

describe('StringTransformer tests', () => {
  test(
    'transform correctly replaces text matching regular expression',
    stringTransformerTransformTest
  );
  test(
    'CSS transform correctly replaces text matching regular expression',
    cssTransformTest
  );
});

/**
 * @typedef {Object} CopyFileExpectation
 * @property {string} CopyFileExpectation.in - expected path to input file.
 * @property {string} CopyFileExpectation.out - expected path to out file.
 */

/**
 * Create expections for copying files using the ROOTDIR_DIRENTS and
 * SUBDIR_DIRENTS values
 *
 * @param {string} dirInRoot - root input directory
 * @param {string} dirOutRoot - root output directory.
 * @param {StringTransformer=} transformer - transformer applied to calls
 * @returns {CopyFileExpectation[]} expected calls in order.
 */
function createCopyFileExpectations(dirInRoot, dirOutRoot, transformer) {
  return [
    {
      in: nodePath.join(dirInRoot, 'root1.txt'),
      out: nodePath.join(dirOutRoot, 'root1.txt'),
      transformer: transformer,
    },
    {
      in: nodePath.join(dirInRoot, 'root2.txt'),
      out: nodePath.join(dirOutRoot, 'root2.txt'),
      transformer: transformer,
    },
    {
      in: nodePath.join(dirInRoot, 'root3.txt'),
      out: nodePath.join(dirOutRoot, 'root3.txt'),
      transformer: transformer,
    },
    {
      in: nodePath.join(dirInRoot, SUBDIR, 'sub1.txt'),
      out: nodePath.join(dirOutRoot, SUBDIR, 'sub1.txt'),
      transformer: transformer,
    },
    {
      in: nodePath.join(dirInRoot, SUBDIR, 'sub2.txt'),
      out: nodePath.join(dirOutRoot, SUBDIR, 'sub2.txt'),
      transformer: transformer,
    },
  ];
}

/**
 * Check the calls to the mockedCopyFile match the expections.
 * @param {Jest.fn} mockedCopyFile
 * @param {CopyFileExpectation} expectations
 */
function checkCopyFileExpectataions(mockedCopyFile, expectations) {
  for (const callNumber in expectations) {
    expect(mockedCopyFile.mock.calls[callNumber]).toHaveLength(3);
    expect(mockedCopyFile.mock.calls[callNumber][0]).toMatchPath(
      expectations[callNumber].in
    );
    expect(mockedCopyFile.mock.calls[callNumber][1]).toMatchPath(
      expectations[callNumber].out
    );
    expect(mockedCopyFile.mock.calls[callNumber][2]).toBe(
      expectations[callNumber].transformer
    );
  }
}

function fileManagerMakeDirTest() {
  const dir = './garbage/out';
  return FileManager.makeDir(dir).then(() => {
    console.log(`mkdir mock called ${mkdir.mock.calls.length} times.`);
    expect(mkdir).toHaveBeenCalledWith(dir, { recursive: true });
  });
}

function fileManagerRemoveDirTest() {
  const dir = './garbage/in';
  return FileManager.removeDir(dir).then(() => {
    console.log(`rm mock called ${rm.mock.calls.length} times.`);
    expect(rm).toHaveBeenCalledWith(dir, { force: true, recursive: true });
  });
}

function fileManagerGetBasenameTest() {
  expect(FileManager.getBasename('/abc/def/test.txt')).toBe('test.txt');
  expect(FileManager.getBasename('C:\\\\test.txt')).toBe('test.txt');
  expect(FileManager.getBasename('C:\\\\abc\\test.txt')).toBe('test.txt');
  expect(FileManager.getBasename('test.txt')).toBe('test.txt');
}

function fileManagerGetFileTypeTest() {
  expect(FileManager.getFileType('/abc/def/test.txt')).toBe('TXT');
  expect(FileManager.getFileType('C:\\\\test.txt')).toBe('TXT');
  expect(FileManager.getFileType('C:\\\\abc\\test.txt')).toBe('TXT');
  expect(FileManager.getFileType('test.txt')).toBe('TXT');
  expect(FileManager.getFileType('test.html')).toBe('HTML');
  expect(FileManager.getFileType('test.')).toBe('');
  expect(FileManager.getFileType('test')).toBe('');
  expect(FileManager.getFileType('')).toBe('');
  expect(FileManager.getFileType(null)).toBe('');
  expect(FileManager.getFileType('C:\\\\abc\\test')).toBe('');
}

function fileManagerCopyFileMkdirTest() {
  const DIR_IN = './dir/in';
  const FILENAME_IN = 'testIn.txt';
  const DIR_OUT = './dir/out';
  const FILENAME_OUT = 'testOut.txt';
  const FILE_PATH_IN = `${DIR_IN}/${FILENAME_IN}`;
  const FILE_PATH_OUT = `${DIR_OUT}/${FILENAME_OUT}`;
  readFile.mockResolvedValueOnce(Buffer.from('dummy data'));
  return FileManager.copyFile(FILE_PATH_IN, FILE_PATH_OUT).then(() => {
    expect(mkdir).toHaveBeenCalledWith(DIR_OUT, { recursive: true });
  });
}

function fileManagerCopyFileInOutTest() {
  const DIR_IN = './dir/in';
  const FILENAME_IN = 'testIn.txt';
  const DIR_OUT = './dir/out';
  const FILENAME_OUT = 'testOut.txt';
  const FILE_PATH_IN = `${DIR_IN}/${FILENAME_IN}`;
  const FILE_PATH_OUT = `${DIR_OUT}/${FILENAME_OUT}`;
  const DATA = 'This is a test';
  readFile.mockResolvedValueOnce(Buffer.from(DATA));
  return FileManager.copyFile(FILE_PATH_IN, FILE_PATH_OUT).then(() => {
    expect(mkdir).toHaveBeenCalledWith(DIR_OUT, { recursive: true });
    expect(readFile).toHaveBeenCalled();
    expect(readFile.mock.calls[0][0]).toMatchPath(FILE_PATH_IN);
    expect(writeFile).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][0]).toMatchPath(FILE_PATH_OUT);
    expect(writeFile.mock.calls[0][1] instanceof Buffer).toBe(true);
    expect(writeFile.mock.calls[0][1].toString('utf-8')).toBe(DATA);
  });
}

function fileManagerCopyFileTranformTest() {
  const DIR_IN = './dir/in';
  const FILENAME_IN = 'testIn.txt';
  const DIR_OUT = './dir/out';
  const FILENAME_OUT = 'testOut.txt';
  const FILE_PATH_IN = `${DIR_IN}/${FILENAME_IN}`;
  const FILE_PATH_OUT = `${DIR_OUT}/${FILENAME_OUT}`;
  const DATA = 'Data = one.txt, two.js three.exe';
  const TRANSFORMED_DATA = 'Data = TXT:one, JS:two three.exe';
  const replacements = [
    { search: /(\w+?)\.txt/g, sub: 'TXT:$1', filetype: 'TXT' },
    { search: /(\w+?)\.js/g, sub: 'JS:$1', filetype: ['JS', 'TXT'] },
    { search: /(\w+?)\.exe/g, sub: 'EXE:$1', filetype: 'EXE' },
  ];
  readFile.mockResolvedValueOnce(Buffer.from(DATA));
  return FileManager.copyFile(
    FILE_PATH_IN,
    FILE_PATH_OUT,
    new StringTransformer(replacements)
  ).then(() => {
    expect(mkdir).toHaveBeenCalledWith(DIR_OUT, { recursive: true });
    expect(readFile).toHaveBeenCalled();
    expect(readFile.mock.calls[0][0]).toMatchPath(FILE_PATH_IN);
    expect(writeFile).toHaveBeenCalled();
    expect(writeFile.mock.calls[0][0]).toMatchPath(FILE_PATH_OUT);
    expect(writeFile.mock.calls[0][1] instanceof Buffer).toBe(true);
    expect(writeFile.mock.calls[0][1].toString('utf-8')).toBe(TRANSFORMED_DATA);
  });
}

function fileManagerCopyFilesNoTranformTest() {
  const DIR_IN = './dir/in';
  const DIR_OUT = './dir/out';

  const mockedCopyFile = jest.spyOn(FileManager, 'copyFile');
  readFile.mockResolvedValue(Buffer.from('test data'));
  readdir
    .mockResolvedValueOnce(ROOTDIR_DIRENTS)
    .mockResolvedValueOnce(SUBDIR_DIRENTS);
  return FileManager.copyFiles(DIR_IN, DIR_OUT).then(() => {
    expect(mkdir).toHaveBeenCalledWith(DIR_OUT, { recursive: true });
    expect(mkdir).toHaveBeenCalledWith(nodePath.join(DIR_OUT, SUBDIR), {
      recursive: true,
    });
    expect(readFile.mock.calls).toHaveLength(5);
    expect(mockedCopyFile.mock.calls).toHaveLength(5);

    const expectations = createCopyFileExpectations(DIR_IN, DIR_OUT);
    checkCopyFileExpectataions(mockedCopyFile, expectations);
    mockedCopyFile.mockRestore();
  });
}

function fileManagerCopyFilesWithTransformTest() {
  const DIR_IN = './dir/in';
  const DIR_OUT = './dir/out';
  const mockedCopyFile = jest.spyOn(FileManager, 'copyFile');
  readFile.mockResolvedValue(Buffer.from('test data'));
  readdir
    .mockResolvedValueOnce(ROOTDIR_DIRENTS)
    .mockResolvedValueOnce(SUBDIR_DIRENTS);
  const transformer = new StringTransformer([
    { search: /test/g, sub: /TEST/, filetype: 'TXT' },
  ]);
  return FileManager.copyFiles(DIR_IN, DIR_OUT, {
    transformer: transformer,
  }).then(() => {
    expect(mkdir).toHaveBeenCalledWith(DIR_OUT, { recursive: true });
    expect(mkdir).toHaveBeenCalledWith(nodePath.join(DIR_OUT, SUBDIR), {
      recursive: true,
    });
    expect(readFile.mock.calls).toHaveLength(5);
    expect(mockedCopyFile.mock.calls).toHaveLength(5);

    const expectations = createCopyFileExpectations(
      DIR_IN,
      DIR_OUT,
      transformer
    );
    checkCopyFileExpectataions(mockedCopyFile, expectations);
    mockedCopyFile.mockRestore();
  });
}

function fileManagerCopyFilesWithFilterTest() {
  const DIR_IN = './dir/in';
  const DIR_OUT = './dir/out';

  const mockedCopyFile = jest.spyOn(FileManager, 'copyFile');
  readFile.mockResolvedValue(Buffer.from('test data'));
  readdir
    .mockResolvedValueOnce(ROOTDIR_DIRENTS)
    .mockResolvedValueOnce(SUBDIR_DIRENTS);

  const filterRe = /\w+2/;
  return FileManager.copyFiles(DIR_IN, DIR_OUT, { filter: filterRe }).then(
    () => {
      expect(mkdir).toHaveBeenCalledWith(DIR_OUT, { recursive: true });
      expect(mkdir).toHaveBeenCalledWith(nodePath.join(DIR_OUT, SUBDIR), {
        recursive: true,
      });
      expect(readFile.mock.calls).toHaveLength(2);
      expect(mockedCopyFile.mock.calls).toHaveLength(2);

      const expectations = createCopyFileExpectations(DIR_IN, DIR_OUT).filter(
        (entry) => entry.in.match(filterRe)
      );
      checkCopyFileExpectataions(mockedCopyFile, expectations);
      mockedCopyFile.mockRestore();
    }
  );
}

function doFileTypesMatchTest() {
  // strings
  expect(doFiletypesMatch('HTML', 'HTML')).toBe(true);
  expect(doFiletypesMatch('HTML', 'html')).toBe(true);
  expect(doFiletypesMatch('html', 'HTML')).toBe(true);

  expect(doFiletypesMatch('JS', 'HTML')).toBe(false);

  // arrays
  expect(doFiletypesMatch('JS', ['JS', 'HTML'])).toBe(true);
  expect(doFiletypesMatch('JS', ['js', 'html'])).toBe(true);
  expect(doFiletypesMatch('js', ['JS', 'HTML'])).toBe(true);

  expect(doFiletypesMatch('HTML', ['JS', 'HTML'])).toBe(true);
  expect(doFiletypesMatch('HTML', ['JS', 'html'])).toBe(true);
  expect(doFiletypesMatch('html', ['JS', 'HTML'])).toBe(true);

  expect(doFiletypesMatch('CSS', ['JS', 'HTML'])).toBe(false);
}

function fileManagerExtractTextTest() {
  const DATA = 'This is a _ABC_ and _ABC_\n and _ABC_ and _ABC_ test';
  const FILE_PATH = './made_up_dir/made_up_file.txt';
  readFile.mockResolvedValueOnce(Buffer.from(DATA));
  return FileManager.extractText(FILE_PATH, /_A.C_/g).then((result) => {
    expect(readFile.mock.calls[0][0]).toMatchPath(FILE_PATH);
    expect(result).toHaveLength(4);
    result.forEach((txt) => {
      expect(txt).toMatch(/^_A.C_$/);
    });
  });
}

function fileManagerGetAllMatchingFilesTest() {
  readdir.mockResolvedValueOnce(ROOTDIR_DIRENTS);
  const dir = './somepath/here';
  const filterRe = /\w+(2|3)/;
  return FileManager.getAllMatchingFiles(dir, filterRe).then((result) => {
    expect(result).toHaveLength(2);
    result.forEach((entry) => {
      expect(entry.name).toMatch(/^\w+(2|3).txt$/);
      expect(entry.path).toMatchPath(dir, entry.name);
    });
  });
}

function fileManagerCreateJsonDirListing() {
  const ROOT_DIR = './root';
  const TARGET_FILE_PATH = './root/sub1/sub2/test.json';
  const EXPECTED_RESULT = {
    meta: {},
    location:
      nodePath
        .relative(nodePath.dirname(TARGET_FILE_PATH), ROOT_DIR)
        .replace('\\', '/') + '/',
    files: ['root1.txt', 'root2.txt', 'root3.txt'],
  };

  readdir.mockResolvedValueOnce(ROOTDIR_DIRENTS);
  return FileManager.createJsonDirListing(ROOT_DIR, TARGET_FILE_PATH).then(
    () => {
      expect(readdir).toHaveBeenCalledTimes(1);
      expect(readdir.mock.calls[0][0]).toMatchPath(ROOT_DIR);
      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile.mock.calls[0][0]).toMatchPath(TARGET_FILE_PATH);
      const dirObj = JSON.parse(writeFile.mock.calls[0][1]);
      expect(dirObj).toEqual(EXPECTED_RESULT);
    }
  );
}

function fileManagerCreateJsonDirListingFiltered() {
  const ROOT_DIR = './root';
  const TARGET_FILE_PATH = './root/sub1/sub2/test.json';
  const EXPECTED_RESULT = {
    meta: {},
    location:
      nodePath
        .relative(nodePath.dirname(TARGET_FILE_PATH), ROOT_DIR)
        .replace('\\', '/') + '/',
    files: ['root1.txt', 'root3.txt'],
  };

  readdir.mockResolvedValueOnce(ROOTDIR_DIRENTS);
  return FileManager.createJsonDirListing(ROOT_DIR, TARGET_FILE_PATH, {
    filterRe: /\w(1|3)\.txt/,
  }).then(() => {
    expect(readdir).toHaveBeenCalledTimes(1);
    expect(readdir.mock.calls[0][0]).toMatchPath(ROOT_DIR);
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile.mock.calls[0][0]).toMatchPath(TARGET_FILE_PATH);
    const dirObj = JSON.parse(writeFile.mock.calls[0][1]);
    expect(dirObj).toEqual(EXPECTED_RESULT);
  });
}

function fileManagerCreateJsonDirListingMeta() {
  const ROOT_DIR = './root';
  const TARGET_FILE_PATH = './root/sub1/sub2/test.json';
  const EXPECTED_RESULT = {
    meta: { base: 'one' },
    location:
      nodePath
        .relative(nodePath.dirname(TARGET_FILE_PATH), ROOT_DIR)
        .replace('\\', '/') + '/',
    files: ['root1.txt', 'root3.txt'],
  };

  readdir.mockResolvedValueOnce(ROOTDIR_DIRENTS);
  return FileManager.createJsonDirListing(ROOT_DIR, TARGET_FILE_PATH, {
    metaData: { base: 'one' },
    filterRe: /\w(1|3)\.txt/,
  }).then(() => {
    expect(readdir).toHaveBeenCalledTimes(1);
    expect(readdir.mock.calls[0][0]).toMatchPath(ROOT_DIR);
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile.mock.calls[0][0]).toMatchPath(TARGET_FILE_PATH);
    const dirObj = JSON.parse(writeFile.mock.calls[0][1]);
    expect(dirObj).toEqual(EXPECTED_RESULT);
  });
}

function stringTransformerTransformTest() {
  const replacements = [
    { search: /_\d{4}(Test)_/g, sub: '[$1]', filetype: 'TXT' },
    { search: /_ABC_/g, sub: '!DEF!', filetype: 'JS' },
    { search: /<dir>/g, sub: '!DIR!>', filetype: 'txt' },
  ];

  const TRANSFORMS_TEXT = `
  _1234Test_ and _1234Test_ and _1234Test_
  _ABC_ and _ABC_and _ABC_
  <dir> and <dir> and <dir>
  _ABC_ and _ABC_and _ABC_
  _1234Test_ and _1234Test_ and _1234Test_
  `;
  const stringTransformer = new StringTransformer(replacements);
  const bufferIn = Buffer.from(TRANSFORMS_TEXT);

  var bufferOut = stringTransformer.transform(bufferIn, 'TXT');
  var contents = bufferOut.toString('utf-8');
  expect(contents.match(/\d{4}Test/g)).toBeNull();
  expect(contents.match(/\[Test\]/g).length).toBe(6);

  expect(contents.match(/_ABC_/g).length).toBe(6);
  expect(contents.match(/!DEF!/g)).toBeNull();

  expect(contents.match(/<dir>/g)).toBeNull();
  expect(contents.match(/!DIR!/g).length).toBe(3);

  bufferOut = stringTransformer.transform(bufferIn, 'JS');
  contents = bufferOut.toString('utf-8');
  expect(contents.match(/\d{4}Test/g).length).toBe(6);
  expect(contents.match(/\[Test\]/g)).toBeNull();

  expect(contents.match(/_ABC_/g)).toBeNull();
  expect(contents.match(/!DEF!/g).length).toBe(6);

  expect(contents.match(/<dir>/g).length).toBe(3);
  expect(contents.match(/!DIR!/g)).toBeNull();
}

function cssTransformTest() {
  const TRANSFORMS_TEXT = `
  /* remove*/
  keep
  /* remove
   * remove
   * remove
   */
  keep
  `;
  const bufferIn = Buffer.from(TRANSFORMS_TEXT);

  var bufferOut = CSS_TRANSFORMER.transform(bufferIn, 'CSS');
  var contents = bufferOut.toString('utf-8');
  expect(contents.match(/remove/g)).toBeNull();
  expect(contents.match(/keep/g).length).toBe(2);
}
