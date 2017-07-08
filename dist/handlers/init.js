'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _server = require('../server');
var _token2 = require('../token');var _token3 = _interopRequireDefault(_token2);
var _config2 = require('../config');var _config3 = _interopRequireDefault(_config2);

var _actions = require('../actions');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var




Init = function () {function Init() {_classCallCheck(this, Init);}_createClass(Init, [{ key: 'initByToken', value: function initByToken(
        message, bot) {
            var token = message.text.split(' ')[1];
            if (Object.keys(_token3.default.initData).indexOf(token) === -1)
            return bot.sendMessage(message.chat.id, 'Токен не найден 🤖');
            _server.store.dispatch((0, _actions.initByToken)(message.chat.id, token));

            var newState = _server.store.getState();
            _server.store.dispatch((0, _actions.jsonSave)(_config3.default.fileState, newState));

            return bot.sendMessage(message.chat.id, 'Токен принят 🤖');
        } }]);return Init;}();exports.default = Init;