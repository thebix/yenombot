'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _exprEval = require('expr-eval');
var _stream = require('stream');
var _config2 = require('../config');var _config3 = _interopRequireDefault(_config2);
var _server = require('../server');
var _actions = require('../actions');



var _commands2 = require('../enums/commands');var _commands3 = _interopRequireDefault(_commands2);
var _filesystem = require('../lib/filesystem');var _filesystem2 = _interopRequireDefault(_filesystem);
var _index = require('../lib/index');var _index2 = _interopRequireDefault(_index);

var _logger = require('../logger');

var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _json2csv = require('json2csv');var _json2csv2 = _interopRequireDefault(_json2csv);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Balance = function () {
    function Balance() {_classCallCheck(this, Balance);this.











































































































































































































































        _sendBalance = function (message, bot, balance) {var isNewMessage = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
            var messageId = _server.store.getState().botBalanceMessageId[message.chat.id];
            if (!messageId || isNewMessage) {
                return bot.sendMessage(message.chat.id, '\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + balance + ' \uD83E\uDD16').
                then(function (x) {
                    _server.store.dispatch((0, _actions.setBotBalanceMessageId)(message.chat.id, x.message_id));
                });
            } else

            return bot.editMessageText('\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + balance + ' \uD83E\uDD16', {
                message_id: messageId,
                chat_id: message.chat.id });

        };this._mapGroupsToButtons = this._mapGroupsToButtons.bind(this);this._sendBalance = this._sendBalance.bind(this);this._getUsersSums = this._getUsersSums.bind(this);this._getCategoriesSums = this._getCategoriesSums.bind(this);this._getCategoriesPercents = this._getCategoriesPercents.bind(this);}_createClass(Balance, [{ key: 'initIfNeed', value: function initIfNeed(message, bot) {var balance = _server.store.getState().balance[message.chat.id];if (balance === undefined || balance === null || balance === '') {this.init(message, bot);}} }, { key: 'init', value: function init(message, bot) {var period = new Date().getMonth();_server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));this.balance(message, bot);} }, { key: 'balance', value: function balance(message, bot) {var balance = _server.store.getState().balance[message.chat.id];var res = '';if (balance === undefined || balance === null || balance === '') {_server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));res = _server.store.getState().balanceInit[message.chat.id];}var period = new Date().getMonth();if (period != balance.period) {_server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));res = _server.store.getState().balanceInit[message.chat.id];}res = balance.balance;bot.sendMessage(message.chat.id, '\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + res + ' \uD83E\uDD16');return res;} }, { key: 'change', value: function change(message, bot) {var _this = this;var text = message.text;_server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_CHANGE));var parser = new _exprEval.Parser();try {text = parser.parse(text).evaluate();} catch (ex) {return bot.sendMessage(message.chat.id, '\u041D\u0435 \u043F\u043E\u043D\u044F\u043B \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \uD83E\uDD16');}var period = new Date().getMonth();var balance = _server.store.getState().balance[message.chat.id];if (balance && balance.period != period) _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));_server.store.dispatch((0, _actions.balanceChange)(message.chat.id, period, text));var newState = _server.store.getState(); //TODO: так нехорошо, надо высчитывать баланс
            balance = newState.balance[message.chat.id].balance;_server.store.dispatch((0, _actions.jsonSave)(_config3.default.fileState, newState)); // 
            var groups = newState.paymentGroups[message.chat.id];if (!groups || groups.length == 0) {//для чата не заданы группы
                return this._sendBalance(message, bot, balance);} // сохранение истории
            var date = new Date();var historyItem = { 'id': message.id, 'date_create': date, 'date_edit': date, 'date_delete': null, 'category': 'uncat', 'value': text, 'user_id': message.from, 'comment': '' };var success = '\u0417\u0430\u043F\u0438\u0441\u0430\u043B ' + text;bot.sendMessage(message.chat.id, success + ' \uD83E\uDD16').then(function (x) {var cols = 3; // кол-во в блоке
                var buttons = []; //результат
                var blocksCount = parseInt(groups.length / cols) + (groups.length % cols > 0 ? 1 : 0);for (var i = 0; i < blocksCount; i++) {buttons.push(groups.slice(i * cols, i * cols + cols).map(function (group) {return _this._mapGroupsToButtons(x.message_id, group);}));}bot.editMessageText(success + '. \u0412\u044B\u0431\u0435\u0440\u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E \uD83E\uDD16', { message_id: x.message_id, chat_id: message.chat.id, reply_markup: JSON.stringify({ inline_keyboard: [[{ text: "Удалить", callback_data: JSON.stringify({ hId: x.message_id, cmd: _commands3.default.BALANCE_REMOVE }) }]].concat(buttons) }) });historyItem.id = x.message_id;_server.history.create(historyItem, message.chat.id).then(function (x) {}).catch(function (ex) {return (0, _logger.log)(ex, _logger.logLevel.ERROR);});return _this._sendBalance(message, bot, balance);}).catch(function (ex) {(0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0431\u043E\u0442\u0443. \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043F\u0438\u0441\u0430\u043D\u0430 \u0441 id \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u044F \u043E\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043B\u0435\u044F = ' + historyItem.id + '. err = ' + ex + '.');_server.history.create(historyItem, message.chat.id);return _this._sendBalance(message, bot, balance);});} }, { key: 'categoryChange', value: function categoryChange(message, bot, data) {_server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_CATEGORY_CHANGE)); //сохранение категории
            var hId = data.hId,gId = data.gId;return _server.history.getById(hId, message.chat.id).then(function (item) {if (!item) {bot.sendMessage(message.chat.id, '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');return Promise.reject('\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');}var groups = _server.store.getState().paymentGroups[message.chat.id] || [];var oldCategory = '';if (item.category && item.category != 'uncat') oldCategory = item.category + ' -> ';item.category = groups.filter(function (x) {return gId == x.id;})[0].title;var comment = item.comment ? ', ' + item.comment : '';return _server.history.setById(hId, item, message.chat.id).then(function (data) {return bot.editMessageText(item.value + ', ' + oldCategory + item.category + comment + ' \uD83E\uDD16', { message_id: hId, chat_id: message.chat.id, reply_markup: JSON.stringify({ inline_keyboard: [[{ text: "Удалить", callback_data: JSON.stringify({ hId: hId, cmd: _commands3.default.BALANCE_REMOVE }) }]] }) });}).catch(function (ex) {return (0, _logger.log)(ex, _logger.logLevel.ERROR);});}).catch(function (ex) {return (0, _logger.log)(ex, _logger.logLevel.ERROR);});} }, { key: 'commentChange', value: function commentChange(message, bot) {var _this2 = this;_server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_COMMENT_CHANGE)); // сохранение коммента к последней записи
            return _server.history.getAll(message.chat.id).then(function (all) {if (!all || all.constructor !== Array) all = [];var article = all.sort(function (i1, i2) {return i2.id - i1.id;});if (!article || article.length == 0) {return bot.sendMessage(message.chat.id, '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');}article = article[0];article.comment = message.text;return _server.history.setById(article.id, article, message.chat.id).then(function (data) {bot.editMessageText(article.value + ', ' + article.category + ', ' + article.comment + ' \uD83E\uDD16', { message_id: article.id, chat_id: message.chat.id, reply_markup: JSON.stringify({ inline_keyboard: [[{ text: "Удалить", callback_data: JSON.stringify({ hId: article.id, cmd: _commands3.default.BALANCE_REMOVE }) }]] }) }).then(function (data) {var balance = _server.store.getState().balance[message.chat.id].balance; //TODO: нужна проверка, что баланс этого периода
                        return _this2._sendBalance(message, bot, balance);}).catch(function (ex) {return (0, _logger.log)(ex, _logger.logLevel.ERROR);});});}).catch(function (ex) {return (0, _logger.log)(ex, _logger.logLevel.ERROR);});} }, { key: 'delete', value: function _delete(message, bot, data) {var _this3 = this; // удаление записи
            var hId = data.hId,gId = data.gId;var success = '';var newBalance = undefined;return _server.history.getById(hId, message.chat.id).then(function (item) {if (!item) {bot.sendMessage(message.chat.id, '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');return Promise.reject('\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');}if (item.date_delete) {// bot.sendMessage(message.chat.id, `Запись уже была удалена 🤖`)
                    return Promise.resolve();}_server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_REMOVE));item.date_delete = new Date();var balance = _server.store.getState().balance[message.chat.id] || {};if (balance.period != item.date_delete.getMonth()) {success = item.value + ' \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438. \u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0435\u0441\u044F\u0446 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0441\u044F \uD83E\uDD16';} else {_server.store.dispatch((0, _actions.balanceChange)(message.chat.id, new Date(item.date_create).getMonth(), -item.value));newBalance = parseInt(balance.balance) + parseInt(item.value);success = item.value + ', ' + item.category + ', ' + item.comment + ' \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16';}return _server.history.setById(hId, item, message.chat.id);}).then(function (item) {if (newBalance !== undefined) _this3._sendBalance(message, bot, newBalance, false);return bot.editMessageText('' + success, { message_id: hId, chat_id: message.chat.id });}).catch(function (ex) {return (0, _logger.log)(ex, _logger.logLevel.ERROR);});} }, { key: '_mapGroupsToButtons', value: function _mapGroupsToButtons(id, group, replyId) {return { text: group.title, callback_data: JSON.stringify({ gId: group.id, hId: id, rId: replyId, cmd: _commands3.default.BALANCE_CATEGORY_CHANGE }) };} }, { key: 'report', value: function report(message, bot) {var _this4 = this;var noBalance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;var file = void 0;return _server.history.getAll(message.chat.id).then(function (all) {all = all.filter(function (x) {return !x.date_delete;}).sort(function (a, b) {return b.id - a.id;});var _store$getState = _server.store.getState(),users = _store$getState.users;var fields = [{ label: 'Дата', // Supports duplicate labels (required, else your column will be labeled [function]) 
                    value: function value(row, field, data) {return (0, _logger.dateTimeString)(new Date(row.date_create));
                    },
                    default: 'NULL' // default if value function returns null or undefined 
                }, 'value', 'category', 'comment', {
                    label: 'Юзер', // Supports duplicate labels (required, else your column will be labeled [function]) 
                    value: function value(row, field, data) {
                        return users[row.user_id].firstName + ' ' + users[row.user_id].lastName;
                    },
                    default: 'NULL' // default if value Îfunction returns null or undefined 
                }, 'id'];
                var fieldNames = ['Дата', 'Сумма', 'Категория', 'Комментарий', 'Юзер', 'id'];
                var csv = (0, _json2csv2.default)({ data: all, fields: fields, fieldNames: fieldNames });
                if (_filesystem2.default.isDirExists(_config3.default.dirStorage, true) &&
                _filesystem2.default.isDirExists(_config3.default.dirStorage + 'repo', true)) {
                    file = 'repo-' + message.chat.title + '.csv';

                    return _filesystem2.default.saveFile(_config3.default.dirStorage + 'repo/' + file, csv);
                }
                return bot.sendMessage(message.chat.id, '\u041D\u0435\u0442 \u0440\u0430\u043D\u0435\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u0445 \u0442\u0440\u0430\u0442 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0447\u0430\u0442\u0430 \uD83E\uDD16');
            }).
            then(function (data) {
                return bot.sendDocument(message.chat.id, _config3.default.dirStorage + 'repo/' + file);
            }).
            then(function (data) {
                if (noBalance)
                return Promise.resolve();
                var balance = _server.store.getState().balance[message.chat.id].balance; //TODO: нужна проверка, что баланс этого периода
                return _this4._sendBalance(message, bot, balance);
            }).
            catch(function (ex) {return (0, _logger.log)('chatId=\'' + message.chat.id + '\', ex=' + ex, _logger.logLevel.ERROR);});
        } }, { key: 'stats', value: function stats(

        message, bot) {var _this5 = this;
            // получение интервала
            var dateEnd = void 0,dateStart = void 0,dateEndUser = void 0;
            var split = (message.text + '').split(' ');
            if (split.length == 1) {// без параметров => просто статистика за текущий месяц
                dateEnd = new Date();
                dateStart = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), 1);
                dateEndUser = dateEnd;
            } else if (split.length < 3) {//дата начала - до - текущая дата
                dateEnd = new Date();
                dateStart = _index2.default.time.getBack(split[1].trim(' '), dateEnd);
                dateEndUser = dateEnd;
            } else {//дата начала - до - дата окончания
                //если юзер вводил, он ввел день окончания, который тоже должен попасть в отчет
                var end = _index2.default.time.getBack(split[2].trim(' ')); //дата окончания (начало даты 0:00)
                dateStart = _index2.default.time.getBack(split[1].trim(' '), end);
                dateEnd = _index2.default.time.getChangedDateTime({ days: 1 },
                _index2.default.time.getBack(split[2].trim(' ')));
                if (_index2.default.time.isDateSame(dateStart, dateEnd))
                dateEndUser = dateEnd;else

                dateEndUser = _index2.default.time.getChangedDateTime({ days: -1 }, dateEnd); //юзеру показывается дата на 1 меньше
            }
            var dateEndTime = dateEnd.getTime();
            var dateStartTime = dateStart.getTime();
            var userId = null; //84677480

            _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_STATS, {
                dateEndTime: dateEndTime,
                dateStartTime: dateStartTime,
                dateEndUser: dateEndUser,
                userId: userId }));var _store$getState2 =


            _server.store.getState(),users = _store$getState2.users,paymentGroups = _store$getState2.paymentGroups,nonUserPaymentGroups = _store$getState2.nonUserPaymentGroups;
            var hasCats = paymentGroups[message.chat.id] &&
            Object.keys(paymentGroups[message.chat.id]).length > 0;
            var sumsText = '\u041F\u043E\u0442\u0440\u0430\u0447\u0435\u043D\u043E [\u0432 \u044D\u0442\u043E\u043C | \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C]:';
            var sumsCatsText = '\u041F\u043E \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F\u043C [\u0432 \u044D\u0442\u043E\u043C | \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C]:';
            var percCatsText = '\u041F\u0440\u043E\u0446\u0435\u043D\u0442\u044B [\u0432 \u044D\u0442\u043E\u043C | \u0437\u0430 \u0432\u0441\u0435 \u0432\u0440\u0435\u043C\u044F]:';
            var categories = hasCats ? paymentGroups[message.chat.id].sort(function (cat1, cat2) {return cat1.id - cat2.id;}) : [];

            var usersSumsByCurrent = {};
            var catsSumsByCurrent = {};
            var usersSumsBefore = {};
            var catsSumsBefore = {};
            var periodsCount = {};
            var all = []; //все записи истории чата
            var periods = []; //все прошлые периоды (кроме текущего)
            var nonUserGroups = nonUserPaymentGroups[message.chat.id];
            // сколько потрачено за период / в среднем за прошлые
            var titleInfo = '\u041F\u0435\u0440\u0438\u043E\u0434: ' + _index2.default.time.dateWeekdayString(dateStart) + ' - ' + _index2.default.time.dateWeekdayString(dateEndUser) + '\n\u0414\u043D\u0435\u0439: ' + _index2.default.time.daysBetween(dateStart, dateEnd);
            bot.sendMessage(message.chat.id, titleInfo + ' \uD83E\uDD16').
            then(function (x) {return _server.history.getAll(message.chat.id);}).
            then(function (data) {//
                all = data;
                if (!all || all.length == 0)
                return bot.sendMessage(message.chat.id, '\u041D\u0435\u0442 \u0438\u0441\u0442\u043E\u0440\u0438\u0438. \uD83E\uDD16');

                // получение интервалов
                var dateFirst = new Date(all[all.length - 1].date_create);
                var dateFirstTime = dateFirst.getTime();
                var curTicks = dateEndTime - dateStartTime;
                if (curTicks < 1000 * 60 * 60 * 4)
                return bot.sendMessage(message.chat.id, '\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B. \u041C\u0438\u043D\u0438\u043C\u0443\u043C 4 \u0447\u0430\u0441\u0430. \uD83E\uDD16');

                var curDateEnd = _index2.default.time.getChangedDateTime({ ticks: -1 }, dateStart);
                var curDateStart = _index2.default.time.getChangedDateTime({ ticks: -curTicks }, curDateEnd);
                while (curDateEnd.getTime() >= dateFirstTime) {
                    periods.push({
                        start: curDateStart,
                        end: curDateEnd });

                    curDateEnd = _index2.default.time.getChangedDateTime({ ticks: -1 }, curDateStart);
                    curDateStart = _index2.default.time.getChangedDateTime({ ticks: -curTicks }, curDateEnd);
                }

                // получение за прошлые периоды
                var periodsCountTmp = {};
                periods.forEach(function (period) {
                    // сколько потрачено за период / в среднем за прошлые
                    var curUsrSums = _this5._getUsersSums(all, period.start, period.end, nonUserGroups);
                    var allKeys = Object.keys(usersSumsBefore);
                    Object.keys(curUsrSums).forEach(function (key) {
                        if (allKeys.indexOf(key) != -1)
                        usersSumsBefore[key] = usersSumsBefore[key] + curUsrSums[key];else

                        usersSumsBefore[key] = curUsrSums[key];
                    });

                    // траты по категориям / средние траты за %период%
                    if (hasCats) {
                        var curCatSums = _this5._getCategoriesSums(all, period.start, period.end, userId);
                        var allCatSumsKeys = Object.keys(catsSumsBefore);

                        Object.keys(curCatSums).forEach(function (key) {
                            var curCatSum = curCatSums[key] || 0;
                            if (!periodsCountTmp[key])
                            periodsCountTmp[key] = 1;else

                            periodsCountTmp[key]++;

                            if (curCatSum > 0) {
                                periodsCount[key] = periodsCountTmp[key];
                            }

                            if (allCatSumsKeys.indexOf(key) != -1)
                            catsSumsBefore[key] = catsSumsBefore[key] + curCatSum;else

                            catsSumsBefore[key] = curCatSum;
                        });
                    }
                });

                return Promise.resolve(true);
            }).
            then(function (initDone) {
                usersSumsByCurrent = _this5._getUsersSums(all, dateStart, dateEnd, nonUserGroups); // траты в этом месяце

                // сколько потрачено за период / в среднем за прошлые
                Object.keys(usersSumsByCurrent).forEach(function (key) {//key - либо userId, либо категория из nonUserGroups
                    var userName = void 0,perCount = void 0; //кол-во периодов
                    if (users[key]) {
                        userName = users[key].firstName + ' ' + users[key].lastName;
                        perCount = periods.length; // кол-во периодов для юзера - все
                    } else {
                        userName = key; //название категории из nonUserGroups
                        perCount = periodsCount[key]; //кол-во периодов для каждой категории свое
                    }

                    var sum = Math.round(usersSumsByCurrent[key]) || 0;
                    var bef = Math.round(usersSumsBefore[key] / perCount) || 0;
                    sumsText = sumsText + '\r\n' + userName + ': ' + sum + ' | ' + bef; //TODO: учитывать при этом не полный интервал (первый)
                });
                return bot.sendMessage(message.chat.id, sumsText + ' \uD83E\uDD16');
            }).
            then(function (d) {
                if (!hasCats) return Promise.resolve({});
                catsSumsByCurrent = _this5._getCategoriesSums(all, dateStart, dateEnd, userId); // траты по категориям 
                categories = categories.sort(
                function (cat1, cat2) {
                    return (catsSumsByCurrent[cat2.title] || 0) - (catsSumsByCurrent[cat1.title] || 0);
                });

                // траты по категориям / средние траты за %период%
                categories.forEach(function (cat) {
                    var cur = Math.round(catsSumsByCurrent[cat.title]);
                    var bef = Math.round(catsSumsBefore[cat.title] / periodsCount[cat.title]);
                    if (!cur || !cur && !bef)
                    return true;
                    sumsCatsText = sumsCatsText + '\r\n' + cat.title + ': ' + (cur || 0) + ' | ' + (bef || 0); //TODO: учитывать при этом не полный интервал (первый)
                });
                return bot.sendMessage(message.chat.id, sumsCatsText + ' \uD83E\uDD16');

            }).
            then(function (d) {
                if (!hasCats) return Promise.resolve({});
                //поцентное соотношение по группам / (не сделал)в среднем до этого за %период% / за все время
                var cats = _this5._getCategoriesPercents(catsSumsByCurrent);
                var catsBefore = _this5._getCategoriesPercents(catsSumsBefore);

                categories.forEach(function (cat) {
                    var cur = Math.round(cats[cat.title]);
                    var bef = Math.round(catsBefore[cat.title]);
                    if (!cur || !cur && !bef)
                    return true;

                    percCatsText = percCatsText + '\r\n' + cat.title + ': ' + (cur || 0) + '% | ' + (bef || 0) + '%'; //TODO: учитывать при этом не полный интервал (первый)
                });
                return bot.sendMessage(message.chat.id, percCatsText + ' \uD83E\uDD16');
            }).
            then(function (d) {
                var balance = _server.store.getState().balance[message.chat.id].balance; //TODO: нужна проверка, что баланс этого периода
                return _this5._sendBalance(message, bot, balance);
            }).
            catch(function (ex) {return (0, _logger.log)('chatId=\'' + message.chat.id + '\', ex=' + ex, _logger.logLevel.ERROR);});
        } }, { key: '_getCategoriesPercents', value: function _getCategoriesPercents(

        catsSums) {
            var categories = Object.keys(catsSums);
            var sum = categories.reduce(function (acc, val) {
                if (isNaN(catsSums[val]))
                return acc;
                return acc + catsSums[val];
            }, 0);
            var result = {};
            var sumWithoutLast = 0;
            categories.forEach(function (cat, i) {
                if (isNaN(catsSums[cat]))
                result[cat] = 'err';else
                if (i == categories.length - 1)
                result[cat] = 100 - sumWithoutLast;else
                {
                    result[cat] = Math.round(catsSums[cat] * 100 / sum);
                    sumWithoutLast += result[cat];
                }
            });
            return result;
        }

        // сколько потрачено за период / в среднем за прошлые
    }, { key: '_getUsersSums', value: function _getUsersSums()
        {var all = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var dateStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();var dateEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();var nonUserPaymentGroups = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
            var dateStartTime = dateStart.getTime();
            var dateEndTime = dateEnd.getTime();

            var current = all //filter
            .filter(function (item) {return !dateStartTime || new Date(item.date_create).getTime() >= dateStartTime;}).
            filter(function (item) {return !dateEndTime || new Date(item.date_create).getTime() < dateEndTime;});
            var result = {};
            Array.from(new Set( //http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            current.map(function (item) {return item.user_id;}))).
            forEach(function (userId) {
                var sum = current.
                filter(function (item) {return item.user_id == userId &&
                    nonUserPaymentGroups.indexOf(item.category) == -1;}).
                reduce(function (acc, val) {
                    if (isNaN(val.value))
                    return acc;
                    return acc + val.value;
                }, 0);
                result[userId] = sum;
            });

            nonUserPaymentGroups.forEach(function (cat) {
                var sum = current.
                filter(function (item) {return item.category === cat;}).
                reduce(function (acc, val) {
                    if (isNaN(val.value))
                    return acc;
                    return acc + val.value;
                }, 0);
                result[cat] = sum;
            });

            Array.from(new Set( //http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            current.map(function (item) {return item.user_id;}))).
            forEach(function (userId) {
                var sum = current.
                filter(function (item) {return item.user_id == userId &&
                    nonUserPaymentGroups.indexOf(item.category) == -1;}).
                reduce(function (acc, val) {
                    if (isNaN(val.value))
                    return acc;
                    return acc + val.value;
                }, 0);
                result[userId] = sum;
            });
            return result;
        }

        // Траты по категориям / средние траты за %период%
    }, { key: '_getCategoriesSums', value: function _getCategoriesSums() {var all = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var dateStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();var dateEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();var userId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var dateStartTime = dateStart.getTime();
            var dateEndTime = dateEnd.getTime();

            var current = all //filter
            .filter(function (item) {return !dateStartTime || new Date(item.date_create).getTime() >= dateStartTime;}).
            filter(function (item) {return !dateEndTime || new Date(item.date_create).getTime() < dateEndTime;}).
            filter(function (item) {return !userId || item.user_id == userId;});
            var result = {};
            Array.from(new Set( //http://stackoverflow.com/questions/1960473/unique-values-in-an-array
            current.map(function (item) {return item.category;}))).
            forEach(function (category) {
                var sum = current.
                filter(function (item) {return item.category == category;}).
                reduce(function (acc, val) {
                    if (isNaN(val.value))
                    return acc;
                    return acc + val.value;
                }, 0);
                result[category] = sum;
            });
            return result;
        } }]);return Balance;}();exports.default = Balance;