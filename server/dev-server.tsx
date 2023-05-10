import webpack, { HotModuleReplacementPlugin, web } from 'webpack';
import path from 'path';
// @ts-ignore
import webpackConfig from '../../webpack.config.js'
import webpackDevMiddleware from 'webpack-dev-middleware';

import app from './server'

const devServerConfig = webpackConfig()
// devServerConfig.plugins.push(new HotModuleReplacementPlugin())
const compiler = webpack(devServerConfig)


app.use(webpackDevMiddleware(compiler, {
  publicPath: devServerConfig.output.publicPath,
  serverSideRender: true
}))

const port = 8080;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});