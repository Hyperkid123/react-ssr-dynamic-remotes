import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import type { NextFunction, Request, Response } from 'express';
import { StaticRouter } from 'react-router-dom/server';
import App from '../src/App';
import auth, { getToken, isTokenValid } from '../src/shared/auth';
import { initialize } from '../src/shared/axiosInstance';

import ReactDOM from 'react-dom';

// ensure react-dom is in shated scope
function noop(...args: unknown[]) {
  return args;
}

noop(ReactDOM);

interface SessionRequest extends Omit<Request, 'session'> {
  session: Record<string, any>;
}

export default async function render(req: SessionRequest, res: Response, _next: NextFunction) {
  const code = req.query.code;
  const redirectURL = `${req.protocol}://${req.hostname}:1337${req.path}`;
  const cssAssetMap = [
    'https://stage.foo.redhat.com:1337/dist/vendors-node_modules_crypto-browserify_index_js-node_modules_patternfly_patternfly_patternfly-5420f4.css',
    '/dist/src_bootstrap_tsx-webpack_sharing_consume_default_react-dom_react-dom.css',
  ];
  const bootstrapScripts = ['/dist/main.js'];
  // NOTE: This should be in the remote module manifest file
  if (req.path.includes('/landing')) {
    cssAssetMap.push(
      'http://localhost:8005/vendors-node_modules_patternfly_react-core_dist_esm_layouts_Bullseye_Bullseye_js-node_modules-41c52a.css',
      'http://localhost:8005/src_routes_Landing_js.css'
    );
  }

  if (req.path === '/') {
    cssAssetMap.push('/apps/landing/css/55.89d163199fd2cea68e60.css', '/apps/landing/css/716.25e3e5cf0437f8ba02a3.css');
  }

  if (code) {
    req.session.code = code;
    const token = await getToken(req.session.code || code, redirectURL);
    req.session.token = token;
    return res.redirect(req.path);
  }

  if (!isTokenValid(req.session.token)) {
    req.session.token = undefined;
    // FIXME: Do not strip query params
    const authResult = auth(redirectURL);
    return res.redirect(authResult);
  }

  initialize(req.session.token);
  let didError = false;
  const waitForAll = false;
  const stream = renderToPipeableStream(
    <StaticRouter location={req.url}>
      <App cssAssetMap={cssAssetMap} token={req.session.token} />
    </StaticRouter>,
    {
      bootstrapScripts,
      bootstrapScriptContent: `window.cssAssetMap = ${JSON.stringify(cssAssetMap)};`,

      onShellReady() {
        if (!waitForAll) {
          console.log('Shell ready');
          res.statusCode = didError ? 500 : 200;
          res.cookie('poc_auth_code', req.session.token);
          stream.pipe(res);
        }
      },
      onAllReady() {
        if (waitForAll) {
          console.log('All ready');
          res.statusCode = didError ? 500 : 200;
          res.cookie('poc_auth_code', req.session.token);
          res.setHeader('Content-type', 'text/html');
          stream.pipe(res);
        }
      },
      onShellError() {
        res.statusCode = 500;
        res.send(`<h1>An error occurred</h1>`);
      },
      onError(err) {
        didError = true;
        console.error(err);
      },
    }
  );
}
