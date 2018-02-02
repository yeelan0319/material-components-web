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
const glob = require('glob');
const path = require('path');

module.exports = class CssCleanupPlugin {
  constructor(outputDirAbsolutePath) {
    this.outputDirAbsolutePath_ = outputDirAbsolutePath;
  }

  apply(compiler) {
    compiler.plugin('done', () => this.nukeEm_());
  }

  nukeEm_() {
    // https://youtu.be/SNAK21fcVzU
    glob.sync(path.join(this.outputDirAbsolutePath_, '**/*.css.js*')).forEach((absolutePath) => {
      fsx.removeSync(absolutePath);
    });
  }
};
