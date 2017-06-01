'use strict';

var conf = require('../config');
var ALY = require('aliyun-sdk');
var store = new ALY.OSS(conf.oss);

module.exports = store;