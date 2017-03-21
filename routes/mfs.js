'use strict';

const Router = require('koa-router');
const sizeOf = require('image-size');
const fs = require('fs');
const path = require("path");

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
                    //console.log([exists, file.path, nf]);
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
                            //如果是图片 返回图片尺寸
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
    var crossdomain = '<?xml version="1.0"?>\
<cross-domain-policy>\
  <allow-http-request-headers-from domain="*.ciwong.net" headers="*"/>\
  <site-control permitted-cross-domain-policies="all"/>\
  <allow-access-from domain="*" secure="false"/>\
</cross-domain-policy>';
    ctx.set('Content-Type', 'application/xml; charset=utf-8');
    ctx.body = crossdomain;
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