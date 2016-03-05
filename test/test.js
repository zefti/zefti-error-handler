var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var utils = require('zefti-utils');
var Logger = require('zefti-logger');
var errorHandler = require('../index.js');
var configManager = require('zefti-config-manager');
//TODO: make this configPath configurable
var configPath = '/Users/ryanogle/zefti/zefti-config/lib';
var config = configManager({configPath: configPath, env : 'devlocaltest'}).settings;


var Request = require('zefti-request');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var getResponse = {'msg': 'mockget'};
var postValue = 'mockpost';






//TODO: don't hard code this in test file (should be test config);
var logPath = '/Users/ryanogle/log/';
var now = new Date();

var expectedInfoFileName = 'info' + '_' + now.getFullYear() + '_' + getMonth(now) + '_' + getDay(now) + '.log';
var expectedWarnFileName = 'warn' + '_' + now.getFullYear() + '_' + getMonth(now) + '_' + getDay(now) + '.log';
var expectedCriticalFileName = 'critical' + '_' + now.getFullYear() + '_' + getMonth(now) + '_' + getDay(now) + '.log';

var infoFilePath = path.join(logPath, expectedInfoFileName);
var warnFilePath = path.join(logPath, expectedWarnFileName);
var criticalFilePath = path.join(logPath, expectedCriticalFileName);

var errCode1 = 'new_err';
var errCode2 = 'new_err2';
var errCode3 = 'new_err3';
var errCode4 = 'err_with_no_emsg';
var errCode5 = 'err_with_template';

var err1Sev = 's3';
var err2Sev = 's2';
var err3Sev = 's1';
var err4Sev = 's2';
var err5Sev = 's2';

var err1EMsg = 'err1 eMsg';
var err2EMsg = 'err2 eMsg';
var err3EMsg = 'err3 eMsg';
var err4EMsg = 'err4 eMsg';
var err5EMsg = 'this is template with a field named foo: <%= foo %>';

var err1Description = 'err1 description';
var err2Description = 'err2 description';
var err3Description = 'err3 description';
var err4Description = 'err4 description';
var err5Description = 'err5 description';

var logInfoMsg = 'example log in info';
var logWarnMsg = 'example log in warn';
var logCriticalMsg = 'example log in critical';

var logInfoObj = {a:'b', c:'d'};
var logWarnObj = {e:'f', g:'h'};
var logCriticalObj = {i:'j', k:'l'};

/*
 * Fake server with endpoints for get, post, put, delete
 */
app.get('/failerr1', function(req, res){
  errorHandler.send({errCode:errCode1}, res);
});

app.get('/failerr2', function(req, res){
  errorHandler.send({errCode:errCode2}, res);
});

app.get('/failerr3', function(req, res){
  errorHandler.send({errCode:errCode3}, res);
});

var server = app.listen(6000);


describe('Adding errors', function() {

  before('create logger', function(done){
    var logger = new Logger(config.logConfig);
    errorHandler.init({logger:logger});
    if (utils.fileExists(infoFilePath)) {
      fs.unlinkSync(infoFilePath);
    }
    if (utils.fileExists(warnFilePath)) {
      fs.unlinkSync(warnFilePath);
    }
    if (utils.fileExists(criticalFilePath)) {
      fs.unlinkSync(criticalFilePath);
    }
    done();
  });

  var newError = {
    "prefix": "tbd",
    "errorCodes": {}
  };
  newError.errorCodes[errCode1] = {
    eMsg: err1EMsg,
    description: err1Description,
    sev: err1Sev
  };

  var newErrors = {
    "prefix": "tbd",
    "errorCodes": {}
  };

  newErrors.errorCodes[errCode2] = {
    eMsg: err2EMsg,
    description: err2Description,
    sev: err2Sev
  };

  newErrors.errorCodes[errCode3] = {
    eMsg: err3EMsg,
    description: err3Description,
    sev: err3Sev
  };

  newErrors.errorCodes[errCode4] = {
    description: err4Description,
    sev: err4Sev
  };

  newErrors.errorCodes[errCode5] = {
    eMsg: err5EMsg,
    description: err5Description,
    sev: err5Sev
  };

  it('Adds a single error properly', function(done){
    errorHandler.addErrors(newError);
    assert(errorHandler.errors);
    assert(errorHandler.errors.new_err);
    done();
  });

  it('New error contains the eMsg', function(done){
    assert.equal(errorHandler.errors[errCode1].eMsg, newError.errorCodes[errCode1].eMsg);
    done();
  });

  it('New error contains the description', function(done){
    assert.equal(errorHandler.errors[errCode1].description, newError.errorCodes[errCode1].description);
    done();
  });

  it('New error contains the severity', function(done){
    assert.equal(errorHandler.errors[errCode1].sev, newError.errorCodes[errCode1].sev);
    done();
  });

  it('Adds multiple errors properly', function(done){
    errorHandler.addErrors(newErrors);
    assert(errorHandler.errors);
    assert(errorHandler.errors[errCode2]);
    assert(errorHandler.errors[errCode3]);
    done();
  });

  it('2nd contains the eMsg', function(done){
    assert.equal(errorHandler.errors[errCode2].eMsg, newErrors.errorCodes[errCode2].eMsg);
    done();
  });

  it('3rd contains the eMsg', function(done){
    assert.equal(errorHandler.errors[errCode3].eMsg, newErrors.errorCodes[errCode3].eMsg);
    done();
  });

  it('2nd contains the description', function(done){
    assert.equal(errorHandler.errors[errCode2].description, newErrors.errorCodes[errCode2].description);
    done();
  });

  it('3rd contains the description', function(done){
    assert.equal(errorHandler.errors[errCode3].description, newErrors.errorCodes[errCode3].description);
    done();
  });

  it('2nd contains the severity', function(done){
    assert.equal(errorHandler.errors[errCode2].sev, newErrors.errorCodes[errCode2].sev);
    done();
  });

  it('3rd contains the severity', function(done){
    assert.equal(errorHandler.errors[errCode3].sev, newErrors.errorCodes[errCode3].sev);
    done();
  });

});

