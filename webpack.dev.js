/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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

const express = require('express');
const fsx = require('fs-extra');
const glob = require('glob');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const LIFECYCLE_EVENT = process.env.npm_lifecycle_event;
if (LIFECYCLE_EVENT === 'test' || LIFECYCLE_EVENT === 'test:watch') {
  process.env.BABEL_ENV = 'test';
}

const RUN_SERVER = /^dev($|:)/.test(LIFECYCLE_EVENT);

function resolvePath(...relativePathParts) {
  return path.resolve(path.join(__dirname, ...relativePathParts));
}

const MAIN_OUTPUT_DIR_REL = '/out/main/';
const MAIN_OUTPUT_DIR_ABS = resolvePath('./test/screenshot', MAIN_OUTPUT_DIR_REL);

const TEST_OUTPUT_DIR_REL = '/out/test/';
const TEST_OUTPUT_DIR_ABS = resolvePath('./test/screenshot', TEST_OUTPUT_DIR_REL);

const JS_FILENAME_OUTPUT_PATTERN = '[name].js';
const CSS_FILENAME_OUTPUT_PATTERN = '[name].css';
const CSS_JS_FILENAME_OUTPUT_PATTERN = '[name].css.js';

const CSS_SOURCE_MAP = false;
const JS_SOURCE_MAP = true;

const CSS_DEVTOOL = CSS_SOURCE_MAP ? 'source-map' : false;
const JS_DEVTOOL = JS_SOURCE_MAP ? 'source-map' : false;

function createWebpackPlugin(eventName, callback) {
  return {
    apply(compiler) {
      compiler.plugin(eventName, (...args) => callback(...args));
    },
  };
}

function createCssExtractTextPlugin() {
  return new ExtractTextPlugin(CSS_FILENAME_OUTPUT_PATTERN);
}

function createCssJsCleanupPlugin() {
  return createWebpackPlugin('done', () => {
    glob.sync(path.join(MAIN_OUTPUT_DIR_ABS, '**/*.css.js')).forEach((absPath) => {
      fsx.removeSync(absPath);
    });
    glob.sync(path.join(TEST_OUTPUT_DIR_ABS, '**/*.css.js')).forEach((absPath) => {
      fsx.removeSync(absPath);
    });
  });
}

function createBannerPlugin() {
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

function createCssLoaderConfig() {
  return ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
      {
        loader: 'css-loader',
        options: {
          sourceMap: CSS_SOURCE_MAP,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: CSS_SOURCE_MAP,
          plugins: () => [require('autoprefixer')({grid: false})],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: CSS_SOURCE_MAP,
          includePaths: glob.sync('./packages/*/node_modules').map((relPath) => resolvePath(relPath)),
        },
      },
    ],
  });
}

function createMainJsEntry() {
  return {
    name: 'main-js',
    entry: resolvePath('./packages/material-components-web/index.js'),
    output: {
      path: MAIN_OUTPUT_DIR_ABS,
      publicPath: MAIN_OUTPUT_DIR_REL,
      filename: 'material-components-web.js',
      libraryTarget: 'umd',
      library: 'mdc',
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
      createBannerPlugin(),
    ],
  };
}

