'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.history = exports.store = undefined;var _redux = require('redux');
var _reduxThunk = require('redux-thunk');var _reduxThunk2 = _interopRequireDefault(_reduxThunk);
var _url = require('url');var _url2 = _interopRequireDefault(_url);

var _history = require('./telegram/history');var _history2 = _interopRequireDefault(_history);
var _message = require('./telegram/message');var _message2 = _interopRequireDefault(_message);

var _logger = require('./logger');
var _config2 = require('./config');var _config3 = _interopRequireDefault(_config2);
var _commands2 = require('./enums/commands');var _commands3 = _interopRequireDefault(_commands2);
var _root = require('./lib/root');var _root2 = _interopRequireDefault(_root);
var _fs = require('./lib/lib/fs');var _fs2 = _interopRequireDefault(_fs);
var _wwwServer = require('./lib/lib/www-server');

var _timer = require('./telegram/timer');var _timer2 = _interopRequireDefault(_timer);
var _reducers = require('./reducers');var _reducers2 = _interopRequireDefault(_reducers);
var _telegram = require('./telegram/telegram');var _telegram2 = _interopRequireDefault(_telegram);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // TODO: should be refactored

(0, _logger.log)('Start bot', _logger.logLevel.INFO);

var enhancer = (0, _redux.compose)(
(0, _redux.applyMiddleware)(_reduxThunk2.default));

var store = exports.store = null;
var history = exports.history = new _history2.default(_config3.default.dirStorage, 'balance-hist-$[id].json');

var fileSystem = new _fs2.default();

var HISTORY_PAGE_COUNT = 150;

// TODO: extenal library
var parseUrlParams = function parseUrlParams(urlWithParams) {
    var uri = decodeURI(urlWithParams);
    var res = {};
    if (uri.indexOf('?') === -1) return res;
    uri.split('?')[1].split('&').forEach(function (pairItem) {
        var pair = pairItem.split('=');
        if (pair[0] && pair[1] !== undefined && pair[1] !== null && pair[1] !== '') {
            res[pair[0]] = pair[1];
        }
    });
    return res;
};