describe('parsing', function() {

  it('no err provided', function(done){
    var errResponse = errorHandler.parseError();
    assert.equal(errResponse.msg, 'no error provided to errHandler');
    done();
  });

  it('provide err that is not a string or object', function(done){
    var errResponse = errorHandler.parseError([]);
    assert.equal(errResponse.msg, 'unknown err type');
    done();
  });

  it('when providing a string, msg sthould be a string', function(done){
    var errText = 'some err text';
    var errResponse = errorHandler.parseError(errText);
    assert.equal(errResponse.msg, errText);
    done();
  });

  it('err with no errCode', function(done){
    var errResponse = errorHandler.parseError({});
    assert.equal(errResponse.msg, 'no errCode provided');
    done();
  });

  it('err with a non-matched errCode', function(done){
    var errResponse = errorHandler.parseError({errCode:'blah'});
    assert.equal(errResponse.msg, 'no matched errCode');
    done();
  });

  it('err with no eMsg defined', function(done){
    var errResponse = errorHandler.parseError({errCode:errCode4});
    assert.equal(errResponse.msg, 'no eMsg defined');
    done();
  });

  it('error with a template, but no fields provided', function(done){
    var errResponse = errorHandler.parseError({errCode:errCode5});
    assert.equal(errResponse.errCode, errCode5);
    assert.equal(errResponse.msg, err5EMsg);
    done();
  });

  it('error with fields, but no template', function(done){
    var errResponse = errorHandler.parseError({errCode:errCode1, fields:{foo:'bar'}});
    assert.equal(errResponse.msg, err1EMsg);
    done();
  });

  it('error with fields & template', function(done){
    var fields = {foo:'bar'};
    var errResponse = errorHandler.parseError({errCode:errCode5, fields:fields});
    var compiled = _.template(err5EMsg);
    var result = compiled(fields);
    assert.equal(errResponse.msg, result);
    done();
  });

  it('err with regular code and eMsg', function(done){
    var errResponse = errorHandler.parseError({errCode:errCode1});
    assert.equal(errResponse.msg, err1EMsg);
    done();
  });

});

