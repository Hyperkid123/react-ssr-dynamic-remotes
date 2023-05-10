import React from 'react'
import express, { Request, Response } from 'express';
import { resolve, join } from 'path'
import morgan from 'morgan'
import ReactDOMServer from 'react-dom/server'

import App from '../src/App';

const app = express();

app.use(morgan('combined'))

app.use('/dist', express.static(join(__dirname, '../client')))
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