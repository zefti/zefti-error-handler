var utils = require('zefti-utils');
var env = 'prod';
var errLevel = 1;
var _ = require('underscore');
var Logger = require('zefti-logger');


var defaultSev = {
    s1: ['logCritical']
  , s2: ['logWarn']
  , s3: ['logInfo']
  , s4: []
  , s5: []
};

var errorHandler = {
  errors: {}
};

errorHandler.init = function(options){
  this.sev = defaultSev;
  if (options.logger) {
    this.logger = options.logger
  } else {
    this.logger = new Logger();
  }
  return this;
};

errorHandler.addErrors = function(errObj){
  if (utils.type(errObj) !== 'object') {
    throw new Error('addErrors must pass in an object as an argument');
  }
  _.extend(this.errors, errObj.errorCodes);
};

errorHandler.lookup = function(errCode){
  var error = this.errors[errCode];
  return error;
};

errorHandler.send = function(err, res){
  var errResponse = this.parseError(err);

  this.sevFunctions(err, errResponse);
  res.status(500).send(errResponse);
};

errorHandler.log = function(err, res){
  console.log('in errorhandler log');
  var errResponse = this.parseError(err);
  this.sevFunctions(err, errResponse);
};



errorHandler.parseError = function(err){
  var self = this;
  var errResponse = {};
  errResponse.time = new Date();
  if (utils.type(err) === 'string') {
    errResponse.msg = err;
  } else if (utils.type(err) === 'object') {
    if (err.fields) {
      var compiled = _.template(self.errors[err.errCode].eMsg);
      errResponse.msg = compiled(err.fields);
    } else {
      console.log(err.errCode);
      console.log('======')
      errResponse.msg = this.errors[err.errCode].eMsg || this.errors[err.errCode] || 'error not defined';
    }
    errResponse.code = err.code || err.errCode;
    if (err.payload && err.payload.uid) errResponse.uid = err.payload.uid;
  } else {
    var error = new Error();
    error.msg = 'err provided is not a string or an object: ' + err;
    throw error;
  }
  return errResponse;
};

errorHandler.sevFunctions = function(err, errResponse){
  var self = this;
  console.log('before')
  console.log(err);
  console.log(errResponse);
  console.log(this.errors[err.errCode]);
  if (!err || !err.sev || !this.errors[err.errCode] || utils.type(err) !== 'object') return;
  console.log('after')
  var sev = 's' + this.errors[err.errCode].sev;
  this.sev[sev].forEach(function (func) {
    self[func](errResponse);
  });
};



//TODO: remove all the console logs and use logger
errorHandler.logInfo = function(errResponse){
  console.log('in logInfo');
  //this.logger.info(errResponse);
};

errorHandler.logWarn = function(errResponse){
  console.log('in logWarn');
  //this.logger.warn(errResponse);
};

errorHandler.logCritical = function(errResponse){
  console.log('in logCritical');
  //this.logger.critical(errResponse);
};





module.exports = errorHandler;