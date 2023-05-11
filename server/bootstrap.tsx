import React from 'react'
import express, { Request, Response } from 'express';
import { join } from 'path'
import morgan from 'morgan'
import ReactDOMServer from 'react-dom/server'
import fs from 'fs'

import App from '../src/App';

const app = express();

app.use(morgan('combined'))


// @ts-ignore
global['IS_SERVER'] = true

// This import is crucial to enable the dynamic remotes on server side!!
// @ts-ignore
import('fake')


// the node setting we need will set __dirname to "/" which can cause issues. Will need some investigation in the future.
const rootDir = process.cwd()
const clientDir = join(rootDir, 'build', 'client')

app.use('/dist', express.static(clientDir))
app.get('/', (_req: Request, res: Response) => {
  let didError = false
  const waitForAll = false
  res.socket?.on('error', (error) => console.log('Fatal', error));

  const stream = ReactDOMServer.renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/dist/main.js'],
      onShellReady: () => {
        res.statusCode = didError ? 500 : 200
        res.setHeader('Content-type', 'text/html');
        stream.pipe(res);
      },
      // handy for SEO
      onAllReady() {
        if (waitForAll) {
          res.statusCode = didError ? 500 : 200;
          res.setHeader('content-type', 'text/html');
          stream.pipe(res);      
        }
      },
      onShellError(error) {
        res.statusCode = 500;
        console.error(error)
        res.setHeader('content-type', 'text/html');
        res.send('<h1>Something went wrong</h1>'); 
      },
      onError: (error) => {
        didError = true;
        console.log(error);
      } 
    }
  )
})


export default app

const port = 8080;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});