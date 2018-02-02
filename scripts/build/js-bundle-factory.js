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

const CopyrightBannerPlugin = require('./copyright-banner-plugin');
const PathResolver = require('./path-resolver');

const JS_SOURCE_MAP = true;
const JS_DEVTOOL = JS_SOURCE_MAP ? 'source-map' : false;

module.exports = {
  createCustomJsBundle,
  createMainJsBundle,
};

function createCustomJsBundle(
  {
    bundleName,
    chunks,
    output: {
      fsDirAbsolutePath,
      httpDirAbsolutePath,
      filenamePattern = '[name].js',
      library,
      ...customOutputProps // TODO(acdvorak): Figure out how to disable eslint comma-dangle rule for this line
    },
    plugins = [],
  }) {
  return {
    name: bundleName,
    entry: chunks,
    output: {
      path: fsDirAbsolutePath,
      publicPath: httpDirAbsolutePath,
      filename: filenamePattern,
      libraryTarget: 'umd',
      library,
      ...customOutputProps,
    },
    // See https://github.com/webpack/webpack-dev-server/issues/882
    // Because we only spin up dev servers temporarily, and all of our assets are publicly
    // available on GitHub, we can safely disable this check.
    devServer: {
      disableHostCheck: true,
    },
    devtool: JS_DEVTOOL,
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      }],
    },
    plugins: [
      new CopyrightBannerPlugin(),
      ...plugins,
    ],
  };
}

function createMainJsBundle(
  {
    output: {
      fsDirAbsolutePath,
      httpDirAbsolutePath,
      ...customOutputProps
    },
  }) {
  return createCustomJsBundle({
    bundleName: 'main-js',
    chunks: PathResolver.getAbsolutePath('/packages/material-components-web/index.js'),
    output: {
      fsDirAbsolutePath,
      httpDirAbsolutePath,
      filenamePattern: 'material-components-web.js',
      library: 'mdc',
      ...customOutputProps,
    },
  });
}
