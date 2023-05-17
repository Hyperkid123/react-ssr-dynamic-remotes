import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import type { NextFunction, Request, Response } from 'express';
import { StaticRouter } from 'react-router-dom/server';
import App from '../src/App';
import auth, { getToken, isTokenValid } from '../src/shared/auth';
import { initialize } from '../src/shared/axiosInstance';

interface SessionRequest extends Omit<Request, 'session'> {
  session: Record<string, any>;
}

const authResult = auth();

export default async function render(req: SessionRequest, res: Response, _next: NextFunction) {
  const code = req.query.code;

  if (code) {
    req.session.code = code;
    const token = await getToken(req.session.code || code);
    req.session.token = token;
    // FIXME: Proper redirect URL
    return res.redirect('/suspense-fetch');
  }

  if (!isTokenValid(req.session.token)) {
    req.session.token = undefined;
    return res.redirect(authResult);
  }

  initialize(req.session.token);
  let didError = false;
  const waitForAll = false;
  const stream = renderToPipeableStream(
    <StaticRouter location={req.url}>
      <App token={req.session.token} />
    </StaticRouter>,
    {
      bootstrapScripts: ['/dist/main.js'],
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
