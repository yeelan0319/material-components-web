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

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const glob = require('glob');

const PathResolver = require('./path-resolver');
const PluginFactory = require('./plugin-factory');

const CSS_SOURCE_MAP = true;
const CSS_DEVTOOL = CSS_SOURCE_MAP ? 'source-map' : false;

module.exports = {
  createMainCssBundle,
  createCustomCssBundle,
};

function createMainCssBundle(
  {
    output: {
      fsDirAbsolutePath,
      httpDirAbsolutePath,
      ...customOutputProps
    }
  }) {
  return createCustomCssBundle({
    bundleName: 'main-css',
    chunks: {
      'mdc.button': PathResolver.getAbsolutePath('/packages/mdc-button/mdc-button.scss'),
      'mdc.card': PathResolver.getAbsolutePath('/packages/mdc-card/mdc-card.scss'),
      'mdc.checkbox': PathResolver.getAbsolutePath('/packages/mdc-checkbox/mdc-checkbox.scss'),
      'mdc.dialog': PathResolver.getAbsolutePath('/packages/mdc-dialog/mdc-dialog.scss'),
      'mdc.drawer': PathResolver.getAbsolutePath('/packages/mdc-drawer/mdc-drawer.scss'),
      'mdc.elevation': PathResolver.getAbsolutePath('/packages/mdc-elevation/mdc-elevation.scss'),
      'mdc.fab': PathResolver.getAbsolutePath('/packages/mdc-fab/mdc-fab.scss'),
      'mdc.form-field': PathResolver.getAbsolutePath('/packages/mdc-form-field/mdc-form-field.scss'),
      'mdc.grid-list': PathResolver.getAbsolutePath('/packages/mdc-grid-list/mdc-grid-list.scss'),
      'mdc.icon-toggle': PathResolver.getAbsolutePath('/packages/mdc-icon-toggle/mdc-icon-toggle.scss'),
      'mdc.layout-grid': PathResolver.getAbsolutePath('/packages/mdc-layout-grid/mdc-layout-grid.scss'),
      'mdc.linear-progress': PathResolver.getAbsolutePath('/packages/mdc-linear-progress/mdc-linear-progress.scss'),
      'mdc.list': PathResolver.getAbsolutePath('/packages/mdc-list/mdc-list.scss'),
      'mdc.menu': PathResolver.getAbsolutePath('/packages/mdc-menu/mdc-menu.scss'),
      'mdc.radio': PathResolver.getAbsolutePath('/packages/mdc-radio/mdc-radio.scss'),
      'mdc.ripple': PathResolver.getAbsolutePath('/packages/mdc-ripple/mdc-ripple.scss'),
      'mdc.select': PathResolver.getAbsolutePath('/packages/mdc-select/mdc-select.scss'),
      'mdc.slider': PathResolver.getAbsolutePath('/packages/mdc-slider/mdc-slider.scss'),
      'mdc.snackbar': PathResolver.getAbsolutePath('/packages/mdc-snackbar/mdc-snackbar.scss'),
      'mdc.switch': PathResolver.getAbsolutePath('/packages/mdc-switch/mdc-switch.scss'),
      'mdc.tabs': PathResolver.getAbsolutePath('/packages/mdc-tabs/mdc-tabs.scss'),
      'mdc.textfield': PathResolver.getAbsolutePath('/packages/mdc-textfield/mdc-text-field.scss'),
      'mdc.theme': PathResolver.getAbsolutePath('/packages/mdc-theme/mdc-theme.scss'),
      'mdc.toolbar': PathResolver.getAbsolutePath('/packages/mdc-toolbar/mdc-toolbar.scss'),
      'mdc.typography': PathResolver.getAbsolutePath('/packages/mdc-typography/mdc-typography.scss'),
    },
    output: {
      fsDirAbsolutePath,
      httpDirAbsolutePath,
      ...customOutputProps
    },
  });
}

function createCustomCssBundle({
    bundleName,
    chunks,
    output: {
      fsDirAbsolutePath,
      httpDirAbsolutePath,
      filenamePattern = '[name].css',
      ...customOutputProps
    },
    plugins = [],
  }) {
  const extractTextPlugin = new ExtractTextPlugin(filenamePattern);

  return {
    name: bundleName,
    entry: chunks,
    output: {
      path: fsDirAbsolutePath,
      publicPath: httpDirAbsolutePath,
      filename: `${filenamePattern}.js`, // Webpack 3.x emits CSS wrapped in a JS file
      ...customOutputProps
    },
    devtool: CSS_DEVTOOL,
    module: {
      rules: [{
        test: /\.scss$/,
        use: createCssLoader_(extractTextPlugin),
      }],
    },
    plugins: [
      extractTextPlugin,
      PluginFactory.createCssJsCleanupPlugin(fsDirAbsolutePath),
      PluginFactory.createCopyrightBannerPlugin(),
      ...plugins
    ],
  };
}

function createCssLoader_(extractTextPlugin) {
  return extractTextPlugin.extract({
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
          plugins: () => [autoprefixer({grid: false})],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: CSS_SOURCE_MAP,
          includePaths: glob.sync(PathResolver.getAbsolutePath('/packages/*/node_modules')),
        },
      },
    ],
  });
}
