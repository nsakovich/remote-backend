#!/usr/bin/env node

const express = require('express');

const app = express();
const chromeLauncher = require('chrome-launcher')
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');
const keys = require('minimist')(process.argv.slice(2));

if (keys.help) {
    console.log('usage: remote-backend -h myapp.example.com [options]');
    console.log('\n');
    console.log('options:');
    console.log('-p --port\tPort which is used for your local UI development server [8080]');
    console.log('-s --secure\tShould be set if your remote backend supports only https connection [false]');
    console.log('-h --host\tYour remote backend host. This value is required');
    console.log('-a --api\tPath under which your api is placed [/api]');
    console.log('\n');
    process.exit(0);
}

const BACKEND_HOST = keys.h || keys.host;
const BACKEND_PORT = keys.s || keys.secure ? '443' : '80';
const BACKEND_PROTOCOL = keys.s || keys.secure ? 'https' : 'http';
const HOST = '127.0.0.1';
const UI_PORT = keys.p || keys.port || '8080';

if (!BACKEND_HOST) {
    console.error('Backend host is not specified! Use --host and specify your backend host.');
    console.error('Run with --help for more details.');

    process.exit(1);
}

app.use(`${keys.a || keys.api || '/api'}`, createProxyMiddleware({ target: `${BACKEND_PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`, changeOrigin: true, logLevel: 'debug'}));
app.use('/*', createProxyMiddleware({ target: `http://${HOST}:${UI_PORT}`, changeOrigin: true, logLevel: 'debug' }));

chromeLauncher.launch({
  startingUrl: `${BACKEND_PROTOCOL}://${BACKEND_HOST}/`,
    chromeFlags: [
      '--ignore-certificate-errors',
      `--host-rules=MAP ${BACKEND_HOST} 127.0.0.1`,
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
