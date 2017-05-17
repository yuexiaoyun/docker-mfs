'use strict';

const Router = require('koa-router');
const sizeOf = require('image-size');
const fs = require('fs');
const path = require("path");
const crypto = require('crypto');

function saveBuffer(dataBuffer) {

    return new Promise((resolve, reject) => {
        var md5sum = crypto.createHash('sha256');
        var md5 = md5sum.update(dataBuffer).digest('hex');
        var filename = md5;

        fs.writeFile('/data/mfs/avatars/' + filename, dataBuffer, error => {
            if (error) {
                console.log(error);
                reject({ ret: 1, errocde: 5043, "msg": '未知错误' });
            } else {
                resolve({
                    "ret": 0,
                    "errcode": 0,
                    "msg": "success",
                    "data": "http://rimg3.ciwong.net/avatars/" + filename + '/100'
                });
            }
        });
    });
}

function save(npath, file) {
    return new Promise((resolve, reject) => {
        try {
            var extension = getExtension(file.name);
            var nfilename = file.hash + '.' + extension;

            npath = npath.replace('//', '/');

            var dic = path.join("/data/mfs", npath);
            let nf = path.join(dic, nfilename);

            var info = {
                "url": "http://rimg3.ciwong.net/" + npath + '/' + nfilename,
                "filename": file.name,
                "md5filename": nfilename,
                "suffix": "." + extension,
                "filesize": file.size
            };

            var data = {
                "result": 0,
                "errorCode": 0,
                "msg": "SUCCESS",
                "info": info
            };

            mkdirs(path.dirname(nf), 511, function(p) {
                fs.exists(nf, function(exists) {
                    if (exists) {
                        //如果是图片 返回图片尺寸
                        if (['jpg', 'gif', 'png', 'bmp'].indexOf(extension) > -1) {
                            var dimensions = sizeOf(nf);
                            data.info.width = dimensions.width;
                            data.info.height = dimensions.height;
                        }
                        resolve(data);
                    } else {
                        fs.rename(file.path, nf, function(a) {
                            if (['jpg', 'gif', 'png', 'bmp'].indexOf(extension) > -1) {
                                var dimensions = sizeOf(nf);
                                data.info.width = dimensions.width;
                                data.info.height = dimensions.height;
                            }
                            resolve(data);
                        });
                    }
                });
            });
        } catch (e) {
            console.error(e);
            reject(e);
        }
    });
}

function getExtension(fpath) {
    var split = fpath.split(".");
    return split[split.length - 1];
}

// 创建所有目录
var mkdirs = function(dirpath, mode, callback) {
    fs.exists(dirpath, function(exists) {
        if (exists) {
            callback(dirpath);
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function() {
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};


var router = new Router();

router.get('/', function*() {
    this.body = 'MFS';
});


router.get('crossdomain.xml', ctx => {
    var crossdomain = '<?xml version="1.0"?><cross-domain-policy><allow-http-request-headers-from domain="*" headers="*"/><site-control permitted-cross-domain-policies="all"/><allow-access-from domain="*" secure="false"/></cross-domain-policy>';
    ctx.set('Content-Type', 'application/xml; charset=utf-8');
    ctx.body = crossdomain;
});

//上传头像
router.post('avatar/upload', async ctx => {
    if (ctx.request.body.file) {
        var imgDate = ctx.request.body.file;
        var base64Data = imgDate.replace(/^data:image\/\w+;base64,/, '');
        var dataBuffer = new Buffer(base64Data, 'base64');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        var data = await saveBuffer(dataBuffer).catch(err => {
            ctx.body = err;
        });
        ctx.body = data;
    } else {
        ctx.body = { ret: 1, errocde: 5043, "msg": '参数错误' };
    }
});


router.post('admin_uc/images/10086', async ctx => {
    var npath = 'admin_uc/images/10086';
    if (ctx.request.body.files) {
        var files = [];
        for (var key in ctx.request.body.files) {
            files.push(ctx.request.body.files[key]);
        }
        var data = await save(npath, files[0]);
        ctx.body = {
            url: data.info.url,
            title: data.info.filename,
            original: data.info.filename,
            state: 'SUCCESS'
        };
    } else {
        ctx.body = {
            "state": '未知错误'
        };
    }
});

router.post('*', async ctx => {
    var npath = ctx.params[0];
    if (ctx.request.body.files) {
        var files = [];
        for (var key in ctx.request.body.files) {
            files.push(ctx.request.body.files[key]);
        }
        ctx.body = await save(npath, files[0]);
    } else {
        ctx.body = {
            "result": 1,
            "errorCode": 1,
            "msg": 'No file sent'
        };
    }
});

module.exports = router;