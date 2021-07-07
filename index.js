#!/usr/bin/env node

const express = require('express');

const app = express();
const chromeLauncher = require('chrome-launcher')
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');
const keys = require('minimist')(process.argv.slice(2));

if (keys.v || keys.version) {
  console.log(require('./package.json').version);
  process.exit(0);
}

if (keys.help || keys.h) {
    console.log('\n');
    console.log('usage: remote-backend -b myapp.example.com [options]');
    console.log('\n');
    console.log('options:');
    console.log('-p --port\tPort which is used for your local development server [8080]');
    console.log('-s --secure\tShould be set if remote server supports only https connection [false]');
    console.log('-b --backend\tRemote server host name. This value is required');
    console.log('-a --api\tPath under which API is placed. Can be comma separated. [/api]');
    console.log('-r --reversed\tShoud be set if you want to use reverse mode - when UI is remoted and backend is local. [false]');
    console.log('-v --version\tPrints current version of this tool');
    console.log('\n');
    process.exit(0);
}

const REMOTE_HOST = keys.b || keys.backend;
const REMOTE_PORT = keys.s || keys.secure ? '443' : '80';
const REMOTE_PROTOCOL = keys.s || keys.secure ? 'https' : 'http';
const HOST = '127.0.0.1';
const DEV_PORT = keys.p || keys.port || '8080';
const IS_REVERSED = keys.r || keys.reversed;

if (!REMOTE_HOST) {
    console.error('Remote host is not specified! Use --host and specify your remote host name.');
    console.error('Run with --help for more details.');

    process.exit(1);
}

const apiPath = keys.a || keys.api || '/api';
apiPath.split(',').forEach((path) => {
    app.use(`${path.trim()}`, createProxyMiddleware({ target: `${IS_REVERSED ? 'http' : REMOTE_PROTOCOL}://${IS_REVERSED ? HOST : REMOTE_HOST}:${IS_REVERSED ? DEV_PORT : REMOTE_PORT}`, changeOrigin: true, logLevel: 'debug'}));
});

app.use('/*', createProxyMiddleware({ target: `${ IS_REVERSED ? REMOTE_PROTOCOL : 'http' }://${IS_REVERSED ? REMOTE_HOST : HOST}:${IS_REVERSED ? REMOTE_PORT : DEV_PORT}`, changeOrigin: true, logLevel: 'debug' }));

chromeLauncher.launch({
  startingUrl: `${REMOTE_PROTOCOL}://${REMOTE_HOST}/`,
    chromeFlags: [
      '--ignore-certificate-errors',
      `--host-rules=MAP ${REMOTE_HOST} 127.0.0.1`,
      `--user-data-dir=./tmp-chrome`,
      '--no-sandbox'
  ]});


if (keys.s || keys.secure) {
    const httpsServer = https.createServer({
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt')
    }, app);

    httpsServer.listen(443, () => {
        console.log('App listening at http://' + HOST + ':443');
    });
}

const server = app.listen(80, HOST, () => {
    console.log('App listening at http://' + HOST + ':80');
});
