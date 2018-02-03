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

const assert = require('chai').assert;
const path = require('path');

const ConfigLoader = require('./config-loader');
const configLoader = new ConfigLoader();

describe('webpack.config.js', function() {
  describe('MDC_ENV=""', function() {
    it('module exports should match build-no-env.golden.txt', function() {
      const {generatedWebpackConfig, expectedWebpackConfig} = configLoader.setupTest({
        configPath: path.join(__dirname, '../../webpack.config.js'),
        goldenPath: path.join(__dirname, './goldens/build-no-env.golden.txt'),
        mdcEnv: '',
      });
      assert.equal(generatedWebpackConfig, expectedWebpackConfig);
    });
  });

  describe('MDC_ENV="production"', function() {
    it('module exports should match build-prod-env.golden.txt', function() {
      const {generatedWebpackConfig, expectedWebpackConfig} = configLoader.setupTest({
        configPath: path.join(__dirname, '../../webpack.config.js'),
        goldenPath: path.join(__dirname, './goldens/build-prod-env.golden.txt'),
        mdcEnv: 'production',
      });
      assert.equal(generatedWebpackConfig, expectedWebpackConfig);
    });
  });

  describe('MDC_ENV="development"', function() {
    it('module exports should match build-dev-env.golden.txt', function() {
      const {generatedWebpackConfig, expectedWebpackConfig} = configLoader.setupTest({
        configPath: path.join(__dirname, '../../webpack.config.js'),
        goldenPath: path.join(__dirname, './goldens/build-dev-env.golden.txt'),
        mdcEnv: 'development',
      });
      assert.equal(generatedWebpackConfig, expectedWebpackConfig);
    });
  });
});
