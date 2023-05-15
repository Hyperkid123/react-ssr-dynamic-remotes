import React from 'react'
import express, { Request, Response } from 'express';
import { join } from 'path'
import morgan from 'morgan'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import App from '../src/App';

const noop = (...args: unknown[]) => {
  return args
}

// this import is necessary to include the client based packages within the shared scope!! 
import * as ReactDOM from 'react-dom'
// it has to be used to not tree shake it
noop(ReactDOM)


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
app.get('*', (req: Request, res: Response) => {
  let didError = false
  const waitForAll = false
  res.socket?.on('error', (error) => console.log('Fatal', error));

  const stream = ReactDOMServer.renderToPipeableStream(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>,
    {
      bootstrapScripts: ['/dist/main.js'],
      onShellReady: () => {
        if(!waitForAll) {
          res.statusCode = didError ? 500 : 200
          res.setHeader('Content-type', 'text/html');
          stream.pipe(res);
        }
      },
      // handy for SEO
      onAllReady() {
        console.log("On all ready")
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