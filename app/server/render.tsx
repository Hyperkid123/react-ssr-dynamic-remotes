/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';
import path from 'path';
import fs from 'fs';

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

export default async function render(req: SessionRequest, res: Response, _next: NextFunction, clientDir: string) {
  const code = req.query.code;
  const redirectURL = `${req.protocol}://${req.hostname}:1337${req.path}`;
  let assetManifest: Array<{
    name: string;
    path: string;
  }>;
  try {
    assetManifest = JSON.parse(fs.readFileSync(path.join(clientDir, 'asset-manifest.json'), { encoding: 'utf-8' }));
  } catch (error) {
    assetManifest = [];
  }
  const cssAssetMap: Array<{
    id: string;
    path: string;
  }> = [];
  const bootstrapScripts: string[] = [];
  assetManifest.forEach(({ name, path }) => {
    if (path.match(/\.js$/)) {
      bootstrapScripts.push(path);
    } else if (path.match(/\.css$/)) {
      cssAssetMap.push({
        id: name,
        path,
      });
    }
  });
  // FIXME: Extends entry point css asset map with data from remote module manifest file

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
