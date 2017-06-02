'use strict';
var Busboy = require('busboy');
var crypto = require('crypto');
var store = require('../libs/oss');
var moment = require('moment');


function getFileExt(oriName) {
    var arr = oriName.split('.');
    var ext = arr.length > 1 ? arr[arr.length - 1] : 'png';
    return '.' + ext;
}

function getFullName(oriName, format, hash) {
    //替换日期事件
    var date = new Date();
    var t = moment(date).format('YYYY-YY-MM-DD-HH-mm-ss');
    console.log(t);
    let d = t.split('-');
    format = format.replace("{yyyy}", d[0]);
    format = format.replace("{yy}", d[1]);
    format = format.replace("{mm}", d[2]);
    format = format.replace("{dd}", d[3]);
    format = format.replace("{hh}", d[4]);
    format = format.replace("{ii}", d[5]);
    format = format.replace("{ss}", d[6]);
    format = format.replace("{time}", moment(date).unix());

    //过滤文件名的非法自负,并替换文件名
    oriName = oriName.split('.')[0];
    oriName = oriName.replace("/[\|\?\"\<\>\/\*\\\\]+/", '');
    format = format.replace("{filename}", oriName);

    //替换随机字符串
    var randNum = ((Math.random() * 10000000000000000) + '' + (Math.random() * 10000000000000000));
    randNum = randNum.replace(/\.?/, '');

    var patt = new RegExp(/\{rand\:([\d]*)\}/i);
    if (patt.test(format)) {
        var matches = patt.exec(format);
        format = format.replace(patt, randNum.substring(0, matches[1]));
    }
    console.log(format);

    if (hash) {
        format = format.replace("{hash}", hash);
    }
    var ext = getFileExt(oriName);
    var fullname = format + ext;
    console.log(fullname);
    return fullname;
}

module.exports.ueditor = function(ctx, conf) {
    /**
            actionName: conf.imageActionName,
            fieldName: conf.imageFieldName,
            allowFiles: conf.imageAllowFiles,
            maxSize: conf.imageMaxSize,
            pathFormat: conf.imagePathFormat
     */
    return new Promise((resolve, reject) => {
        console.log('Busboy.....');
        var ueditor = {};
        var busboy = new Busboy({ headers: ctx.req.headers });
        //BASE64
        busboy.on('field', (fieldname, val) => {
            if (fieldname == conf.fieldName) {
                ueditor.ext = ".png";
                var base64Data = val.replace(/^data:image\/\w+;base64,/, '');
                var buffer = new Buffer(base64Data, 'base64');
                var hash = crypto.createHash('sha1');
                hash.update(buffer);
                var _hash = hash.digest('hex').toLowerCase();
                var filepath = getFullName("涂鸦.png", conf.pathFormat, _hash);
                var key = filepath.substr(1);
                store.putObject({ Bucket: 'epbank', Key: key, Body: buffer }, (err, data) => {
                    if (err) reject(err);
                    ueditor.url = filepath;
                    var filname = filepath.split('/')[filepath.split('/').length - 1];
                    console.log(ueditor);
                    var result = {
                        "state": 'SUCCESS',
                        "url": ueditor.url,
                        "name": filname,
                        "original": '涂鸦.png',
                        "type": ueditor.ext,
                        "size": buffer.length
                    }
                    console.log(result);
                    resolve(result);
                });
            }
        });
        //file
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            if (fieldname == conf.fieldName) {
                console.log('file...');
                ueditor.fieldname = fieldname;
                //ueditor.file = file;
                ueditor.filename = filename;
                ueditor.encoding = encoding;
                ueditor.mimetype = mimetype;
                ueditor.ext = getFileExt(filename);

                // conf.im

                var hash = crypto.createHash('sha1');
                var tempBuffer = [];
                file.on('data', buffer => {
                    hash.update(buffer);
                    tempBuffer.push(buffer);
                });

                file.on('end', () => {
                    var _hash = hash.digest('hex').toLowerCase();
                    console.log(_hash);
                    var buffer = Buffer.concat(tempBuffer);
                    ueditor.hash = _hash;
                    var filepath = getFullName(ueditor.filename, conf.pathFormat, _hash);
                    var key = filepath.substr(1);
                    store.putObject({ Bucket: 'epbank', Key: key, Body: buffer }, (err, data) => {
                        if (err) reject(err);
                        ueditor.url = filepath;
                        var filname = filepath.split('/')[filepath.split('/').length - 1];
                        var result = {
                            "state": 'SUCCESS',
                            "url": ueditor.url,
                            "name": filname,
                            "original": ueditor.filename,
                            "type": ueditor.ext,
                            "size": buffer.length.toString()
                        }
                        resolve(result);
                    });
                });
                file.on('error', reject);
            }
        });

        busboy.on('error', reject);
        ctx.req.pipe(busboy);
    });
}