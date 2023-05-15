import React from 'react'
import express, { Request, Response } from 'express';
import { join } from 'path'
import morgan from 'morgan'
import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import https from 'https'
import fs from 'fs'

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
const sshDir = join(rootDir, 'build', 'ssh')

https.createServer({
  key: fs.readFileSync(join(sshDir, 'key.pem')),
  cert: fs.readFileSync(join(sshDir, 'cert.pem'))
}, app).listen(1337, () => {
  console.log(`[server]: Server is running at https://localhost:1337`);
})


export default app

// Section for dev server only
import { HttpsProxyAgent } from 'https-proxy-agent'
import { createProxyMiddleware } from 'http-proxy-middleware'

const corpProxy = 'http://squid.corp.redhat.com:3128'
const target = 'https://console.stage.redhat.com'
const proxyAgent = new HttpsProxyAgent(corpProxy)
const appUrl = [/^\/*$/]

// check if request should be proxied or fallback to local server
const pathFilter = function(_path: string, req: Request) {
  const result = !req.url.match(/\/api\//) && !req.url.match(/\./) && req?.headers?.accept?.includes('text/html')
  return !result
}

const devServerProxy = createProxyMiddleware(pathFilter, {
  target,
  changeOrigin: true,
  secure: false,
  autoRewrite: true,
  agent: proxyAgent,
  headers: {
    Host: target.replace('https://', ''),
    Origin: target
  }
})

app.use(devServerProxy)

// end of dev section

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