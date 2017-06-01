'use strict';
const koa = require('koa');
const app = new koa();

const router = require('koa-router')();
const ueditor = require('./routes/ueditor');

router.use('/ueditor', ueditor.routes(), ueditor.allowedMethods());

app.use(router.routes());

app.listen(8080, function() {
    console.log('Server started http://localhost:8080');
});