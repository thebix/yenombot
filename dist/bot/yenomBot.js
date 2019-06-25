'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _rxjs = require('rxjs');
var _isomorphicFetch = require('isomorphic-fetch');var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);
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
var dailyIntervalTimer = new _timer.IntervalTimerRx(_timer.timerTypes.DAILY);

var getCommandsForReportWeeklyObservable = function getCommandsForReportWeeklyObservable() {return (
        weeklyIntervalTimer.timerEvent().
        switchMap(function () {return _storage2.default.getStorageKeys();}).
        switchMap(function (chatIds) {return _rxjs.Observable.from(chatIds);}).
        filter(function (chatId) {return chatId !== _storage.archiveName;}).
        map(function (chatId) {return _message2.default.createCommand(chatId, '/stat mo su');}));};

var getCommandsForReportMonthlyObservable = function getCommandsForReportMonthlyObservable() {return (
        monthlyIntervalTimer.timerEvent().
        switchMap(function () {return _storage2.default.getStorageKeys();}).
        switchMap(function (chatIds) {return _rxjs.Observable.from(chatIds);}).
        filter(function (chatId) {return chatId !== _storage.archiveName;}).
        map(function (chatId) {return _message2.default.createCommand(chatId, '/stat 1.' + new Date().getMonth());}));};

// region Currencies update

var getCurrencyRateObservable = function getCurrencyRateObservable() {return (
        _rxjs.Observable.fromPromise((0, _isomorphicFetch2.default)('http://api.ratesapi.io/api/latest').
        then(
        function (response) {return response.json();},
        function (error) {
            throw Error('Error while fetching currency rates. error=<' + error + '>');
        })).

        catch(function (error) {return (0, _logger.log)('' + error);}, _logger.logLevel.ERROR));};

var getChatsCurrenciesObservable = function getChatsCurrenciesObservable() {return (
        _storage2.default.getStorageKeys().
        switchMap(function (chatIds) {return _rxjs.Observable.from(chatIds);}).
        filter(function (chatId) {return chatId !== _storage.archiveName;}).
        switchMap(function (chatId) {return (
                _storage2.default.getItem((0, _handlers.storageId)(null, chatId), 'currencies').
                filter(function (currencies) {return !!currencies;}).
                filter(function (currencies) {return Object.keys(currencies).length > 1;}).
                map(function (currencies) {return Object.create({
                        chatId: chatId,
                        currencies: currencies || { RUB: 1 } });}));}));};

var updateCurrenciesDailyObservable = function updateCurrenciesDailyObservable() {return (
        _rxjs.Observable.merge(
        dailyIntervalTimer.timerEvent(),
        _rxjs.Observable.of(true) // check currencies every start
        ).
        switchMap(function () {return _rxjs.Observable.combineLatest(
            getCurrencyRateObservable(),
            getChatsCurrenciesObservable(),
            function (currencyRate, _ref) {var chatId = _ref.chatId,currencies = _ref.currencies;return (
                    Object.create({
                        currencyRates: currencyRate.rates,
                        chatId: chatId,
                        currencies: currencies }));});}).


        map(function (_ref2) {var currencyRates = _ref2.currencyRates,chatId = _ref2.chatId,currencies = _ref2.currencies;
            // TODO: atm base is EUR, consider calculate rate properly based on user's selected currency
            var newCurrencies = Object.assign({}, currencies);
            Object.keys(currencies).
            filter(function (currency) {return currency !== 'EUR';}).
            filter(function (currency) {return !!currencyRates[currency];}).
            forEach(function (currency) {
                newCurrencies[currency] = currencyRates[currency];
            });
            return { chatId: chatId, newCurrencies: newCurrencies, oldCurrencies: currencies };
        }).
        flatMap(function (_ref3) {var chatId = _ref3.chatId,newCurrencies = _ref3.newCurrencies,oldCurrencies = _ref3.oldCurrencies;return (
                _storage2.default.updateItem((0, _handlers.storageId)(null, chatId), 'currencies', newCurrencies).
                do(function (isSaved) {
                    if (!isSaved) {
                        (0, _logger.log)('Error updating currencies in storage for the chat ' + chatId, _logger.logLevel.ERROR);
                    }
                }).
                filter(function (isSaved) {return isSaved;}).
                map(function () {return Object.create({ chatId: chatId, newCurrencies: newCurrencies, oldCurrencies: oldCurrencies });}));}));};

// endregion

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
    var serverMessagesObservable = updateCurrenciesDailyObservable().
    map(function (_ref4) {var chatId = _ref4.chatId,newCurrencies = _ref4.newCurrencies,oldCurrencies = _ref4.oldCurrencies;
        var baseCurrency = Object.keys(oldCurrencies).
        filter(function (oldCurrencyKey) {return oldCurrencies[oldCurrencyKey] === 1;})[0];
        var rateChangesText = Object.keys(oldCurrencies).
        filter(function (oldCurrencyKey) {return oldCurrencies[oldCurrencyKey] !== 1;}).
        map(function (oldCurrencyKey) {
            var sign = '↔️';
            if (oldCurrencies[oldCurrencyKey] < newCurrencies[oldCurrencyKey]) {
                sign = '⬆️';
            } else if (oldCurrencies[oldCurrencyKey] > newCurrencies[oldCurrencyKey]) {
                sign = '⬇️';
            }
            return '\n' + oldCurrencyKey + ': ' + oldCurrencies[oldCurrencyKey] + ' \u2192 ' + newCurrencies[oldCurrencyKey] + ' ' + sign;
        });
        var text = '\u041A\u0443\u0440\u0441 \u043D\u0430 \u043F\u0440\u0435\u0434\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u0434\u0435\u043D\u044C.\n\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u0432\u0430\u043B\u044E\u0442\u0430: ' + baseCurrency + ' ' + rateChangesText;
        return _message.BotMessage.createMessageForChat(
        chatId,
        text);

    }).
    mergeMap(mapBotMessageToSendResult);

    weeklyIntervalTimer.start();
    dailyIntervalTimer.start();
    // eslint-disable-next-line max-len
    // TODO: removed monthly timer in order to avoid timer bug. Timer class should be refactored. error: (node:28334) TimeoutOverflowWarning: 2433606194 does not fit into a 32-bit signed integer. Timeout duration was set to 1
    // monthlyIntervalTimer.start()
    return _rxjs.Observable.merge(userTextObservalbe, userActionsObservable, serverMessagesObservable);
};