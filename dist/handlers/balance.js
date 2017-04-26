'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _exprEval = require('expr-eval');

var _config2 = require('../config');

var _config3 = _interopRequireDefault(_config2);

var _server = require('../server');

var _actions = require('../actions');

var _commands2 = require('../enums/commands');

var _commands3 = _interopRequireDefault(_commands2);

var _logger = require('../logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Balance = function () {
    function Balance() {
        _classCallCheck(this, Balance);
    }

    _createClass(Balance, [{
        key: 'initIfNeed',
        value: function initIfNeed(message, bot) {
            var balance = _server.store.getState().balance[message.chat.id];
            if (balance === undefined || balance === null || balance === '') {
                var period = new Date().getMonth();
                _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));
            }
        }
    }, {
        key: 'change',
        value: function change(message, bot) {
            var text = message.text;


            var parser = new _exprEval.Parser();
            try {
                text = parser.parse(text).evaluate();
            } catch (ex) {
                bot.sendMessage(message.chat.id, '\u041D\u0435 \u043F\u043E\u043D\u044F\u043B \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \uD83E\uDD16');
                return;
            }

            var period = new Date().getMonth();
            var balance = _server.store.getState().balance[message.chat.id];
            if (balance && balance.period != period) _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));
            _server.store.dispatch((0, _actions.balanceChange)(message.chat.id, period, text));
            var newState = _server.store.getState();
            balance = newState.balance[message.chat.id].balance;
            _server.store.dispatch((0, _actions.jsonSave)(_config3.default.fileState, newState));

            bot.sendMessage(message.chat.id, '\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + balance + ' \uD83E\uDD16');
        }
    }]);

    return Balance;
}();

exports.default = Balance;