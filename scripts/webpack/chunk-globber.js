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

const PathResolver = require('../build/path-resolver');
const glob = require('glob');
const path = require('path');

const PROJECT_ROOT_ABSOLUTE_PATH = path.resolve(path.join(__dirname, '../../'));

// TODO(acdvorak): For better testability, export a class instead
module.exports = {
  globChunks,
};

function globChunks({filePathPattern, inputDirectory = PROJECT_ROOT_ABSOLUTE_PATH}) {
  const chunks = {};
  inputDirectory = PathResolver.getAbsolutePath(inputDirectory);

  glob.sync(PathResolver.getAbsolutePath(inputDirectory, filePathPattern)).forEach((absolutePathToFile) => {
    const relativePath = PathResolver.getRelativePath(absolutePathToFile, inputDirectory);
    const filename = path.basename(absolutePathToFile);

    // Ignore import-only Sass files.
    if (filename.charAt(0) === '_') {
      return;
    }

    const entryName = stripFileExtension_(relativePath);
    chunks[entryName] = absolutePathToFile;
  });

  return chunks;
}

function stripFileExtension_(filePath) {
  return filePath.replace(/\.\w+$/, '');
}
