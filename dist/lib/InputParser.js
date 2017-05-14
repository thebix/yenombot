'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('../logger');

var _config2 = require('../config');

var _config3 = _interopRequireDefault(_config2);

var _commands2 = require('../enums/commands');

var _commands3 = _interopRequireDefault(_commands2);

var _server = require('../server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputParser = function () {
    function InputParser() {
        _classCallCheck(this, InputParser);
    }

    _createClass(InputParser, [{
        key: 'isDeveloper',
        value: function isDeveloper(id) {
            return _config3.default.developers && _config3.default.developers.length > 0 && _config3.default.developers.some(function (x) {
                return x == id;
            });
        }
    }, {
        key: 'isAskingForEcho',
        value: function isAskingForEcho(text) {
            return true;
        }
    }, {
        key: 'isAskingForHelp',
        value: function isAskingForHelp(text) {
            var pattern = /help|помощь/i;
            return text.match(pattern);
        }
    }, {
        key: 'isAskingForStart',
        value: function isAskingForStart(text) {
            var pattern = /start/i;
            return text.match(pattern);
        }
    }, {
        key: 'isAskingForInitToken',
        value: function isAskingForInitToken(text) {
            var pattern = /token/i;
            return text.match(pattern);
        }
    }, {
        key: 'isAskingForBalance',
        value: function isAskingForBalance(text) {
            var pattern = /^\/bal$|^\/balance$/i;
            return text.match(pattern);
        }
    }, {
        key: 'isAskingForBalanceInit',
        value: function isAskingForBalanceInit(text) {
            var pattern = /^\/bal init$|^\/balance init$/i;
            return text.match(pattern);
        }
    }, {
        key: 'isAskingForBalanceChange',
        value: function isAskingForBalanceChange(text) {
            // const pattern = /[-+]?[0-9]*\.?[0-9]*/i
            var pattern = /^([0-9\-\*\+\/\s\(\)\.,]+)$/;
            var res = text.match(pattern);
            return !!res && res.length > 0 && res.some(function (x) {
                return !!x;
            });
        }
    }, {
        key: 'isAskingForCategoryChange',
        value: function isAskingForCategoryChange(text, prevCommand, data) {
            return data && data.cmd == "" + _commands3.default.BALANCE_CATEGORY_CHANGE;
        }
    }, {
        key: 'isAskingForCommentChange',
        value: function isAskingForCommentChange(text, prevCommand) {
            var res = prevCommand && (prevCommand == _commands3.default.BALANCE_CHANGE || prevCommand == _commands3.default.BALANCE_CATEGORY_CHANGE);

            return res;
        }
    }, {
        key: 'isAskingForBalanceDelete',
        value: function isAskingForBalanceDelete(text, prevCommand, data) {
            return data.cmd == _commands3.default.BALANCE_REMOVE;
        }
    }, {
        key: 'isAskingForReport',
        value: function isAskingForReport(text) {
            var pattern = /^\/repo|report/i;
            return text.match(pattern);
        }
    }, {
        key: 'isAskingForStats',
        value: function isAskingForStats(text) {
            var pattern = /^\/stat|stats/i;
            return text.match(pattern);
        }
    }]);

    return InputParser;
}();

exports.default = InputParser;