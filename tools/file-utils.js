/**
 * @file Utility functions for dealing with files
 * @module tools/file-utils
 *
 * @license GPL-3.0-or-later
 * Lesson RunnerCreate quizzes and lessons from plain text files.
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

import * as fsPromises from 'node:fs/promises';
import * as nodePath from 'node:path';
import { Buffer } from 'node:buffer';
import * as crypto from 'node:crypto';

/**
 * @typedef {object} Replacement
 * @property {RegExp} search - search value. The JavaScript
 *  replaceAll method is used, so the Regex must be global.
 * @property {string} sub - the substitution value. The JavaScript
 *  replaceAll method is used, so captured groups can be used.
 * @property {!string | string[]} filetype - the filetypes that the replacement
 *  applies to. This is effectively the uppercase file extension without the
 *  dot.
 */

/**
 * @interface BufferTransformer
 */

/**
 * @function
 * @name BufferTransformer#transfom
 * @param {Buffer} buffer - the buffer to transform
 * @return {Buffer} copy of the buffer with any transformations applied.
 *  If not tranformations are defined, a reference to the original, untouched,
 *  buffer is returned.
 */

/**
 * Check if the filetype matches the transforme filetype.
 * Although filetypes should be uppercase, the function will convert before
 * testing. Note that filetypes are effectively the upper case file extension
 * without the dot.
 * @param {string} filetype - the file type to test the transform against.
 * @param {string | string[]} - the transformer's filetypes
 */
export function doFiletypesMatch(filetype, transformFileType) {
  if (Array.isArray(transformFileType)) {
    for (const filetypeEntry of transformFileType) {
      if (filetypeEntry.toUpperCase() === filetype.toUpperCase()) {
        return true;
      }
    }
    return false;
  } else {
    return transformFileType.toUpperCase() === filetype.toUpperCase();
  }
}

/**
 * Replace strings using an array of Replacement definitions.
 * @implements {BufferTransformer}
 */
export class StringTransformer {
  /**
   *
   * @param {Replacement[]} replacements - replacements to apply
   */
  constructor(replacements) {
    this.replacements = replacements;
  }

  /**
   * @see BufferTransformer#transfom
   */
  transform(buffer, filetype) {
    if (!this.replacements || this.replacements.length === 0) {
      console.debug('Transformer has no replacements to apply.');
      return buffer;
    }

    /** check if any replacements should be applied */
    let applyTransforms = false;
    this.replacements.forEach((replacement) => {
      if (doFiletypesMatch(filetype, replacement.filetype)) {
        applyTransforms = true;
      }
    });
    if (!applyTransforms) {
      return buffer;
    }

    let contents = buffer.toString('utf-8');

    this.replacements.forEach((replacement) => {
      if (doFiletypesMatch(filetype, replacement.filetype)) {
        contents = contents.replaceAll(replacement.search, replacement.sub);
      }
    });
    return Buffer.from(contents, 'utf-8');
  }
}

/**
 * CSS transformer. This removes comments except those where the starting comment
 * marker is immediately followed by an exclamation mark; i.e /*!
 */
export const CSS_TRANSFORMER = new StringTransformer([
  {
    search: /\/\*[^!](?:.|\s)*?\*\//gm,
    sub: '',
    filetype: 'CSS',
  },
]);

/**
 * Wrapper for StringTransformer which collects replacements i18n strings and
 * replaces them with a keyword.
 *
 * The I18n strings must be be template literals with an i18n tag function.
 * a keyword version. @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals | template literals}
 * for more details
 * @implements {BufferTransformer}
 */
export class I18nTransformer {
  /**
   * Performs
   * @param {Translations} translatedStrings - translated strings.
   */
  constructor(translatedStrings) {
    const replacements = [
      {
        search: /i18n`(?!\w+::)(.*?)`/g,
        sub: (match, contents) => {
          const hash = crypto
            .createHash('md5')
            .update('some_string')
            .digest('hex');
          const result = `i18n\`${hash}::${contents}\``;
          translatedStrings.push(result);
          return result;
        },
      },
    ];
    this.transformer = new StringTransformer(replacements);
  }

  /**
   * @see BufferTransformer#transfom
   */
  transform(buffer, filetype) {
    return this.transformer.transform(buffer, filetype);
  }
  /**
   *
   * @returns The translated strings.
   */
  getTranslatedStrings() {
    return this.translations;
  }
}

/**
 * Utility class containing methods to assist with the movement and
 * transformation of files as part of the build process.
 */
export class FileManager {
  /**
   * Create a directory. This is just a wrapper for fsPromises.mkdir.
   * All required parent directories will also be created.
   * @param {string} path
   * @returns {Promise} Fulfils to undefined on success.
   */
  static makeDir(path) {
    return fsPromises.mkdir(path, { recursive: true });
  }
  /**
   * Remove directory. It's contents are removed but the directory will remain.
   * @param {*} path
   * @returns Promise which resolves to undefined on success.
   */
  static removeDir(path) {
    return fsPromises.rm(path, { force: true, recursive: true });
  }

  /**
   * Clean directory. It's contents are removed but the directory will remain.
   * @param {*} path
   * @returns Promise which resolves to undefined on success.
   */
  static cleanDir(path) {
    return FileManager.removeDir(path).then(() =>
      fsPromises.mkdir(path, { recursive: true })
    );
  }

