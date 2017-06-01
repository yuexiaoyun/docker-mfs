'use strict';
var Busboy = require('busboy');
var crypto = require('crypto');
var store = require('../libs/oss');

function getFileExt(oriName) {
    var arr = oriName.split('.');
    return arr.length > 1 ? arr[arr.length - 1] : 'png';
}
module.exports.ueditor = function(ctx) {

    return new Promise((resolve, reject) => {
        console.log('Busboy.....');
        var ueditor = {};
        var busboy = new Busboy({ headers: ctx.req.headers });
        //BASE64
        busboy.on('field', (fieldname, val) => {
            if (fieldname == 'upfile') {
                ueditor.ext = ".png";
                var base64Data = val.replace(/^data:image\/\w+;base64,/, '');
                var buffer = new Buffer(base64Data, 'base64');
                var hash = crypto.createHash('sha1');
                hash.update(buffer);
                var _hash = hash.digest('hex').toLowerCase();
                var key = 'ueditor/' + _hash + '.png';
                store.putObject({ Bucket: 'epbank', Key: key, Body: buffer }, (err, data) => {
                    if (err) reject(err);
                    ueditor.url = key;
                    console.log(ueditor);
                    var result = {
                        "state": 'SUCCESS',
                        "url": '/' + ueditor.url,
                        "name": _hash + '.' + ueditor.ext,
                        "original": '涂鸦.png',
                        "type": '.' + ueditor.ext,
                        "size": buffer.length
                    }
                    console.log(result);
                    resolve(result);
                });
            }
        });
        //file
        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            if (fieldname == 'upfile') {
                console.log('file...');
                ueditor.fieldname = fieldname;
                //ueditor.file = file;
                ueditor.filename = filename;
                ueditor.encoding = encoding;
                ueditor.mimetype = mimetype;
                ueditor.ext = getFileExt(filename);
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
                    var key = 'ueditor/' + _hash + '.' + ueditor.ext;
                    store.putObject({ Bucket: 'epbank', Key: key, Body: buffer }, (err, data) => {
                        if (err) reject(err);
                        ueditor.url = key;
                        var result = {
                            "state": 'SUCCESS',
                            "url": '/' + ueditor.url,
                            "name": _hash + '.' + ueditor.ext,
                            "original": ueditor.filename,
                            "type": '.' + ueditor.ext,
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