const express = require('express');

const app = express();
const chromeLauncher = require('chrome-launcher')
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');


const BACKEND_HOST = process.env.BACKEND_HOST;
const BACKEND_PORT = process.env.HTTPS ? '443' : '80';
const BACKEND_PROTOCOL = process.env.HTTPS ? 'https' : 'http';
const HOST = '127.0.0.1';
const UI_PORT = process.env.PORT || '8080';

if (!BACKEND_HOST) {
    console.error('BACKEND_HOST is not specified!');
    process.exit(1);
}

app.use(`${process.env.API_PATH || '/api'}`, createProxyMiddleware({ target: `${BACKEND_PROTOCOL}://${BACKEND_HOST}:${BACKEND_PORT}`, changeOrigin: true, logLevel: 'debug'}));
app.use('/*', createProxyMiddleware({ target: `http://${HOST}:${UI_PORT}`, changeOrigin: true, logLevel: 'debug' }));

chromeLauncher.launch({
  startingUrl: `${BACKEND_PROTOCOL}://${BACKEND_HOST}/`,
    chromeFlags: [
      '--ignore-certificate-errors',
      `--host-rules=MAP ${BACKEND_HOST} 127.0.0.1`,
      `--user-data-dir=./tmp-chrome`,
      '--no-sandbox'
  ]});


if (process.env.HTTPS) {
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
