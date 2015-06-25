zefti-error-handler
===================

Zefti Error Handler is an error handler library.

Setup
=====

var ErrorHandler = require('zefti-error-handler')();

var errorHandler = new ErrorHandler(options);


Example
=======
var ErrorHandler = require('zefti-error-handler')();
var errorHandler = new ErrorHandler(options);
errorHandler.addErrors(errDefinitions);

//Send an Error
errorHandler.send({errCode:1234, payload:'payload here'}, res);
/* Sends an error based on definition and severity in the errArray */

//Lookup an Error
errorHandler.lookup(errCode)
=> Results in the errObject from the errDefinitions;


Options
=======
env : dev || prod
sev : sevObj
debug : true || false (default false)



Severity Definition
-------------------
Example:
{
  s1: [logInfo]
  s2: [logWarn]
  s3: [logCritical]
  s4: [logCritical, email]
  s5: [logCritical, sms]
}

Options:
logInfo: log in the info file
logWarn: log in the warn file
logCritical: log in the critical file
sms: send sms with error
email: send email with error





Usage
=====

Adding errors
-------------
errorHandler.addErrors(errDefinitions);

/* errDefinitions takes the form:
{
  "prefix" : "optional",
  "errorCodes" : {
    "id1" : {
      "eMsg" : "External Message here",
      "iMsg" : "Internal Message here",
      "description" : "Description here",
      "sev" : 2,
      "module" : "module name here"
    },
    "id2" : {
      "eMsg" : ...,
      "iMsg" : ...
      "description" : ...,
      "sev" : ...,
      "module" : ...
    },
    ...
*/

Sending errors
--------------
errorHandler.send(errObj || errString, res);

/* errObj takes the form:
  {errCode: id1, payload:payload}
/*


Lookup error
------------
errorHandler.lookup(errCode);
=> returns the errObj from the errDefinitions

/* errCode is the id of the err (usually a string or number) */



Default Severity Settings
=========================
1 = log info
2 = log error
3 = log error &
3 = log critical error
4 =



