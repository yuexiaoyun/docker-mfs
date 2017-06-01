'use strict';
const Router = require('koa-router');
const fs = require('fs');
const uploader = require('../libs/uploader');

var getConfig = function() {
    return new Promise((resolve, reject) => {
        try {
            var data = fs.readFileSync("config/config.json", "utf-8");
            var json = data.replace(/\/\*[\s\S]+?\*\//, '');
            resolve(json);
        } catch (error) {
            reject(error);
        }
    });
};

var router = new Router();
router.options('/', ctx => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'X-Requested-With,X_Requested_With');
    ctx.status = 200;
});
router.all('/', async ctx => {

    var action = ctx.request.query.action;
    var callback = ctx.request.query.callback;
    var result = {};

    switch (action) {
        case 'config':
            result = await getConfig();
            break;
            /* 上传图片 */
        case 'uploadimage':
            /* 上传涂鸦 */
        case 'uploadscrawl':
            /* 上传视频 */
        case 'uploadvideo':
            /* 上传文件 */
        case 'uploadfile':
            result = await uploader.ueditor(ctx).catch(err => {
                throw err;
            });
            break;
            /* 列出图片 */
        case 'listimage':
            //result = include("action_list.php");
            //break;
            /* 列出文件 */
        case 'listfile':
            //result = include("action_list.php");
            //break;
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
        ctx.set('Content-Type', 'text/html; charset=utf-8');
        ctx.body = JSON.stringify(result);
    }
});

module.exports = router;