describe('logging', function() {
  var infoLogArr = [];
  var warnLogArr = [];
  var criticalLogArr = [];

  var infoLogArr2 = [];
  var warnLogArr2 = [];
  var criticalLogArr2 = [];

  it('should contain a logInfo function', function(done){
    assert(errorHandler.logInfo);
    done();
  });

  it('should contain a logWarn function', function(done){
    assert(errorHandler.logWarn);
    done();
  });

  it('should contain a logCritical function', function(done){
    assert(errorHandler.logCritical);
    done();
  });

  it('should log an info log (string)', function(done){
    errorHandler.logInfo(logInfoMsg);
    setTimeout(function(){
      fs.readFile(infoFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            infoLogArr.push(JSON.parse(logLine));
          }
        });
        assert.equal(infoLogArr.length, 1);
        done();
      });
    }, 5);
  });

  it('should log an warn log (string)', function(done){
    errorHandler.logWarn(logWarnMsg);
    setTimeout(function(){
      fs.readFile(warnFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            warnLogArr.push(JSON.parse(logLine));
          }
        });
        assert.equal(warnLogArr.length, 1);
        done();
      });
    }, 5);
  });

  it('should log a critical log (string)', function(done){
    errorHandler.logCritical(logCriticalMsg);
    setTimeout(function(){
      fs.readFile(criticalFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            criticalLogArr.push(JSON.parse(logLine));
          }
        });
        assert.equal(criticalLogArr.length, 1);
        done();
      });
    }, 5);
  });

  it('the info log should contain the same message', function(done){
    assert.equal(infoLogArr[0].msg, logInfoMsg);
    done();
  });

  it('the warn log should contain the same message', function(done){
    assert.equal(warnLogArr[0].msg, logWarnMsg);
    done();
  });

  it('the critical log should contain the same message', function(done){
    assert.equal(criticalLogArr[0].msg, logCriticalMsg);
    done();
  });

  it('the info log should contain a ts', function(done){
    assert(infoLogArr[0].st);
    done();
  });

  it('the warn log should contain the same message', function(done){
    assert(warnLogArr[0].st);
    done();
  });

  it('the critical log should contain the same message', function(done){
    assert(criticalLogArr[0].st);
    done();
  });

  it('should clear out logs', function(done){
    setTimeout(function(){
       if (utils.fileExists(infoFilePath)) {
       fs.unlinkSync(infoFilePath);
       }
       if (utils.fileExists(warnFilePath)) {
       fs.unlinkSync(warnFilePath);
       }
       if (utils.fileExists(criticalFilePath)) {
       fs.unlinkSync(criticalFilePath);
       }
      done();
    }, 5);
  });

  it('should log an info log (obj)', function(done){
    errorHandler.logInfo(logInfoObj);

    setTimeout(function(){
      fs.readFile(infoFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            infoLogArr2.push(JSON.parse(logLine));
          }
        });
        assert.equal(infoLogArr2.length, 1);
        done();
      });
    }, 5);
  });

  it('info log should have the properties in the original obj', function(done){
    for (var key in logInfoObj) {
      assert(infoLogArr2[0][key]);
      assert.equal(infoLogArr2[0][key], logInfoObj[key]);
    }
    done();
  });

  it('should log a warn log (obj)', function(done){
    errorHandler.logWarn(logWarnObj);
    setTimeout(function(){
      fs.readFile(warnFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            warnLogArr2.push(JSON.parse(logLine));
          }
        });
        assert.equal(warnLogArr2.length, 1);
        done();
      });
    }, 5);
  });

  it('warn log should have the properties in the original obj', function(done){
    for (var key in logWarnObj) {
      assert(warnLogArr2[0][key]);
      assert.equal(warnLogArr2[0][key], logWarnObj[key]);
    }
    done();
  });

  it('should log an critical log (obj)', function(done){
    errorHandler.logCritical(logCriticalObj);
    setTimeout(function(){
      fs.readFile(criticalFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            criticalLogArr2.push(JSON.parse(logLine));
          }
        });
        assert.equal(criticalLogArr2.length, 1);
        done();
      });
    }, 5);
  });

  it('critical log should have the properties in the original obj', function(done){
    for (var key in logCriticalObj) {
      assert(criticalLogArr2[0][key]);
      assert.equal(criticalLogArr2[0][key], logCriticalObj[key]);
    }
    done();
  });

});

