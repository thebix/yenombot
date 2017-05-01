'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.store = undefined;

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _filesystem = require('./filesystem');

var _filesystem2 = _interopRequireDefault(_filesystem);

var _logger = require('./logger');

var _config2 = require('./config');

var _config3 = _interopRequireDefault(_config2);

var _reducers = require('./reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _telegram = require('./lib/telegram');

var _telegram2 = _interopRequireDefault(_telegram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _logger.l)('Start bot');

var enhancer = (0, _redux.compose)((0, _redux.applyMiddleware)(_reduxThunk2.default));
var store = exports.store = null;

if (_filesystem2.default.isDirExists(_config3.default.dirStorage, true) && _filesystem2.default.isFileExists(_config3.default.fileState, true, false, '{}')) {
    //TODO: починить варнинг
    _filesystem2.default.readJson(_config3.default.fileState).then(function (state) {
        state = state || {};
        exports.store = store = (0, _redux.createStore)(_reducers2.default, state, enhancer);
        new _telegram2.default().listen();
        // .then((data) => {
        //     l('🤖  Listening to incoming messages')
        // })
        // .catch(ex => log(ex, logLevel.ERROR))
    }).catch(function (x) {
        (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F. err = ' + x, _logger.logLevel.ERROR);
    });
}