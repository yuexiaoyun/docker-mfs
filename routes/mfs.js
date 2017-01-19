'use strict';

const Router = require('koa-router');
const fs = require('fs');
const multer = require('koa-router-multer');
const upload = multer({
    dest: '/data/mfs/'
});

function getExtension(fpath) {
    var split = fpath.split(".");
    return split[split.length - 1];
}

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

    var file = this.request.body.files.file;
    var extension = getExtension(file.name);

    var data = {
        "result": 0,
        "errorCode": 0,
        "msg": "SUCCESS",
        "info": {
            "url": "http://mfs-bak.oss-cn-beijing.aliyuncs.com/" + file.path.substring(10), //upload_0bf69031530ec1f342dcce3155b83eec.xlsx
            "filename": file.name,
            "md5filename": "70ad8ccc7db24bfb503814de0adc21c7.jpg",
            "suffix": "." + extension,
            "filesize": 61293
        }
    };
    this.body = data;
});

module.exports = router;
