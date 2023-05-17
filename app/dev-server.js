const webpack = require('webpack');
const config = require('./config/webpack.config');
const path = require('path');
const nodemon = require('nodemon');

const compiler = webpack(config);

let initialBuild = true;

compiler.watch(
  {
    /* watchOptions */
  },
  (err, stats) => {
    if (err) {
      console.log(err);
    }
    // Print watch/build result here...
    console.log(stats.toString());
    console.log('rebuild');
    console.log({ initialBuild });
    if (initialBuild) {
      initialBuild = false;
      nodemon({
        script: path.resolve(__dirname, './build/server/serverStart.js'),
      });
    }
  }
);
