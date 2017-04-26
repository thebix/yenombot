'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _logger = require('../logger');

var _config2 = require('../config');

var _config3 = _interopRequireDefault(_config2);

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
        key: 'isAskingForBalanceChange',
        value: function isAskingForBalanceChange(text) {
            var pattern = /[-+]?[0-9]*\.?[0-9]*/i; //TODO: улучшить регекс определения арифметического выражения
            var res = text.match(pattern);
            return res && res.length > 0 && parseInt(res[0]) > 0;
        }
        // isAskingForGenreList(text) {
        //     const pattern = /music|recommendation/i

        //     return text.match(pattern)
        // }

        // isAskingForNumberOfRec(text, prevCommand) {
        //     return prevCommand === commands.GET_GENRE_LIST
        // }

        // isAskingForRecommendation(text, prevCommand) {
        //     return prevCommand === commands.SET_NUMBER_OF_REC
        // }

    }]);

    return InputParser;
}();

exports.default = InputParser;