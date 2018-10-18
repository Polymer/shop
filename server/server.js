/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
const prpl = require('prpl-server');
const express = require('express');
const shrinkRay = require('shrink-ray');
const rendertron = require('rendertron-middleware');
const app = express();

// Trust X-Forwarded-* headers so that when we are behind a reverse proxy,
// our connection information is that of the original client (according to
// the proxy), not of the proxy itself. We need this for HTTPS redirection
// and bot rendering.
app.set('trust proxy', true);

app.use((req, res, next) => {
  if (req.secure) {
    next();
    return;
  }
  res.redirect(301, `https://${req.hostname}${req.url}`);
});

app.use(shrinkRay());

app.use(rendertron.makeMiddleware({
  proxyUrl: 'https://render-tron.appspot.com/render',
  injectShadyDom: true,
}));

app.use(prpl.makeHandler('./build', require('./build/polymer.json')));

app.listen(process.env.PORT || 8080);
