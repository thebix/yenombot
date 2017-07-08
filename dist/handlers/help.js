'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _server = require('../server');
var _actions = require('../actions');
var _commands2 = require('../enums/commands');var _commands3 = _interopRequireDefault(_commands2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Help = function () {function Help() {_classCallCheck(this, Help);}_createClass(Help, [{ key: 'getHelp', value: function getHelp(
        message, bot, route) {
            _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.HELP));
            if (!route || route === 'help') {
                bot.sendMessage(message.chat.id, 'Выбери категорию 🤖', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [
                        [
                        {
                            text: 'Категория 1',
                            callback_data: 'help/sub1' },
                        {
                            text: 'Категория 2',
                            callback_data: 'help/sub2' }],


                        [{
                            text: 'Категория 3',
                            callback_data: 'help/sub3' }]] }) });




                return;
            }

            var buttonBack = {
                reply_markup: JSON.stringify({
                    inline_keyboard: [
                    [
                    {
                        text: 'Назад',
                        callback_data: 'help' }]] }) };





            switch (route) {
                case 'help/sub1':
                    bot.sendMessage(message.chat.id, 'Категория 1 хелп 🤖', buttonBack);
                    return;
                case 'help/sub2':
                    bot.sendMessage(message.chat.id, 'Категория 2 хелп 🤖', buttonBack);
                    return;
                case 'help/sub3':
                    bot.sendMessage(message.chat.id, 'Категория 3 хелп 🤖', buttonBack);
                    break;
                default:}

        } }]);return Help;}();exports.default = Help;