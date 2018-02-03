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

const fsx = require('fs-extra');
const path = require('path');
const util = require('util');

const requireFresh = require('./require-fresh');

const PROJECT_ROOT_ABSOLUTE_PATH = path.resolve(__dirname, '../../');

function redactProjectRootPath(str) {
  return str.split(PROJECT_ROOT_ABSOLUTE_PATH).join('');
}

class EnvMocker {
  constructor() {
    this.saved_ = new Map();
  }

  mock(key, value) {
    this.saved_[key] = process.env[key];
    process.env[key] = value;
  }

  restoreAll() {
    this.saved_.forEach((value, key) => {
      process.env[key] = value;
    });
  }
}

module.exports = class ConfigLoader {
  setupTest({
    configPath,
    goldenPath,
    npmCmd,
    mdcEnv = '',
    bootstrapGolden = false,
  }) {
    const envMocker = new EnvMocker();

    envMocker.mock('npm_lifecycle_event', npmCmd);
    envMocker.mock('MDC_ENV', mdcEnv);

    const fsTextOpts = {encoding: 'utf8'};
    const generatedWebpackConfig = redactProjectRootPath(util.inspect(requireFresh(configPath)));

    if (bootstrapGolden) {
      fsx.writeFileSync(goldenPath, generatedWebpackConfig, fsTextOpts);
    }

    const expectedWebpackConfig = redactProjectRootPath(fsx.readFileSync(goldenPath, fsTextOpts));

    envMocker.restoreAll();

    return {
      generatedWebpackConfig,
      expectedWebpackConfig,
    };
  }
};
