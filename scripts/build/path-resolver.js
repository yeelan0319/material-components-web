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

const fsx = require('fs-extra');
const path = require('path');

const PROJECT_ROOT_ABSOLUTE_PATH = path.resolve(path.join(__dirname, '../../'));

// TODO(acdvorak): For better testability, export a class instead
module.exports = {
  getAbsolutePath,
  getRelativePath,
};

/**
 * Resolves zero or more path portions (relative to the project root) into a single absolute filesystem path.
 *
 * Examples:
 *
 * // First argument is a relative directory path
 * > getAbsolutePath('/test/screenshot', 'out/main', 'foo.css')
 *     === '/Users/betty/mdc-web/test/screenshot/out/main/foo.css'
 *
 * // First argument is an absolute directory path
 * > getAbsolutePath('/Users/betty/mdc-web', '/test/screenshot', 'out/main', 'foo.css')
 *     === '/Users/betty/mdc-web/test/screenshot/out/main/foo.css'
 *
 * // No arguments (returns the project root)
 * > getAbsolutePath()
 *     === '/Users/betty/mdc-web'
 *
 * @param {...string} pathPartsRelativeToProjectRoot Zero or more portions of a filesystem path.
 *   The first argument must be either a relative path from the project root (e.g., '/test/screenshot'),
 *   or an absolute path to an existing directory (e.g., '/Users/betty/mdc-web/test/screenshot').
 *   All subsequent arguments are concatenated onto the first argument, with each part separated by a single OS-specific
 *   directory separator character (`/` on *nix, `\` on Windows).
 * @return {string}
 */
function getAbsolutePath(...pathPartsRelativeToProjectRoot) {
  // First argument is already an absolute path
  if (fsx.existsSync(pathPartsRelativeToProjectRoot[0])) {
    return path.resolve(path.join(...pathPartsRelativeToProjectRoot));
  }
  // First argument is a path relative to the repo root
  return path.resolve(path.join(PROJECT_ROOT_ABSOLUTE_PATH, ...pathPartsRelativeToProjectRoot));
}

function getRelativePath(absolutePathToFile, absolutePathToRoot = PROJECT_ROOT_ABSOLUTE_PATH) {
  return path.relative(absolutePathToRoot, absolutePathToFile);
}
