'use strict';
const Router = require('koa-router');
const fs = require('fs');
const uploader = require('../libs/uploader');
var conf = require('../config/config.json');

var router = new Router();

router.get('crossdomain.xml', ctx => {
    var xml = '<?xml version="1.0"?>\
    <cross-domain-policy>\
        <allow-http-request-headers-from domain="*" headers="*"/>\
        <site-control permitted-cross-domain-policies="all"/>\
        <allow-access-from domain="*.ciwong.com" />\
        <allow-access-from domain="*.jiaofuyun.com" />\
    </cross-domain-policy>';
    ctx.set('Content-Type', 'text/xml; charset=utf-8');
    ctx.body = xml;
});

router.options('controller', ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'X-Requested-With,X_Requested_With');
    ctx.status = 200;
});

router.all('controller', async ctx => {

    var action = ctx.request.query.action;
    var callback = ctx.request.query.callback;
    var result = {};

    switch (action) {
        case 'config':
            result = JSON.stringify(conf);
            break;
            /* 上传图片 */
        case 'uploadimage':
            result = await uploader.ueditor(ctx, {
                actionName: conf.imageActionName,
                fieldName: conf.imageFieldName,
                allowFiles: conf.imageAllowFiles,
                maxSize: conf.imageMaxSize,
                pathFormat: conf.imagePathFormat
            }).catch(err => { throw err; });
            break;
            /* 上传涂鸦 */
        case 'uploadscrawl':
            result = await uploader.ueditor(ctx, {
                actionName: conf.scrawlActionName,
                fieldName: conf.scrawlFieldName,
                allowFiles: conf.imageAllowFiles,
                maxSize: conf.scrawlMaxSize,
                pathFormat: conf.scrawlPathFormat
            }).catch(err => { throw err; });
            break;
            /* 上传视频 */
        case 'uploadvideo':
            result = await uploader.ueditor(ctx, {
                actionName: conf.videoActionName,
                fieldName: conf.videoFieldName,
                allowFiles: conf.videoAllowFiles,
                maxSize: conf.videoMaxSize,
                pathFormat: conf.videoPathFormat
            }).catch(err => { throw err; });
            break;
            /* 上传文件 */
        case 'uploadfile':
            result = await uploader.ueditor(ctx, {
                actionName: conf.fileActionName,
                fieldName: conf.fileFieldName,
                allowFiles: conf.fileAllowFiles,
                maxSize: conf.fileMaxSize,
                pathFormat: conf.filePathFormat
            }).catch(err => { throw err; });
            break;
            /* 列出图片 */
        case 'listimage':
            // result = { "state": "no match file", "list": [], "start": 0, "total": 0 };
            // break;
            // /* 列出文件 */
        case 'listfile':
            result = { "state": "no match file", "list": [], "start": 0, "total": 0 };
            break;
            /* 抓取远程文件 */
        case 'catchimage':
            //result = include("action_crawler.php");
            //break;
        default:
            result = { 'state': '请求地址出错' };
            break;
    }

    if (callback) {
        if (/^[\w_]+$/.test(callback)) {
            ctx.body = callback + '(' + result + ')';
        } else {
            ctx.set('Content-Type', 'application/json');
            ctx.body = { 'state': 'callback参数不合法' };
        }
    } else {
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Headers', 'X-Requested-With,X_Requested_With');
        // ctx.set('Content-Type', 'text/html; charset=utf-8');
        ctx.body = result;
    }
});

module.exports = router;