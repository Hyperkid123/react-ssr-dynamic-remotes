import React from "react";
import express, { Request, Response } from "express";
import { join } from "path";
import morgan from "morgan";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import https from "https";
import fs from "fs";
import cookieParser from 'cookie-parser'
import auth, { decodeToken, getToken, isTokenValid } from "../src/shared/auth";
import session from 'express-session'

export interface SessionRequest extends Omit<Request, 'session'> {
  session: Record<string, any>
}

const noop = (...args: unknown[]) => {
  return args;
};

// this import is necessary to include the client based packages within the shared scope!!
import * as ReactDOM from "react-dom";
// it has to be used to not tree shake it
noop(ReactDOM);

const app = express();

app.use(morgan("combined"));
app.use(cookieParser())
app.use(session({
  secret: 'foo',
  resave: false,
  saveUninitialized: false,
}))

// @ts-ignore
global["IS_SERVER"] = true;

// This import is crucial to enable the dynamic remotes on server side!!
// @ts-ignore
import("fake");

// the node setting we need will set __dirname to "/" which can cause issues. Will need some investigation in the future.
const rootDir = process.cwd();
const clientDir = join(rootDir, "build", "client");
const sshDir = join(rootDir, "build", "ssh");

https
  .createServer(
    {
      key: fs.readFileSync(join(sshDir, "key.pem")),
      cert: fs.readFileSync(join(sshDir, "cert.pem")),
    },
    app
  )
  .listen(1337, () => {
    console.log(`[server]: Server is running at https://localhost:1337`);
  });

const authResult = auth();
export default app;

// Section for dev server only
import { HttpsProxyAgent } from "https-proxy-agent";
import { createProxyMiddleware } from "http-proxy-middleware";
import { initialize } from "../src/shared/axiosInstance";

const corpProxy = "http://squid.corp.redhat.com:3128";
const target = "https://console.stage.redhat.com";
const proxyAgent = new HttpsProxyAgent(corpProxy);
const appUrl = [/^\/*$/];

// check if request should be proxied or fallback to local server
const pathFilter = function (path: string, req: Request) {
  // do not match local assets
  if (path.match(/^\/dist\/*/)) {
    return false;
  }

  const result = req?.headers?.accept?.includes("text/html") ||
    !req.url.match(/\/api\//) &&
    !req.url.match(/\./)
  return !result;
};

const devServerProxy = createProxyMiddleware(pathFilter, {
  target,
  changeOrigin: true,
  secure: false,
  autoRewrite: true,
  agent: proxyAgent,
  headers: {
    Host: target.replace("https://", ""),
    Origin: target,
  },
});

app.use(devServerProxy);

// end of dev section

app.use("/dist", express.static(clientDir));
app.get("*", async (req: SessionRequest, res: Response) => {
  const code = req.query.code
  if(code) {
    req.session.code = code
    const token = await getToken(req.session.code || code)
    req.session.token = token
    // FIXME: Proper redirect URL
    return res.redirect('/')
  }

  if(!isTokenValid(req.session.token)) {
    req.session.token = undefined
    return res.redirect(authResult)
  }

  // initialize axios instance
  initialize(req.session.token)
  let didError = false;
  const waitForAll = false;
  res.socket?.on("error", (error) => console.log("Fatal", error));

  // to ensure axios was initialized before the app starting using it
  const {default: App} = await import("../src/App");


  const stream = ReactDOMServer.renderToPipeableStream(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>,
    {
      bootstrapScripts: ["/dist/main.js"],
      onShellReady: () => {
        if (!waitForAll) {
          res.cookie('poc_auth_code', req.session.token)
          res.statusCode = didError ? 500 : 200;
          res.setHeader("Content-type", "text/html");
          stream.pipe(res);
        }
      },
      // handy for SEO
      onAllReady() {
        console.log("On all ready");
        if (waitForAll) {
          res.cookie('poc_auth_code', req.session.token)
          res.statusCode = didError ? 500 : 200;
          res.setHeader("content-type", "text/html");
          stream.pipe(res);
        }
      },
      onShellError(error) {
        res.statusCode = 500;
        console.error(error);
        res.setHeader("content-type", "text/html");
        res.send("<h1>Something went wrong</h1>");
      },
      onError: (error) => {
        didError = true;
        console.log(error);
      },
    }
  );
});
