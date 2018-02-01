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

const express = require('express');
const serveIndex = require('serve-index');

const PathResolver = require('../../scripts/build/path-resolver');

module.exports = {
  runLocalDevServer,
};

function runLocalDevServer({relativeDirectoryPaths, port = process.env.MDC_PORT || 8090}) {
  const app = express();
  relativeDirectoryPaths.forEach((relativeDirectoryPath) => {
    serveStatic(app, relativeDirectoryPath);
  });
  app.listen(port, () => logLocalDevServerRunning(port));
}

function serveStatic(app, urlPath, fsPathRel = urlPath) {
  const fsPathAbs = PathResolver.absolutePath(fsPathRel);
  const indexOpts = {
    icons: true,
  };
  app.use(urlPath, express.static(fsPathAbs), serveIndex(fsPathAbs, indexOpts));
}

function logLocalDevServerRunning(port) {
  const message = `Local development server running on http://localhost:${port}/`;
  const ch = '=';
  const divider = ch.repeat(message.length + 6);
  const spacer = ' '.repeat(message.length);
  console.log(`
${divider}
${ch}  ${spacer}  ${ch}
${ch}  ${message}  ${ch}
${ch}  ${spacer}  ${ch}
${divider}
`);
}
