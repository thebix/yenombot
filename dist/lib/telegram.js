'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeTelegramBotApi = require('node-telegram-bot-api');

var _nodeTelegramBotApi2 = _interopRequireDefault(_nodeTelegramBotApi);

var _token2 = require('../token');

var _token3 = _interopRequireDefault(_token2);

var _config2 = require('../config');

var _config3 = _interopRequireDefault(_config2);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _InputParser = require('./InputParser');

var _InputParser2 = _interopRequireDefault(_InputParser);

var _index = require('../handlers/index');

var _index2 = _interopRequireDefault(_index);

var _logger = require('../logger');

var _server = require('../server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var inputParser = new _InputParser2.default();

var Telegram = function () {
    //token - если не передан, берется из token.js
    function Telegram(token) {
        _classCallCheck(this, Telegram);

        var t = token ? token : _config3.default.isProduction ? _token3.default.botToken.prod : _token3.default.botToken.dev;
        this._bot = new _nodeTelegramBotApi2.default(t, { polling: true });
        this._handleText = this._handleText.bind(this);
        this._handleCallback = this._handleCallback.bind(this);
    }

    _createClass(Telegram, [{
        key: 'listen',
        value: function listen() {
            this._bot.on('text', this._handleText);
            this._bot.on('callback_query', this._handleCallback);
            return new Promise(function () {}); //TODO: разобраться зачем
        }
    }, {
        key: '_handleText',
        value: function _handleText(msg) {
            var message = new _message2.default(_message2.default.mapMessage(msg));
            var text = message.text;


            var prevCommand = _server.store.getState().command[message.chat.id];

            if (!_config3.default.isProduction) {
                if (!inputParser.isDeveloper(message.from)) {
                    return _index2.default.auth.getNeedDevStatus(message, this._bot);
                }
            }

            if (inputParser.isAskingForStart(text)) {
                return _index2.default.balance.initIfNeed(message, this.bot);
            }
            if (inputParser.isAskingForHelp(text)) return _index2.default.help.getHelp(message, this._bot);
            if (inputParser.isAskingForBalanceChange(text)) return _index2.default.balance.change(message, this._bot);
            if (inputParser.isAskingForEcho(text)) return _index2.default.misc.getEcho(message, this._bot);

            // if (inputParser.isAskingForGenreList(text))
            //     return handlers.music.getGenreList(message, this._bot)

            // if (inputParser.isAskingForNumberOfRec(text, store.getState(message.from).command))
            //     return handlers.music.getNumOfRec(message, this._bot)

            // default
            return _index2.default.help.getHelp(message, this._bot, prevCommand);
        }
    }, {
        key: '_handleCallback',
        value: function _handleCallback(callbackQuery) {
            var data = callbackQuery.data;

            var message = new _message2.default(_message2.default.mapMessage(callbackQuery.message));
            var prevCommand = _server.store.getState().command[message.chat.id];

            if (!_config3.default.isProduction) {
                if (!inputParser.isDeveloper(message.chat.id)) {
                    this._bot.answerCallbackQuery(callbackQuery.id, "No dev access", false);
                    return _index2.default.auth.getNeedDevStatus(message, this._bot);
                }
            }

            // default
            this._bot.answerCallbackQuery(callbackQuery.id, "Help", false);
            return _index2.default.help.getHelp(message, this._bot, data);
        }
    }]);

    return Telegram;
}();

exports.default = Telegram;