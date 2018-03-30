'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _rxjs = require('rxjs');
var _logger = require('../logger');
var _config = require('../config');var _config2 = _interopRequireDefault(_config);
var _token = require('../token');var _token2 = _interopRequireDefault(_token);
var _telegram = require('./telegram');var _telegram2 = _interopRequireDefault(_telegram);
var _handlers = require('./handlers');var _handlers2 = _interopRequireDefault(_handlers);
var _storage = require('../storage');var _storage2 = _interopRequireDefault(_storage);
var _timer = require('../lib/lib/timer');
var _message = require('./message');var _message2 = _interopRequireDefault(_message);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var telegram = new _telegram2.default(_config2.default.isProduction ? _token2.default.botToken.prod : _token2.default.botToken.dev);
var weeklyIntervalTimer = new _timer.IntervalTimerRx(_timer.timerTypes.WEEKLY);
var monthlyIntervalTimer = new _timer.IntervalTimerRx(_timer.timerTypes.MONTHLY);

var getCommandsForReportWeeklyObservable = function getCommandsForReportWeeklyObservable() {return (
        weeklyIntervalTimer.timerEvent().
        switchMap(function () {return _storage2.default.getStorageKeys();}).
        switchMap(function (chatIds) {return _rxjs.Observable.from(chatIds);}).
        filter(function (chatId) {return chatId !== _storage.archiveName;}).
        map(function (chatId) {return (
                _message2.default.createCommand(chatId, '/stat mo su'));}));};


var getCommandsForReportMonthlyObservable = function getCommandsForReportMonthlyObservable() {return (
        monthlyIntervalTimer.timerEvent().
        switchMap(function () {return _storage2.default.getStorageKeys();}).
        switchMap(function (chatIds) {return _rxjs.Observable.from(chatIds);}).
        filter(function (chatId) {return chatId !== _storage.archiveName;}).
        map(function (chatId) {return (
                _message2.default.createCommand(chatId, '/stat 1.' + new Date().getMonth()));}));};


var mapBotMessageToSendResult = function mapBotMessageToSendResult(message) {
    var sendOrEditResultObservable = message.messageIdToEdit ?
    telegram.botMessageEdit(message) :
    telegram.botMessage(message);
    return sendOrEditResultObservable.
    switchMap(function (sendOrEditResult) {var
        statusCode = sendOrEditResult.statusCode,messageText = sendOrEditResult.messageText;var
        chatId = message.chatId;
        if (statusCode === 403) {
            return _storage2.default.archive(chatId).
            map(function () {
                (0, _logger.log)('yenomBot: chatId<' + chatId + '> forbidden error: <' + messageText + '>, message: <' + JSON.stringify(message) + '>, moving to archive', _logger.logLevel.INFO); // eslint-disable-line max-len
                return sendOrEditResult;
            });
        }
        if (statusCode !== 200) {
            (0, _logger.log)('yenomBot: chatId<' + chatId + '> telegram send to user error: statusCode: <' + statusCode + '>, <' + messageText + '>, message: <' + JSON.stringify(message) + '>,', _logger.logLevel.ERROR); // eslint-disable-line max-len
        }
        return _rxjs.Observable.of(sendOrEditResult);
    });
};exports.default =

function () {
    (0, _logger.log)('yenomBot.startYenomBot()', _logger.logLevel.INFO);
    var userTextObservalbe =
    _rxjs.Observable.merge(
    telegram.userText(),
    getCommandsForReportWeeklyObservable(),
    getCommandsForReportMonthlyObservable()).

    observeOn(_rxjs.Scheduler.asap).
    mergeMap(_handlers2.default).
    mergeMap(mapBotMessageToSendResult);
    var userActionsObservable = telegram.userActions().
    observeOn(_rxjs.Scheduler.asap).
    mergeMap(_handlers.mapUserActionToBotMessages).
    mergeMap(mapBotMessageToSendResult);
    weeklyIntervalTimer.start();
    monthlyIntervalTimer.start();
    return _rxjs.Observable.merge(userTextObservalbe, userActionsObservable);
};