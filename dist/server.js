'use strict';var _rxjs = require('rxjs');
var _nodeCleanup = require('node-cleanup');var _nodeCleanup2 = _interopRequireDefault(_nodeCleanup);
var _yenomBot = require('./bot/yenomBot');var _yenomBot2 = _interopRequireDefault(_yenomBot);
var _yenomWww = require('./yenomWww');var _yenomWww2 = _interopRequireDefault(_yenomWww);
var _storage = require('./storage');
var _logger = require('./logger');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

(0, _logger.log)('Starting server', _logger.logLevel.INFO);

var compositeSubscription = new _rxjs.Subscription();

(0, _nodeCleanup2.default)(function (exitCode, signal) {
    (0, _logger.log)('server:nodeCleanup: clean. exitCode: <' + exitCode + '>, signal: <' + signal + '>', _logger.logLevel.INFO);
    compositeSubscription.unsubscribe();
});

// bot
compositeSubscription.add(_storage.storage.isInitialized().
filter(function (isStorageInitizlized) {return isStorageInitizlized;}).
mergeMap(function () {return (0, _yenomBot2.default)();}).
subscribe(
function () {},
function (error) {
    (0, _logger.log)('Unhandled exception: server.yenombot: error while handling userText / userActions. Error=' + (error && error.message ?
    error.message : JSON.stringify(error)), _logger.logLevel.ERROR);
    compositeSubscription.unsubscribe();
}));


// www
compositeSubscription.add(_storage.storage.isInitialized().
filter(function (isStorageInitizlized) {return isStorageInitizlized;}).
mergeMap(function () {return (0, _yenomWww2.default)();}).
subscribe(
function () {},
function (error) {
    (0, _logger.log)('Unhandled exception: server.yenomWww: Error=' + (error && error.message ? error.message : JSON.stringify(error)), _logger.logLevel.ERROR);
    compositeSubscription.unsubscribe();
}));