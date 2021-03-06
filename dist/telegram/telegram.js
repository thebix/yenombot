'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _nodeTelegramBotApi = require('node-telegram-bot-api');var _nodeTelegramBotApi2 = _interopRequireDefault(_nodeTelegramBotApi);
var _token2 = require('../token');var _token3 = _interopRequireDefault(_token2);
var _config2 = require('../config');var _config3 = _interopRequireDefault(_config2);
var _commands2 = require('../enums/commands');var _commands3 = _interopRequireDefault(_commands2);

var _message = require('./message');var _message2 = _interopRequireDefault(_message);
var _InputParser = require('./InputParser');var _InputParser2 = _interopRequireDefault(_InputParser);
var _index = require('../handlers/index');var _index2 = _interopRequireDefault(_index);

var _logger = require('../logger');
var _server = require('../server');
var _actions = require('../actions');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

var inputParser = new _InputParser2.default();var

Telegram = function () {// extends TelegramBot
    // token - если не передан, берется из token.js
    function Telegram(token) {_classCallCheck(this, Telegram);
        var t = token || _config3.default.isProduction ? _token3.default.botToken.prod : _token3.default.botToken.dev;
        this.bot = new _nodeTelegramBotApi2.default(t, { polling: true });
        this.handleText = this.handleText.bind(this);
        this.handleCallback = this.handleCallback.bind(this);
    }_createClass(Telegram, [{ key: 'listen', value: function listen()
        {
            this.bot.on('text', this.handleText);
            this.bot.on('callback_query', this.handleCallback);
            // return new Promise(() => { }) //TODO: разобраться зачем
        }
        // INFO: message должен быть соствлен очень внимательно
    }, { key: 'trigger', value: function trigger() {var cmd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _commands3.default.HELP;var message = arguments[1];var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            switch (cmd) {
                case _commands3.default.BALANCE_STATS:
                    return _index2.default.balance.stats(message, this.bot, options.noBalance);
                case _commands3.default.BALANCE_REPORT:
                    return _index2.default.balance.report(message, this.bot, options.noBalance);
                default:
                    (0, _logger.log)('\u041D\u0435\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u0430 \'' + cmd + '\' \u0431\u043E\u0442\u0443 \u043F\u0440\u0438 \u0432\u044B\u0437\u043E\u0432\u0435 Telegram.trigger().', _logger.logLevel.ERROR);}

            throw new Error('\u041D\u0435\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u0430\u044F \u043A\u043E\u043C\u0430\u043D\u0434\u0430 \'' + cmd + '\' \u0431\u043E\u0442\u0443 \u043F\u0440\u0438 \u0432\u044B\u0437\u043E\u0432\u0435 Telegram.trigger().');
        } }, { key: 'handleText', value: function handleText(
        msg) {
            var message = new _message2.default(_message2.default.mapMessage(msg));var
            text = message.text;

            var state = _server.store.getState();
            var prevCommand = state.command[message.chat.id];

            if (state && state.users && !state.users[message.user.id]) {
                _server.store.dispatch((0, _actions.userAdd)(message.user));
            }

            if (!_config3.default.isProduction) {
                if (!inputParser.isDeveloper(message.from)) {
                    return _index2.default.auth.getNeedDevStatus(message, this.bot);
                }
            }

            if (inputParser.isAskingForStart(text))
            return _index2.default.balance.initIfNeed(message, this.bot);
            // if (inputParser.isAskingForHelp(text))
            //     return handlers.help.getHelp(message, this.bot)
            if (inputParser.isAskingForInitToken(text))
            return _index2.default.init.initByToken(message, this.bot);
            if (inputParser.isAskingForReport(text))
            return _index2.default.balance.report(message, this.bot);
            if (inputParser.isAskingForStats(text)) {
                return _index2.default.balance.stats(message, this.bot);
            }
            if (inputParser.isAskingForBalance(text))
            return _index2.default.balance.balance(message, this.bot);
            if (inputParser.isAskingForBalanceInit(text))
            return _index2.default.balance.init(message, this.bot);
            if (inputParser.isAskingForBalanceChange(text))
            return _index2.default.balance.change(message, this.bot);
            if (inputParser.isAskingForCommentChange(text, prevCommand))
            return _index2.default.balance.commentChange(message, this.bot);
            if (inputParser.isAskingForEcho(text))
            return _index2.default.misc.getEcho(message, this.bot);

            // default
            return _index2.default.help.getHelp(message, this.bot, prevCommand);
        } }, { key: 'handleCallback', value: function handleCallback(
        callbackQuery) {var
            data = callbackQuery.data;
            data = data ? JSON.parse(data) : {};
            var message = new _message2.default(_message2.default.mapMessage(callbackQuery.message));
            var state = _server.store.getState();
            var prevCommand = state.command[message.chat.id];

            if (!_config3.default.isProduction) {
                if (!inputParser.isDeveloper(message.chat.id)) {
                    this.bot.answerCallbackQuery(callbackQuery.id, 'No dev access', false);
                    return _index2.default.auth.getNeedDevStatus(message, this.bot);
                }
            }

            // default
            this.bot.answerCallbackQuery(callbackQuery.id, 'Команда получена', false);

            if (inputParser.isAskingForCategoryChange(message, prevCommand, data)) {
                return _index2.default.balance.categoryChange(message, this.bot, data);
            }
            if (inputParser.isAskingForBalanceDelete(message, prevCommand, data)) {
                return _index2.default.balance.delete(message, this.bot, data);
            }

            return _index2.default.help.getHelp(message, this.bot, data);
        } }]);return Telegram;}();exports.default = Telegram;