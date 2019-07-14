'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _token = require('../token');var _token2 = _interopRequireDefault(_token);
var _commands = require('./commands');var _commands2 = _interopRequireDefault(_commands);
var _message = require('./message');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

InputParser = function () {function InputParser() {_classCallCheck(this, InputParser);}_createClass(InputParser, null, [{ key: 'isDeveloper', value: function isDeveloper(
        id) {
            return _message.USER_ID_UNUSED === id ||
            _token2.default.developers &&
            _token2.default.developers.length > 0 &&
            _token2.default.developers.some(function (x) {return x === id;});
        } }, { key: 'isEcho', value: function isEcho()
        {
            return true;
        } }, { key: 'isStart', value: function isStart(
        text) {
            var pattern = /^\/start|старт/i;
            return text.match(pattern);
        } }, { key: 'isStop', value: function isStop(
        text) {
            var pattern = /^\/stop|стоп/i;
            return text.match(pattern);
        } }, { key: 'isHelp', value: function isHelp(
        text) {
            var pattern = /^\/help|помощь/i;
            return text.match(pattern);
        } }, { key: 'isToken', value: function isToken(
        text) {
            var pattern = /^\/token/i;
            return text.match(pattern);
        } }, { key: 'isBalance', value: function isBalance(
        text) {
            var pattern = /^\/bal$|^\/balance$/i;
            return text.match(pattern);
        } }, { key: 'isBalanceInit', value: function isBalanceInit(
        text) {
            var pattern = /^\/bal init$|^\/balance init$/i;
            return text.match(pattern);
        } }, { key: 'isBalanceChange', value: function isBalanceChange(
        text) {
            var pattern = /^([0-9\-*+/\s().,]+)$/;
            var res = text.match(pattern);
            return !!res && res.length > 0 && res.some(function (x) {return !!x;});
        } }, { key: 'isCategoryChange', value: function isCategoryChange(
        callbackCommand) {
            return callbackCommand === _commands2.default.BALANCE_CATEGORY_CHANGE;
        } }, { key: 'isCommentChange', value: function isCommentChange(
        prevCommand) {
            return prevCommand === _commands2.default.BALANCE_CHANGE ||
            prevCommand === _commands2.default.BALANCE_CATEGORY_CHANGE;
        } }, { key: 'isBalanceDelete', value: function isBalanceDelete(
        callbackCommand) {
            return callbackCommand === _commands2.default.BALANCE_REMOVE;
        } }, { key: 'isReport', value: function isReport(
        text) {
            var pattern = /^\/repo|report/i;
            return text.match(pattern);
        } }, { key: 'isStats', value: function isStats(
        text) {
            var pattern = /^\/stat|stats/i;
            return text.match(pattern);
        } }]);return InputParser;}();exports.default = InputParser;