describe('failed requests', function(done){

  var infoLogArr = [];
  var warnLogArr = [];
  var criticalLogArr = [];

  var errRes1Body = null;
  var errRes2Body = null;
  var errRes3Body = null;

  it('should clear out logs', function(done){
    setTimeout(function(){
      if (utils.fileExists(infoFilePath)) {
        fs.unlinkSync(infoFilePath);
      }
      if (utils.fileExists(warnFilePath)) {
        fs.unlinkSync(warnFilePath);
      }
      if (utils.fileExists(criticalFilePath)) {
        fs.unlinkSync(criticalFilePath);
      }
      done();
    }, 5);
  });

  it('should receive a 500 for err1 endpoint', function(done) {
    var localErr = new Request({hostname: 'localhost', port: 6000, path: '/failerr1'});
    localErr.get(function (err, res) {
      errRes1Body = JSON.parse(res.body);
      assert(res);
      assert.equal(res.statusCode, 500);
      done();
    });
  });

  it('err response msg should match err eMsg', function(done){
    assert.equal(errRes1Body.msg, err1EMsg);
    done();
  });

  it('err response errCode should match err errCode', function(done){
    assert.equal(errRes1Body.errCode, errCode1);
    done();
  });

  it('err response should contain st', function(done){
    assert(errRes1Body.st);
    done();
  });

  it('should log an info log (obj)', function(done){
    setTimeout(function(){
      fs.readFile(infoFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            infoLogArr.push(JSON.parse(logLine));
          }
        });
        assert.equal(infoLogArr.length, 1);
        done();
      });
    }, 5);
  });

  it('logged err msg should match err eMsg', function(done){
    assert.equal(infoLogArr[0].msg, err1EMsg);
    done();
  });

  it('logged err errCode should match err errCode', function(done){
    assert.equal(infoLogArr[0].errCode, errCode1);
    done();
  });

  it('logged err should contain st', function(done){
    assert(infoLogArr[0].st);
    done();
  });

  it('should receive a 500 for err2 endpoint', function(done) {
    var localErr = new Request({hostname: 'localhost', port: 6000, path: '/failerr2'});
    localErr.get(function (err, res) {
      errRes2Body = JSON.parse(res.body);
      assert(res);
      assert.equal(res.statusCode, 500);
      done();
    });
  });

  it('err2 response msg should match err eMsg', function(done){
    assert.equal(errRes2Body.msg, err2EMsg);
    done();
  });

  it('err2 response errCode should match err errCode', function(done){
    assert.equal(errRes2Body.errCode, errCode2);
    done();
  });

  it('err2 response should contain st', function(done){
    assert(errRes2Body.st);
    done();
  });

  it('should log a warn log', function(done){
    setTimeout(function(){
      fs.readFile(warnFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            warnLogArr.push(JSON.parse(logLine));
          }
        });
        assert.equal(warnLogArr.length, 1);
        done();
      });
    }, 5);
  });

  it('logged err2 msg should match err eMsg', function(done){
    assert.equal(warnLogArr[0].msg, err2EMsg);
    done();
  });

  it('logged err2 errCode should match err errCode', function(done){
    assert.equal(warnLogArr[0].errCode, errCode2);
    done();
  });

  it('logged err2 should contain st', function(done){
    assert(warnLogArr[0].st);
    done();
  });

  it('should receive a 500 for err3 endpoint', function(done) {
    var localErr = new Request({hostname: 'localhost', port: 6000, path: '/failerr3'});
    localErr.get(function (err, res) {
      errRes3Body = JSON.parse(res.body);
      assert(res);
      assert.equal(res.statusCode, 500);
      done();
    });
  });

  it('err3 response msg should match err eMsg', function(done){
    assert.equal(errRes3Body.msg, err3EMsg);
    done();
  });

  it('err3 response errCode should match err errCode', function(done){
    assert.equal(errRes3Body.errCode, errCode3);
    done();
  });

  it('err3 response should contain st', function(done){
    assert(errRes3Body.st);
    done();
  });

  it('should log a critical log', function(done){
    setTimeout(function(){
      fs.readFile(criticalFilePath, 'utf8', function (err, data) {
        if (err) throw err;
        var logLines = data.split('\n');
        logLines.forEach(function(logLine){
          if (logLine) {
            criticalLogArr.push(JSON.parse(logLine));
          }
        });
        assert.equal(criticalLogArr.length, 1);
        done();
      });
    }, 5);
  });

  it('logged err3 msg should match err eMsg', function(done){
    assert.equal(criticalLogArr[0].msg, err3EMsg);
    done();
  });

  it('logged err3 errCode should match err errCode', function(done){
    assert.equal(criticalLogArr[0].errCode, errCode3);
    done();
  });

  it('logged err3 should contain st', function(done){
    assert(criticalLogArr[0].st);
    done();
  });

});

//TOOD: write test for different http code (other than 500) in the error.json


describe('cleanup', function(){
  it('should slow down completion', function(done){
    setTimeout(function(){
      var infoFilePath = path.join(logPath, expectedInfoFileName);
      var warnFilePath = path.join(logPath, expectedWarnFileName);
      var criticalFilePath = path.join(logPath, expectedCriticalFileName);
      if (utils.fileExists(infoFilePath)) {
        fs.unlinkSync(infoFilePath);
      }
      if (utils.fileExists(warnFilePath)) {
        fs.unlinkSync(warnFilePath);
      }
      if (utils.fileExists(criticalFilePath)) {
        fs.unlinkSync(criticalFilePath);
      }
      done();
    }, 5);
  })
});



//convenience methods
function getMonth(now){
  var month = now.getMonth() + 1;
  if (month.toString().length === 1) month = '0' + (month +1).toString();
  return month;
}

function getDay(now){
  var day = now.getDate();
  if (day.toString().length === 1) day = '0' + day.toString();
  return day;
}