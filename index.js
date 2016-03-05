var utils = require('zefti-utils');
var env = 'prod';
var _ = require('underscore');
var Logger = require('zefti-logger');
var Request = require('zefti-request');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


var defaultSevMatrix = {
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
  this.sev = options.sevMatrix || defaultSevMatrix;
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
  this.sevFunctions(errResponse);
  var httpCode = errResponse.httpCode || 500;
  delete errResponse.sev;
  delete errResponse.status;
  res.status(httpCode).send(errResponse);
};

errorHandler.log = function(err){
  var errResponse = this.parseError(err);
  this.sevFunctions(errResponse);
};



errorHandler.parseError = function(err) {
  var self = this;
  var errResponse = {};
  errResponse.st = new Date().toString();
  if (!err) {
    errResponse.msg = 'no error provided to errHandler';
    return errResponse;
  } else if (utils.type(err) !== 'string' && utils.type(err) !== 'object') {
    errResponse.msg = 'unknown err type';
  } else if (utils.type(err) === 'string') {
    errResponse.msg = err;
  } else if (!self.errors) {
    errResponse.msg = 'no errors to evaluate';
  } else if (!err.errCode) {
    errResponse.msg = 'no errCode provided';
  } else if (!self.errors[err.errCode]) {
    errResponse.msg = 'no matched errCode';
  } else if (!self.errors[err.errCode].eMsg) {
    errResponse.msg = 'no eMsg defined';
    errResponse.sev = self.errors[err.errCode].sev;
  } else {
    errResponse.sev = self.errors[err.errCode].sev;
    if (err.fields) {
      var compiled = _.template(self.errors[err.errCode].eMsg);
      errResponse.msg = compiled(err.fields);
    } else {
      errResponse.msg = self.errors[err.errCode].eMsg;
    }
  }

  errResponse.errCode = err.errCode;
  if (err.payload && err.payload.uid) errResponse.uid = err.payload.uid;
  return errResponse;
};

errorHandler.sevFunctions = function(errResponse){
  var self = this;
  var errSev = errResponse.sev || 's3';
  this.sev[errSev].forEach(function (func) {
    self[func](errResponse);
  });
};



//TODO: remove all the console logs and use logger
errorHandler.logInfo = function(errResponse){
  this.logger.info(errResponse);
};

errorHandler.logWarn = function(errResponse){
  this.logger.warn(errResponse);
};

errorHandler.logCritical = function(errResponse){
  this.logger.critical(errResponse);
};





module.exports = errorHandler;