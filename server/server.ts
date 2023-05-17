const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const https = require('https');
const fs = require('fs');

const initMiddleware = require('./middleware');

const app = express();
const PORT = 1337;

const rootDir = process.cwd();
const sshDir = path.join(rootDir, 'build', 'ssh');

app.use(morgan('combined'));
app.use(cookieParser());
app.use(
  session({
    secret: 'foo',
    resave: false,
    saveUninitialized: false,
  })
);

const done = () => {
  https
    .createServer(
      {
        key: fs.readFileSync(path.join(sshDir, 'key.pem')),
        cert: fs.readFileSync(path.join(sshDir, 'cert.pem')),
      },
      app
    )
    .listen(PORT, () => {
      console.log(`[server]: Server is running at https://localhost:${PORT}`);
    });
};

initMiddleware.default(express, app, rootDir);

module.exports.done = done;
module.exports.app = app;
