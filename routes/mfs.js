'use strict';

const Router = require('koa-router');
const fs = require('fs');
const path = require("path")


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
    //console.log(this.params);
    // console.log(this.request.body.files);
    //console.log(this.request.body.files);

    var file = this.request.body.files.file;
    var extension = getExtension(file.name);
    var nfilename = file.hash + '.' + extension;
    var npath = this.params[0];
    var dic = path.join("/data/mfs", npath);

    // mkdirs(dic, 511, function(p) {
    //     console.log(p);
    // });
    let nf = path.join(dic, nfilename);
    mkdirs(path.dirname(nf), 511, function(p) {
        //console.log(p);
        fs.exists(nf, function(exists) {
            console.log([exists, file.path, nf]);
            if (exists)
                console.log(exists);
            else
                fs.rename(file.path, nf);
        });
    });


    var data = {
        "result": 0,
        "errorCode": 0,
        "msg": "SUCCESS",
        "info": {
            "url": "http://mfs-bak.oss-cn-beijing.aliyuncs.com/" + npath + '/' + nfilename, //upload_0bf69031530ec1f342dcce3155b83eec.xlsx
            "filename": file.name,
            "md5filename": nfilename,
            "suffix": "." + extension,
            "filesize": file.size
        }
    };
    this.body = data;
});

module.exports = router;
