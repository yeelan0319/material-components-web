/**
 * Copyright 2016 Google Inc. All Rights Reserved.
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
const glob = require('glob');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  createWebpackCompilerPlugin,
  createCssExtractTextPlugin,
  createCssJsCleanupPlugin,
  createCopyrightBannerPlugin,
};

function createWebpackCompilerPlugin(eventName, callback) {
  return {
    apply(compiler) {
      compiler.plugin(eventName, (...args) => callback(...args, compiler));
    },
  };
}

function createCssExtractTextPlugin(cssFilenameOutputPattern) {
  return new ExtractTextPlugin(cssFilenameOutputPattern);
}

function createCssJsCleanupPlugin(outputDirAbs) {
  return createWebpackCompilerPlugin('done', () => {
    glob.sync(path.join(outputDirAbs, '**/*.css.js*')).forEach((absPath) => {
      fsx.removeSync(absPath);
    });
  });
}

function createCopyrightBannerPlugin() {
  return new webpack.BannerPlugin({
    banner: [
      '/*!',
      ' Material Components for the web',
      ` Copyright (c) ${new Date().getFullYear()} Google Inc.`,
      ' License: Apache-2.0',
      '*/',
    ].join('\n'),
    raw: true,
    entryOnly: true,
  });
}