fileSystem.isExists(_config3.default.dirStorage).
then(function () {return fileSystem.isExists(_config3.default.fileState);}).
then(function () {return fileSystem.readJson(_config3.default.fileState);}).
then(function (stateFromFile) {
    var state = stateFromFile || {};
    exports.store = store = (0, _redux.createStore)(_reducers2.default, state, enhancer);
    var bot = new _telegram2.default();
    bot.listen();

    var weekly = new _timer2.default('weekly', function () {
        var promises = [];
        Object.keys(store.getState().balance).
        forEach(function (chatId) {
            // INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
            promises.push(bot.trigger(_commands3.default.BALANCE_STATS, new _message2.default({
                chat: {
                    id: chatId },

                text: '/stat mo su' })));

        });
        Promise.all(promises).
        then(function () {return (0, _logger.log)('Еженедельная рассылка прошла успешно.', _logger.logLevel.INFO);}).
        catch(function (ex) {return (0, _logger.log)('\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u0440\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u0440\u043E\u0448\u043B\u0430 \u0441 \u043E\u0448\u0438\u0431\u043A\u043E\u0439. ' + ex, _logger.logLevel.ERROR);});
        weekly.start({
            dateTime: _root2.default.time.getChangedDateTime({ seconds: 23 },
            _root2.default.time.getMonday(new Date(), true)) });

    });
    var monthly = new _timer2.default('monthly', function () {
        var promises = [];
        Object.keys(store.getState().balance).
        forEach(function (chatId) {
            // INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
            promises.push(bot.trigger(_commands3.default.BALANCE_STATS, new _message2.default({
                chat: {
                    id: chatId },

                text: '/stat 1.' + new Date().getMonth() // prev month
            })));
            promises.push(bot.trigger(_commands3.default.BALANCE_REPORT, new _message2.default({
                chat: {
                    id: chatId,
                    title: 'monthly-' + _root2.default.time.dateString() },

                text: '/repo' }),
            {
                noBalance: true }));

        });
        Promise.all(promises).
        then(function () {return (0, _logger.log)('Ежемесячная рассылка прошла успешно.', _logger.logLevel.INFO);}).
        catch(function (ex) {return (0, _logger.log)('\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u0430\u044F \u0440\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u0440\u043E\u0448\u043B\u0430 \u0441 \u043E\u0448\u0438\u0431\u043A\u043E\u0439. ' + ex, _logger.logLevel.ERROR);});
        var dt = new Date();
        var nextMonth = _root2.default.time.getChangedDateTime({ months: 1, seconds: 23 },
        new Date(dt.getFullYear(), dt.getMonth(), 1));
        monthly.start({ dateTime: nextMonth });
    });

    (0, _logger.log)('Set timers...', _logger.logLevel.INFO);
    var monday = _root2.default.time.getChangedDateTime({ seconds: 23 },
    _root2.default.time.getMonday(new Date(), true));
    (0, _logger.log)('Set weekly timer. Next monday: ' + monday, _logger.logLevel.INFO);
    weekly.start({ dateTime: monday });

    var dt = new Date();
    var nextMonth = _root2.default.time.getChangedDateTime({ months: 1, seconds: 23 },
    new Date(dt.getFullYear(), dt.getMonth(), 1));
    (0, _logger.log)('Set monthly timer. Next month: ' + nextMonth, _logger.logLevel.INFO);
    monthly.start({ dateTime: nextMonth });

    // WWW
    var handleApiCall = function handleApiCall(data) {
        var uri = _url2.default.parse(data.request.url).pathname;
        switch (uri) {
            case '/api/historyGet':
                {
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' });
                        data.response.end();
                        break;
                    }
                    var params = parseUrlParams(data.request.url);var
                    id = params.id,categories = params.categories,users = params.users,dateStart = params.dateStart,dateEnd = params.dateEnd;
                    var skipParam = params.skip || 0;
                    var skip = +skipParam;
                    history.getAll(id).
                    then(function (items) {
                        data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                        var cats = categories ? categories.split(',') : [];
                        var usrs = users ? users.split(',') : [];
                        var dtStart = dateStart ? new Date(+dateStart) : null;
                        var dtEnd = dateEnd ? new Date(+dateEnd) : null;
                        var elements = items.
                        filter(function (item) {return (cats.length === 0 || cats.indexOf(item.category) > -1) && (
                            usrs.length === 0 || usrs.indexOf('' + item.user_id) > -1) && (
                            !dtStart || dtStart.getTime() <= new Date(item.date_create).getTime()) && (
                            !dtEnd || dtEnd.getTime() > new Date(item.date_create).getTime());}).
                        sort(function (a, b) {return b.id - a.id;});
                        var elementsLength = elements.length;
                        if (skip === -1)
                        skip = elementsLength - HISTORY_PAGE_COUNT;
                        var skipped = elements.sort(function (a, b) {return b.id - a.id;}).splice(+skip);
                        skipped.splice(HISTORY_PAGE_COUNT);
                        data.response.end(JSON.stringify({
                            data: skipped,
                            meta: {
                                length: elementsLength } }));


                    }).
                    catch(function () {
                        data.response.writeHead(500, { 'Content-Type': 'text/plain' });
                        data.response.write('Can\'t read file');
                        data.response.end();
                    });
                }
                break;
            case '/api/users':{
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' });
                        data.response.end();
                        break;
                    }var _store$getState =
                    store.getState(),_users = _store$getState.users;
                    data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    data.response.end(JSON.stringify(_users));
                }
                break;
            case '/api/categories':
                {
                    if (data.request.method !== 'POST') {
                        data.response.writeHead(404, { 'Content-Type': 'text/plain' });
                        data.response.end();
                        break;
                    }var _parseUrlParams =
                    parseUrlParams(data.request.url),chatId = _parseUrlParams.chatId;
                    data.response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    data.response.end(JSON.stringify(store.getState().paymentGroups[chatId]));
                }
                break;
            default:

            // no-op
        }
    };
    _root2.default.www.apiUrls = ['/api/historyGet', '/api/users', '/api/categories'];
    _root2.default.www.httpServerSet = 42042;
    _root2.default.www.response.subscribe(function (serverData) {var
        data = serverData.data,status = serverData.status;
        switch (status) {
            case _wwwServer.RESPONSE_STATUS.HTTP_200:
                break;
            case _wwwServer.RESPONSE_STATUS.HTTP_404:
                data.response.writeHead(200, { 'Content-Type': 'text/plain' });
                data.response.end('404 Not Found\n');
                break;
            case _wwwServer.RESPONSE_STATUS.API_CALL:
                handleApiCall(data);
                break;
            default:
            // no-op
        }
    });
    // END WWW
}).
catch(function () {
    (0, _logger.log)('Directory ' + _config3.default.dirStorage + ' or file ' + _config3.default.fileState + ' with content or [] not exist', _logger.logLevel.ERROR);
});