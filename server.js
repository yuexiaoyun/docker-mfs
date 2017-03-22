'use strict';
const koa = require('koa');
const app = new koa();

const router = require('koa-router')();
const convert = require('koa-convert');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const body = require('koa-body');
const mfs = require('./routes/mfs');

app.use(convert(bodyparser));
app.use(convert(logger()));
app.use(convert(body({
    multipart: true,
    formidable: {
        multiples: true,
        keepExtensions: true,
        uploadDir: '/data/mfs/tmp',
        hash: 'sha1'
    }
})));

router.use('/', mfs.routes(), mfs.allowedMethods());

app.use(router.routes());

app.listen(8080, function() {
    console.log('Server started http://localhost:8080');
});