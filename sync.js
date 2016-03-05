var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var utils = require('zefti-utils');
var Logger = require('zefti-logger');
var configManager = require('zefti-config-manager');
//TODO: make this configPath configurable
var configPath = '/Users/ryanogle/zefti/zefti-config/lib';
var config = configManager({configPath: configPath, env : 'devlocaltest'}).settings;


var logger = new Logger(config.logConfig);
/*
fs.stat('/bob/text.txt', function(err, res){
  console.log(err);
  console.log(res);
});
*/

setInterval(function(){
  logger.info('test');
}, 100);
