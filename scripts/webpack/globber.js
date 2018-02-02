/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

module.exports = class Globber {
  constructor({
    pathResolver,
    globLib = require('glob'),
  } = {}) {
    /** @type {!PathResolver} */
    this.pathResolver_ = pathResolver;

    /** @type {!GlobLib} */
    this.globLib_ = globLib;
  }

  /**
   * @param {...string} pathPatterns
   * @return {!Array<string>}
   */
  getAbsolutePaths(...pathPatterns) {
    // TODO(acdvorak): Simplify this mountain of code
    const relativePathPatterns = pathPatterns.map((pathPattern) => {
      const absolutePath = this.pathResolver_.getAbsolutePath(pathPattern);
      return this.pathResolver_.getRelativePath(absolutePath);
    });
    const pathPattern = this.pathResolver_.join(...relativePathPatterns);
    const absolutePathPattern = this.pathResolver_.getAbsolutePath(pathPattern);
    const relativePathPattern = this.pathResolver_.getRelativePath(absolutePathPattern);
    const projectRootAbsolutePath = this.pathResolver_.getProjectRootAbsolutePath();
    const relativePaths = this.globLib_.sync(relativePathPattern, {cwd: projectRootAbsolutePath});
    return relativePaths.map((relativePath) => {
      return this.pathResolver_.getAbsolutePath(relativePath);
    });
  }

  getChunks({filePathPattern, inputDirectory = this.pathResolver_.getProjectRootAbsolutePath()}) {
    const chunks = {};
    const inputDirectoryAbsolutePath = this.pathResolver_.getAbsolutePath(inputDirectory);
    const inputFileAbsolutePathPattern = this.pathResolver_.getAbsolutePath(inputDirectory, filePathPattern);
    const inputFileRelativePathPattern = this.pathResolver_.getRelativePath(inputFileAbsolutePathPattern);
    const absolutePaths = this.getAbsolutePaths(inputFileRelativePathPattern);

    absolutePaths.forEach((absolutePathToInputFile) => {
      const relativePath = this.pathResolver_.getRelativePath(absolutePathToInputFile, inputDirectoryAbsolutePath);
      const relativePathWithoutExtension = this.pathResolver_.removeFileExtension(relativePath);
      const filename = this.pathResolver_.getFilename(absolutePathToInputFile);

      // Ignore import-only files
      if (filename.charAt(0) === '_') {
        return;
      }

      chunks[relativePathWithoutExtension] = absolutePathToInputFile;
    });

    return chunks;
  }
};

// eslint-disable

/** @record */
class GlobLib {
  /**
   * @param {string} pattern
   * @param {!Object=} options
   * @return {!Array<string>}
   */
  sync(pattern, options = {}) {}
}

// eslint-enable
