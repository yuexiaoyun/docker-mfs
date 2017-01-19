'use strict';

const Router = require('koa-router');
const fs = require('fs');
const multer = require('koa-router-multer');
const upload = multer({
    dest: '/data/mfs/'
});

var router = new Router();

router.get('/', function(ctx, next) {
    ctx.body = 'MFS';
});

router.get('/info', function(ctx, next) {
    ctx.body = 'info';
});

router.post('*', upload.single('file'), function*() {
    console.log(this.params);
    // console.log(this.request.body.files);
    console.log(this.request.body.files);
    // console.log(this.request.body.files);
    // if (this.request.body.files.file) {
    //     //fs.copy()
    // }
    this.body = 'upload';
});

module.exports = router;
