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

const autoprefixer = require('autoprefixer');
const glob = require('glob');

const PathResolver = require('./path-resolver');
const PluginFactory = require('./plugin-factory');

const JS_SOURCE_MAP = true;
const CSS_SOURCE_MAP = true;

const JS_DEVTOOL = JS_SOURCE_MAP ? 'source-map' : false;
const CSS_DEVTOOL = CSS_SOURCE_MAP ? 'source-map' : false;

module.exports = {
  createMainJsBundle,
  createCustomJsBundle,
  createMainCssBundle,
  createCustomCssBundle,
  globBundleChunks,
};

function createMainJsBundle(
  {
    output: {
      fsDirAbs,
      httpDirAbs,
      ...customOutputProps
    }
  }) {
  return createCustomJsBundle({
    bundleName: 'main-js',
    chunks: PathResolver.absolutePath('/packages/material-components-web/index.js'),
    output: {
      fsDirAbs,
      httpDirAbs,
      filenamePattern: 'material-components-web.js',
      library: 'mdc',
      ...customOutputProps
    },
  });
}

function createCustomJsBundle(
  {
    bundleName,
    chunks,
    output: {
      fsDirAbs,
      httpDirAbs,
      filenamePattern = '[name].js',
      library,
      ...customOutputProps
    },
    plugins = [],
  }) {
  return {
    name: bundleName,
    entry: chunks,
    output: {
      path: fsDirAbs,
      publicPath: httpDirAbs,
      filename: filenamePattern,
      libraryTarget: 'umd',
      library,
      ...customOutputProps
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
      PluginFactory.createCopyrightBannerPlugin(),
      ...plugins
    ],
  };
}

function createMainCssBundle(
  {
    output: {
      fsDirAbs,
      httpDirAbs,
      ...customOutputProps
    }
  }) {
  return createCustomCssBundle({
    bundleName: 'main-css',
    chunks: {
      'mdc.button': PathResolver.absolutePath('/packages/mdc-button/mdc-button.scss'),
      'mdc.card': PathResolver.absolutePath('/packages/mdc-card/mdc-card.scss'),
      'mdc.checkbox': PathResolver.absolutePath('/packages/mdc-checkbox/mdc-checkbox.scss'),
      'mdc.dialog': PathResolver.absolutePath('/packages/mdc-dialog/mdc-dialog.scss'),
      'mdc.drawer': PathResolver.absolutePath('/packages/mdc-drawer/mdc-drawer.scss'),
      'mdc.elevation': PathResolver.absolutePath('/packages/mdc-elevation/mdc-elevation.scss'),
      'mdc.fab': PathResolver.absolutePath('/packages/mdc-fab/mdc-fab.scss'),
      'mdc.form-field': PathResolver.absolutePath('/packages/mdc-form-field/mdc-form-field.scss'),
      'mdc.grid-list': PathResolver.absolutePath('/packages/mdc-grid-list/mdc-grid-list.scss'),
      'mdc.icon-toggle': PathResolver.absolutePath('/packages/mdc-icon-toggle/mdc-icon-toggle.scss'),
      'mdc.layout-grid': PathResolver.absolutePath('/packages/mdc-layout-grid/mdc-layout-grid.scss'),
      'mdc.linear-progress': PathResolver.absolutePath('/packages/mdc-linear-progress/mdc-linear-progress.scss'),
      'mdc.list': PathResolver.absolutePath('/packages/mdc-list/mdc-list.scss'),
      'mdc.menu': PathResolver.absolutePath('/packages/mdc-menu/mdc-menu.scss'),
      'mdc.radio': PathResolver.absolutePath('/packages/mdc-radio/mdc-radio.scss'),
      'mdc.ripple': PathResolver.absolutePath('/packages/mdc-ripple/mdc-ripple.scss'),
      'mdc.select': PathResolver.absolutePath('/packages/mdc-select/mdc-select.scss'),
      'mdc.slider': PathResolver.absolutePath('/packages/mdc-slider/mdc-slider.scss'),
      'mdc.snackbar': PathResolver.absolutePath('/packages/mdc-snackbar/mdc-snackbar.scss'),
      'mdc.switch': PathResolver.absolutePath('/packages/mdc-switch/mdc-switch.scss'),
      'mdc.tabs': PathResolver.absolutePath('/packages/mdc-tabs/mdc-tabs.scss'),
      'mdc.textfield': PathResolver.absolutePath('/packages/mdc-textfield/mdc-text-field.scss'),
      'mdc.theme': PathResolver.absolutePath('/packages/mdc-theme/mdc-theme.scss'),
      'mdc.toolbar': PathResolver.absolutePath('/packages/mdc-toolbar/mdc-toolbar.scss'),
      'mdc.typography': PathResolver.absolutePath('/packages/mdc-typography/mdc-typography.scss'),
    },
    output: {
      fsDirAbs,
      httpDirAbs,
      ...customOutputProps
    },
  });
}

function createCustomCssBundle({
    bundleName,
    chunks,
    output: {
      fsDirAbs,
      httpDirAbs,
      filenamePattern = '[name].css',
      ...customOutputProps
    },
    plugins = [],
  }) {
  const extractTextPlugin = PluginFactory.createCssExtractTextPlugin(filenamePattern);

  return {
    name: bundleName,
    entry: chunks,
    output: {
      path: fsDirAbs,
      publicPath: httpDirAbs,
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
      PluginFactory.createCssJsCleanupPlugin(fsDirAbs),
      PluginFactory.createCopyrightBannerPlugin(),
      ...plugins
    ],
  };
}

function getRelativePathWithoutExtension(relativePath) {
  return relativePath.replace(/\.\w+$/, '');
}

function globBundleChunks({inputPathPattern, removeChunkNamePrefix = ''}) {
  const chunks = {};

  glob.sync(PathResolver.absolutePath(inputPathPattern)).forEach((absolutePath) => {
    const relativePath = PathResolver.relativePath(absolutePath);
    const filename = path.basename(absolutePath);

    // Ignore import-only Sass files.
    if (filename.charAt(0) === '_') {
      return;
    }

    // The Webpack `entry` property for a Sass file is the relative path of the file with its leading "test/screenshot/" and
    // trailing ".scss"/".js" affixes removed.
    // E.g., "test/screenshot/foo/bar.scss" becomes {"foo/bar": "/absolute/path/to/test/screenshot/foo/bar.scss"}.
    let entryName = getRelativePathWithoutExtension(relativePath, absolutePath);
    if (removeChunkNamePrefix && entryName.startsWith(removeChunkNamePrefix)) {
      entryName = entryName.substr(removeChunkNamePrefix.length);
    }
    chunks[entryName] = absolutePath;
  });

  return chunks;
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
          includePaths: glob.sync(PathResolver.absolutePath('/packages/*/node_modules')), //.map((relPath) => PathResolver.absolutePath(relPath)),
        },
      },
    ],
  });
}