  /**
   * Get the basename from the path. Safely handles Posix or Windows paths.
   * @param {string} path
   * @returns {string} the basename.
   */
  static getBasename(path) {
    if (path.match(/(?:\w:\\\\)|\\/g)) {
      return nodePath.win32.basename(path);
    } else {
      return nodePath.posix.basename(path);
    }
  }

  /**
   *
   * @param {string} path - the file path
   * @returns {string} the file type. This is just the extension in uppercase
   *    and without the preceeding .
   */
  static getFileType(path) {
    return path ? nodePath.extname(path).toUpperCase().substring(1) : '';
  }

  /**
   * Copy files to the destination but apply any replacements to the file.
   * Replacements are set by @see this.setReplacements.
   * @param {*} sourceFilePath - path of source file
   * @param {string} targetFilePath - path of target file to write to.
   * @param {BufferTransform} transform - object that implements the
   *  BufferTransformer interface.
   * @returns {Promise} Fulfills with target path on success.
   */
  static copyFile(sourceFilePath, targetFilePath, bufferTransformer) {
    const targetDir = nodePath.dirname(targetFilePath);
    return fsPromises
      .mkdir(targetDir, { recursive: true })
      .then(() => fsPromises.readFile(sourceFilePath))
      .then((buffer) => {
        if (bufferTransformer) {
          buffer = bufferTransformer.transform(
            buffer,
            FileManager.getFileType(sourceFilePath)
          );
        }
        return fsPromises.writeFile(targetFilePath, buffer);
      })
      .then(() => {
        return targetFilePath;
      });
  }

  /**
   * Copy all the files from the source Dir to the targetDir. The operation is
   * recursive
   * @param {string} sourceDir
   * @param {string} targetDir
   * @param {object} [options] - options for the copy
   * @param {RegExp} [options.filter] - filter for file names to include.
   * @param {BufferTransformer} [options.transformer] - transformer
   *  to apply
   * @returns Promise that resolves to an array of the target files created.
   */
  static copyFiles(sourceDir, targetDir, options) {
    options = options ?? {};
    console.log(`Copy files from ${sourceDir} to ${targetDir}`);
    return fsPromises
      .mkdir(targetDir, { recursive: true })
      .then(() => fsPromises.readdir(sourceDir, { withFileTypes: true }))
      .then((files) => {
        const promises = [];
        for (const file of files) {
          if (file.isDirectory()) {
            promises.push(
              this.copyFiles(
                nodePath.join(sourceDir, file.name),
                nodePath.join(targetDir, file.name),
                options
              )
            );
          } else {
            if (!options.filter || file.name.match(options.filter)) {
              promises.push(
                FileManager.copyFile(
                  nodePath.join(sourceDir, file.name),
                  nodePath.join(targetDir, file.name),
                  options.transformer
                )
              );
            }
          }
        }
        return Promise.all(promises);
      });
  }

  /**
   * Extract all strings from a file that match the regex
   * @param {string} sourceFilePath
   * @param {RegExp} regex
   * @returns {Promise} Fulfills to an array of captured strings.
   * This will be null if no matches.
   */
  static extractText(sourceFilePath, regex) {
    return fsPromises.readFile(sourceFilePath).then((buffer) => {
      const matches = buffer.toString('utf-8').match(regex);
      return matches ?? [];
    });
  }

  /**
   * Get all the files in the path that match the filter. The method is not
   * recursive and ignores directories.
   * @typedef {Object} FileDetails
   * @property {string} name - the file name
   * @property {string} path - the path of the file
   *
   * @param {!string} path - path
   * @param {!RegExp} filterRe - filter to match
   * @returns {Promise} fulfils to array of FileDetails.
   */
  static getAllMatchingFiles(path, filterRe) {
    console.log(`getAllMatchingFiles ${path} Filter ${filterRe}`);
    return fsPromises.readdir(path, { withFileTypes: true }).then((dirents) => {
      const files = [];
      for (const entry of dirents) {
        if (!entry.isDirectory() && entry.name.match(filterRe)) {
          files.push({
            name: entry.name,
            path: nodePath.join(path, entry.name),
          });
        }
      }
      return files;
    });
  }

  /**
   *
   * @param {string} sourceDir - location of directory to list.
   * @param {string} destinationFilePath - json file to write
   * @param {Object} config - configuration settings.
   * @param {RegExp} config.filterRe - filter to restrict files recorded.
   * @param {Object} metaData - additional object to include in the listing. This
   * appears as the **meta** property.
   * @returns {Promise} fulfils to undefined on success.
   */
  static createJsonDirListing(sourceDir, destinationFilePath, config) {
    const metaData = config && config.metaData ? config.metaData : {};
    const filterRe = config && config.filterRe ? config.filterRe : /.*/;
    const destinationDir = nodePath.dirname(destinationFilePath);
    const relPath = nodePath
      .relative(destinationDir, sourceDir)
      .replace('\\', '/');

    return FileManager.getAllMatchingFiles(sourceDir, filterRe).then(
      (result) => {
        const directory = {
          meta: metaData,
          location: relPath + '/',
          files: [],
        };
        result.forEach((entry) => {
          directory.files.push(entry.name);
        });
        return fsPromises.writeFile(
          destinationFilePath,
          JSON.stringify(directory, null, 2)
        );
      }
    );
  }
}

export default FileManager;
