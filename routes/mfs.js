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


router.get('crossdomain.xml', function*() {
    this.set('Content-Type', 'text/xml');
    this.body = '<?xml version="1.0" ?><cross-domain-policy><allow-access-from domain="*" /></cross-domain-policy>';
});

router.post('*', function*() {

    var file;
    var npath = this.params[0];
    if (this.request.body.files) {
        for (var key in this.request.body.files) {
            file = this.request.body.files[key];
            break;
        }
    } else {
        this.body = {
            "result": 1,
            "errorCode": 1,
            "msg": 'No file sent'
        }
    }
    this.body = yield save(npath, file);

});
module.exports = router;