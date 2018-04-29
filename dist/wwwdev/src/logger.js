'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = exports.logLevel = undefined;var _stringify = require('babel-runtime/core-js/json/stringify');var _stringify2 = _interopRequireDefault(_stringify);var _typeof2 = require('babel-runtime/helpers/typeof');var _typeof3 = _interopRequireDefault(_typeof2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _config2 = require('./config');var _config3 = _interopRequireDefault(_config2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var logLevel = exports.logLevel = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    DEBUG: 'DEBUG' };


var dateTimeString = function dateTimeString() {var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();return date.toLocaleDateString() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);};

var log = function log(text) {var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : logLevel.DEBUG;
    if (!text) return;
    if (_config3.default.log === logLevel.DEBUG ||
    _config3.default.log === logLevel.INFO && (level === logLevel.INFO || level === logLevel.ERROR) ||
    _config3.default.log === logLevel.ERROR && level === logLevel.ERROR) {
        var t = dateTimeString() + ' | ' + level + ' | ' + text;
        console.log(t);
    }
};var

l = function () {function l() {(0, _classCallCheck3.default)(this, l);}(0, _createClass3.default)(l, null, [{ key: 'ds', value: function ds(
        message, obj) {
            l.d((typeof message === 'undefined' ? 'undefined' : (0, _typeof3.default)(message)) === 'object' ? (0, _stringify2.default)(message) : message,
            (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object' ? (0, _stringify2.default)(obj) : obj);
        } }, { key: 'd', value: function d(
        message, obj) {
            if (_config3.default.log !== logLevel.DEBUG)
            return;

            var text = message;
            if (Array.isArray(message)) {
                text = '' + (0, _stringify2.default)(message);
            }

            if (Array.isArray(obj)) {
                text = text + ': ' + (0, _stringify2.default)(obj);
            } else if (typeof obj === 'string') {
                text = text + ': ' + obj;
            }

            log(text, logLevel.DEBUG);
            if ((typeof message === 'undefined' ? 'undefined' : (0, _typeof3.default)(message)) === 'object') {
                console.log(message);
            }
            if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object') {
                console.log(obj);
            }
        } }, { key: 'e', value: function e(
        err, obj) {
            var text = err;
            if (Array.isArray(obj)) {
                text = err + ': ' + (0, _stringify2.default)(obj);
            } else if (typeof obj === 'string') {
                text = err + ': ' + obj;
            } else if ((typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object') {
                text = err + ': ' + (0, _stringify2.default)(obj);
            }
            log(text, logLevel.ERROR);
        } }]);return l;}();exports.default = l;;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register(logLevel, 'logLevel', 'src/wwwdev/src/logger.js');__REACT_HOT_LOADER__.register(dateTimeString, 'dateTimeString', 'src/wwwdev/src/logger.js');__REACT_HOT_LOADER__.register(log, 'log', 'src/wwwdev/src/logger.js');__REACT_HOT_LOADER__.register(l, 'l', 'src/wwwdev/src/logger.js');}();;