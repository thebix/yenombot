'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.history = exports.store = undefined;var _redux = require('redux');
var _reduxThunk = require('redux-thunk');var _reduxThunk2 = _interopRequireDefault(_reduxThunk);
var _filesystem = require('./lib/filesystem');var _filesystem2 = _interopRequireDefault(_filesystem);
var _history = require('./lib/history');var _history2 = _interopRequireDefault(_history);
var _message = require('./lib/message');var _message2 = _interopRequireDefault(_message);

var _logger = require('./logger');
var _config2 = require('./config');var _config3 = _interopRequireDefault(_config2);
var _commands2 = require('./enums/commands');var _commands3 = _interopRequireDefault(_commands2);
var _index = require('./lib/index');var _index2 = _interopRequireDefault(_index);

var _timer = require('./lib/timer');var _timer2 = _interopRequireDefault(_timer);
var _reducers = require('./reducers');var _reducers2 = _interopRequireDefault(_reducers);
var _telegram = require('./lib/telegram');var _telegram2 = _interopRequireDefault(_telegram);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

(0, _logger.log)('Start bot', _logger.logLevel.INFO);

var enhancer = (0, _redux.compose)(
(0, _redux.applyMiddleware)(_reduxThunk2.default));

var store = exports.store = null;
var history = exports.history = new _history2.default(_config3.default.dirStorage, 'balance-hist-${id}.json');

if (_filesystem2.default.isDirExists(_config3.default.dirStorage, true) &&
_filesystem2.default.isFileExists(_config3.default.fileState, true, false, '{}')) {//TODO: починить варнинг
    _filesystem2.default.readJson(_config3.default.fileState).
    then(function (state) {
        state = state || {};
        exports.store = store = (0, _redux.createStore)(_reducers2.default, state, enhancer);
        var bot = new _telegram2.default();
        bot.listen();

        //INFO: for test
        // const daily = new Timer('daily', type => {
        //     const promises = []
        //     Object.keys(store.getState().balance)
        //         .forEach(chatId => {
        //             //INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
        //             promises.push(bot.trigger(_commands.BALANCE_STATS, new Message({
        //                 chat: {
        //                     id: chatId
        //                 },
        //                 text: `/stat`
        //             })))
        //         })
        //     Promise.all(promises)
        //         .then(res => log(`Ежедневная рассылка прошла успешно.`, logLevel.INFO))
        //         .catch(ex => log(`Ежедневная рассылка прошла с ошибкой. ${ex}`, logLevel.ERROR))
        //     const dt = new Date()
        //     let nextDay = lib.time.getChangedDateTime({ days: 1, minutes: 23 },
        //         new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()))
        //     daily.start({ dateTime: nextDay })
        // })

        var weekly = new _timer2.default('weekly', function (type) {
            var promises = [];
            Object.keys(store.getState().balance).
            forEach(function (chatId) {
                //INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
                promises.push(bot.trigger(_commands3.default.BALANCE_STATS, new _message2.default({
                    chat: {
                        id: chatId },

                    text: '/stat mo' })));

            });
            Promise.all(promises).
            then(function (res) {return (0, _logger.log)('\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u0440\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u0440\u043E\u0448\u043B\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E.', _logger.logLevel.INFO);}).
            catch(function (ex) {return (0, _logger.log)('\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u0440\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u0440\u043E\u0448\u043B\u0430 \u0441 \u043E\u0448\u0438\u0431\u043A\u043E\u0439. ' + ex, _logger.logLevel.ERROR);});
            weekly.start({
                dateTime: _index2.default.time.getChangedDateTime({ minutes: 23 },
                _index2.default.time.getMonday(new Date(), true)) });

        });
        var monthly = new _timer2.default('monthly', function (type) {
            var promises = [];
            Object.keys(store.getState().balance).
            forEach(function (chatId) {
                //INFO: при большом количестве чатов тут будет жопа, надо слать бандлами
                promises.push(bot.trigger(_commands3.default.BALANCE_STATS, new _message2.default({
                    chat: {
                        id: chatId },

                    text: '/stat 1' })));

                promises.push(bot.trigger(_commands3.default.BALANCE_REPORT, new _message2.default({
                    chat: {
                        id: chatId,
                        title: 'monthly-' + _index2.default.time.dateString() },

                    text: '/repo' }),
                {
                    noBalance: true }));

            });
            Promise.all(promises).
            then(function (res) {return (0, _logger.log)('\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u0430\u044F \u0440\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u0440\u043E\u0448\u043B\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E.', _logger.logLevel.INFO);}).
            catch(function (ex) {return (0, _logger.log)('\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u0430\u044F \u0440\u0430\u0441\u0441\u044B\u043B\u043A\u0430 \u043F\u0440\u043E\u0448\u043B\u0430 \u0441 \u043E\u0448\u0438\u0431\u043A\u043E\u0439. ' + ex, _logger.logLevel.ERROR);});
            var dt = new Date();
            var nextMonth = _index2.default.time.getChangedDateTime({ months: 1, minutes: 23 },
            new Date(dt.getFullYear(), dt.getMonth(), 1));
            monthly.start({ dateTime: nextMonth });
        });

        (0, _logger.log)('Set timers...', _logger.logLevel.INFO);
        var monday = _index2.default.time.getChangedDateTime({ minutes: -7 },
        _index2.default.time.getMonday(new Date(), true));
        (0, _logger.log)('Set weekly timer. Next monday: ' + monday, _logger.logLevel.INFO);
        weekly.start({ dateTime: monday });

        var dt = new Date();
        var nextMonth = _index2.default.time.getChangedDateTime({ months: 1, minutes: -7 },
        new Date(dt.getFullYear(), dt.getMonth(), 1));
        (0, _logger.log)('Set monthly timer. Next month: ' + nextMonth, _logger.logLevel.INFO);
        monthly.start({ dateTime: nextMonth });

        //INFO: for test
        // let nextDay = lib.time.getChangedDateTime({ days: 1, hours: -16 },
        //     new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()))
        // log(`Set daily timer. Next day: ${nextDay}`, logLevel.INFO)
        // daily.start({ dateTime: nextDay })

        // .then((data) => {
        //     l('🤖  Listening to incoming messages')
        // })
        // .catch(ex => log(ex, logLevel.ERROR))
    }).
    catch(function (x) {
        (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F. err = ' + x, _logger.logLevel.ERROR);
    });
}