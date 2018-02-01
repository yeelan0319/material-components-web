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

const path = require('path');
const fsx = require('fs-extra');

module.exports = {
  absolutePath,
  relativePath,
};

function absolutePath(...pathParts) {
  // First argument is already an absolute path
  if (fsx.existsSync(pathParts[0])) {
    return path.resolve(path.join(...pathParts));
  }
  // First argument is a path relative to the repo root
  return path.resolve(path.join(__dirname, '../../', ...pathParts));
}

function relativePath(absPath) {
  const absRoot = path.resolve(path.join(__dirname, '../../'));
  if (absPath.indexOf(absRoot) === 0) {
    return absPath.substr(absRoot.length + 1);
  }
  return absPath;
}