function createMainCssEntry() {
  return {
    name: 'main-css',
    entry: {
      'mdc.button': resolvePath('./packages/mdc-button/mdc-button.scss'),
      'mdc.card': resolvePath('./packages/mdc-card/mdc-card.scss'),
      'mdc.checkbox': resolvePath('./packages/mdc-checkbox/mdc-checkbox.scss'),
      'mdc.dialog': resolvePath('./packages/mdc-dialog/mdc-dialog.scss'),
      'mdc.drawer': resolvePath('./packages/mdc-drawer/mdc-drawer.scss'),
      'mdc.elevation': resolvePath('./packages/mdc-elevation/mdc-elevation.scss'),
      'mdc.fab': resolvePath('./packages/mdc-fab/mdc-fab.scss'),
      'mdc.form-field': resolvePath('./packages/mdc-form-field/mdc-form-field.scss'),
      'mdc.grid-list': resolvePath('./packages/mdc-grid-list/mdc-grid-list.scss'),
      'mdc.icon-toggle': resolvePath('./packages/mdc-icon-toggle/mdc-icon-toggle.scss'),
      'mdc.layout-grid': resolvePath('./packages/mdc-layout-grid/mdc-layout-grid.scss'),
      'mdc.linear-progress': resolvePath('./packages/mdc-linear-progress/mdc-linear-progress.scss'),
      'mdc.list': resolvePath('./packages/mdc-list/mdc-list.scss'),
      'mdc.menu': resolvePath('./packages/mdc-menu/mdc-menu.scss'),
      'mdc.radio': resolvePath('./packages/mdc-radio/mdc-radio.scss'),
      'mdc.ripple': resolvePath('./packages/mdc-ripple/mdc-ripple.scss'),
      'mdc.select': resolvePath('./packages/mdc-select/mdc-select.scss'),
      'mdc.slider': resolvePath('./packages/mdc-slider/mdc-slider.scss'),
      'mdc.snackbar': resolvePath('./packages/mdc-snackbar/mdc-snackbar.scss'),
      'mdc.switch': resolvePath('./packages/mdc-switch/mdc-switch.scss'),
      'mdc.tabs': resolvePath('./packages/mdc-tabs/mdc-tabs.scss'),
      'mdc.textfield': resolvePath('./packages/mdc-textfield/mdc-text-field.scss'),
      'mdc.theme': resolvePath('./packages/mdc-theme/mdc-theme.scss'),
      'mdc.toolbar': resolvePath('./packages/mdc-toolbar/mdc-toolbar.scss'),
      'mdc.typography': resolvePath('./packages/mdc-typography/mdc-typography.scss'),
    },
    output: {
      path: MAIN_OUTPUT_DIR_ABS,
      publicPath: MAIN_OUTPUT_DIR_REL,
      filename: CSS_JS_FILENAME_OUTPUT_PATTERN,
    },
    devtool: CSS_DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: createCssLoaderConfig(),
      }],
    },
    plugins: [
      createCssExtractTextPlugin(),
      createCssJsCleanupPlugin(),
      createBannerPlugin(),
    ],
  };
}

function createTestEntry(extensionWithoutDot) {
  const entry = {};

  glob.sync(`test/screenshot/**/*.test.${extensionWithoutDot}`).forEach((relativeFilePath) => {
    const filename = path.basename(relativeFilePath);

    // Ignore import-only Sass files.
    if (filename.charAt(0) === '_') {
      return;
    }

    // The Webpack entry key for each Sass file is the relative path of the file with its leading "test/screenshot/" and
    // trailing ".scss"/".js" affixes removed.
    // E.g., "test/screenshot/foo/bar.scss" becomes {"foo/bar": "/absolute/path/to/test/screenshot/foo/bar.scss"}.
    const entryName = relativeFilePath.replace(new RegExp(`^test/screenshot/|\\.${extensionWithoutDot}`, 'g'), '');
    entry[entryName] = resolvePath(relativeFilePath);
  });

  return entry;
}

function createTestJsEntry() {
  return {
    name: 'test-js',
    entry: createTestEntry('js'),
    output: {
      path: TEST_OUTPUT_DIR_ABS,
      publicPath: TEST_OUTPUT_DIR_REL,
      filename: JS_FILENAME_OUTPUT_PATTERN,
      libraryTarget: 'umd',
      library: ['test', '[name]'],
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
      createBannerPlugin(),
    ],
  };
}

function createTestCssEntry() {
  return {
    name: 'test-css',
    entry: createTestEntry('scss'),
    output: {
      path: TEST_OUTPUT_DIR_ABS,
      publicPath: TEST_OUTPUT_DIR_REL,
      filename: CSS_JS_FILENAME_OUTPUT_PATTERN,
    },
    devtool: CSS_DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: createCssLoaderConfig(),
      }],
    },
    plugins: [
      createCssExtractTextPlugin(),
      createCssJsCleanupPlugin(),
      createBannerPlugin(),
    ],
  };
}

function runLocalDevServer() {
  const app = express();
  const port = process.env.MDC_PORT || 8090;
  app.use('/demos', express.static(resolvePath('./demos')));
  app.use('/test', express.static(resolvePath('./test')));
  app.listen(port, () => console.log(`Local development server listening on port ${port}!`));
}

module.exports = [
  createMainJsEntry(),
  createMainCssEntry(),
  createTestJsEntry(),
  createTestCssEntry(),
];

if (RUN_SERVER) {
  runLocalDevServer();
}
