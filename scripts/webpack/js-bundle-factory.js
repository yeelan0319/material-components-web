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

const JS_SOURCE_MAP = true;
const JS_DEVTOOL = JS_SOURCE_MAP ? 'source-map' : false;

module.exports = class JsBundleFactory {
  constructor({
    pathResolver,
    globber,
    pluginFactory,
  } = {}) {
    /** @type {!PathResolver} */
    this.pathResolver_ = pathResolver;

    /** @type {!Globber} */
    this.globber_ = globber;

    /** @type {!PluginFactory} */
    this.pluginFactory_ = pluginFactory;
  }

  createCustomJs(
    {
      bundleName,
      chunks,
      chunkGlobConfig: {
        inputDirectory = null,
        filePathPattern = null,
      } = {},
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
        filenamePattern = '[name].js',
        library,
      },
      plugins = [],
    }) {
    chunks = chunks || this.globber_.getChunks({inputDirectory, filePathPattern});

    return {
      name: bundleName,
      entry: chunks,
      output: {
        path: fsDirAbsolutePath,
        publicPath: httpDirAbsolutePath,
        filename: filenamePattern,
        libraryTarget: 'umd',
        library,
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
        this.pluginFactory_.createCopyrightBannerPlugin(),
        ...plugins,
      ],
    };
  }

  createMainJs(
    {
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
      },
    }) {
    return this.createCustomJs({
      bundleName: 'main-js',
      chunks: this.pathResolver_.getAbsolutePath('/packages/material-components-web/index.js'),
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
        filenamePattern: 'material-components-web.js',
        library: 'mdc',
      },
    });
  }
};
