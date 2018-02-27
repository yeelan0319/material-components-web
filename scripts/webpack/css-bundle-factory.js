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

/**
 * @fileoverview Creates Webpack bundle config objects to compile Sass files to CSS.
 */

'use strict';

const autoprefixer = require('autoprefixer');

module.exports = class {
  constructor({
    env,
    pathResolver,
    globber,
    pluginFactory,
    autoprefixerLib = autoprefixer,
  } = {}) {
    /** @type {!Environment} */
    this.env_ = env;

    /** @type {!PathResolver} */
    this.pathResolver_ = pathResolver;

    /** @type {!Globber} */
    this.globber_ = globber;

    /** @type {!PluginFactory} */
    this.pluginFactory_ = pluginFactory;

    /** @type {function(opts: ...*=)} */
    this.autoprefixerLib_ = autoprefixerLib;
  }

  createCustomCss(
    {
      bundleName,
      chunks,
      chunkGlobConfig: {
        inputDirectory = null,
        filePathPattern = '**/*.scss',
      } = {},
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
        filenamePattern = this.env_.isProd() ? '[name].min.css' : '[name].css',
      },
      plugins = [],
    }) {
    chunks = chunks || this.globber_.getChunks({inputDirectory, filePathPattern});
    const cssExtractorPlugin = this.pluginFactory_.createCssExtractorPlugin(filenamePattern);

    return {
      name: bundleName,
      entry: chunks,
      output: {
        path: fsDirAbsolutePath,
        publicPath: httpDirAbsolutePath,
        filename: `${filenamePattern}.js`, // Webpack 3.x emits CSS wrapped in a JS file (cssExtractorPlugin unwraps it)
      },
      devtool: 'source-map',
      module: {
        rules: [{
          test: /\.scss$/,
          use: this.createCssLoader_(cssExtractorPlugin),
        }],
      },
      plugins: [
        cssExtractorPlugin,
        this.pluginFactory_.createCssCleanupPlugin({
          cleanupDirRelativePath: fsDirAbsolutePath,
        }),
        ...plugins,
      ],
    };
  }

  createMainCssCombined(
    {
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
      },
      plugins = [],
    }) {
    const getAbsolutePath = (...args) => this.pathResolver_.getAbsolutePath(...args);

    return this.createCustomCss({
      bundleName: 'main-css-combined',
      chunks: {
        'hmdc': getAbsolutePath('/packages/hmdc/hmdc.scss'),
      },
      output: {
        fsDirAbsolutePath,
        httpDirAbsolutePath,
      },
      plugins: [
        ...plugins,
      ],
    });
  }

  createCssLoader_(extractTextPlugin) {
    const getAbsolutePath = (...args) => this.pathResolver_.getAbsolutePath(...args);

    return extractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: () => [this.autoprefixerLib_({grid: false})],
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            includePaths: [getAbsolutePath('node_modules')],
          },
        },
      ],
    });
  }
};
