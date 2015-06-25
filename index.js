var utils = require('zefti-utils')({});
var env = 'prod';
var errLevel = 1;
var _ = require('underscore');
var Logger = require('zefti-logger');
var logger = new Logger();

var defaultSev = {
    s1: ['logInfo']
  , s2: ['logWarn']
  , s3: ['logCritical']
  , s4: ['logCritical', 'email']
  , s5: ['logCritical', 'sms']
};

var errorHandler = function(options){
  this.errors = {};
  this.sev = options.sev || defaultSev;
  if (options.env === 'dev') errLevel = 7;
};

error.prototype.addErrors = fucntion(errObj){
  if (utils.type(errObj) !== 'object') {
    throw new Error('addErrors must pass in an object as an argument');
  }
  _.extend(this.errors, errObj);
}

error.prototype.lookup(errCode){
  var error = this.errors[errCode];
  return error;
}

errorHandler.prototype.send = function(err, res){
  var errResponse = this.parseError(err);
  sevFunctions(err);
  res.status(500).send(errResponse);
};

errorHandler.prototype.log = function(err, res){
  sevFunctions(err);
  var errResponse = this.parseError(err);
};

errorHandler.prototype.parseError = function(err){
  var errResponse = {};
  errResponse.time = new Date();
  if (utils.type(err) === 'string') {
    errResponse.msg = err;
  } else if (utils.type(err) === 'object') {
    errResponse.msg = err.eMsg || this.errors[err.errCode];
    errResponse.code = err.code || err.errCode;
    if (err.payload && err.payload.uid) errResponse.uid = err.payload.uid;
  } else {
    var error = new Error();
    error.msg = 'err provided is not a string or an object: ' + err;
    return throw error;
  }
  return errResponse;
};

function sevFunctions(err){
  if (!err || err.sev) return;
  var sev = 's' + err.sev;
  this.sev[sev].forEach(function(func){
    func(errRseponse);
  });
}

function logInfo(errResponse){
  logger.info(errResponse);
}

function logWarn(errResponse){
  logger.warn(errResponse);
}

function logCritical(errResponse){
  logger.critical(errResponse);
}

function email(errResponse){
  //TODO: email
}

function sms(errResponse){
  //TODO: sms
}

/*not sure about this::
 if (err.fields) {
   var compiled = _.template(error.eMsg);
   errResponse.msg = compiled(err.fields);
 }
 */




module.exports = errorHandler;