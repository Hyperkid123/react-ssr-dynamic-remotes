import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { type Request } from 'express';
import session from 'express-session';

const corpProxy = 'http://squid.corp.redhat.com:3128';
const target = 'https://console.stage.redhat.com';
const proxyAgent = new HttpsProxyAgent(corpProxy);

const pathFilter = function (path: string, req: Request) {
  // do not match local assets
  if (path.match(/^\/dist\/*/)) {
    return false;
  }

  const result = req?.headers?.accept?.includes('text/html') || (!req.url.match(/\/api\//) && !req.url.match(/\./));
  return !result;
};

const devServerProxy = createProxyMiddleware(pathFilter, {
  target,
  changeOrigin: true,
  secure: false,
  autoRewrite: true,
  agent: proxyAgent,
  logLevel: 'debug',
  headers: {
    Host: target.replace('https://', ''),
    Origin: target,
  },
});

export default (express: any, app: any, root: string) => {
  // This import is crucial to enable the dynamic remotes on server side!!
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
  // @ts-ignore
  import('fake');
  // stage proxy
  app.use(devServerProxy);
  app.use(
    session({
      secret: 'foo',
      resave: false,
      saveUninitialized: false,
    })
  );
  const clientDir = path.join(root, 'build', 'client');

  // static path where files such as images and js will be served from
  app.use('/dist', express.static(clientDir));

  const renderThunk = require('./server-render').default;
  const serverRender = renderThunk(clientDir);
  app.get('/*', serverRender);
};
