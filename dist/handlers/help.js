'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _server = require('../server');

var _actions = require('../actions');

var _commands2 = require('../enums/commands');

var _commands3 = _interopRequireDefault(_commands2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Help = function () {
    function Help() {
        _classCallCheck(this, Help);
    }

    _createClass(Help, [{
        key: 'getHelp',
        value: function getHelp(message, bot, route) {
            _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.HELP));
            if (!route || route == 'help') {
                bot.sendMessage(message.chat.id, '\u0412\u044B\u0431\u0435\u0440\u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E \uD83E\uDD16', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[{
                            text: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F 1',
                            callback_data: 'help/sub1'
                        }, {
                            text: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F 2',
                            callback_data: 'help/sub2'
                        }], [{
                            text: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F 3',
                            callback_data: 'help/sub3'
                        }]]
                    })
                });
                return;
            }

            var buttonBack = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [[{
                        text: '\u041D\u0430\u0437\u0430\u0434',
                        callback_data: 'help'
                    }]]
                })
            };
            switch (route) {
                case 'help/sub1':
                    bot.sendMessage(message.chat.id, '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F 1 \u0445\u0435\u043B\u043F \uD83E\uDD16', buttonBack);
                    return;
                case 'help/sub2':
                    bot.sendMessage(message.chat.id, '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F 2 \u0445\u0435\u043B\u043F \uD83E\uDD16', buttonBack);
                    return;
                case 'help/sub3':
                    bot.sendMessage(message.chat.id, '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F 3 \u0445\u0435\u043B\u043F \uD83E\uDD16', buttonBack);
                    return;
            }
            return;
        }
    }]);

    return Help;
}();

exports.default = Help;