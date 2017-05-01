'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _exprEval = require('expr-eval');

var _config2 = require('../config');

var _config3 = _interopRequireDefault(_config2);

var _server = require('../server');

var _actions = require('../actions');

var _commands2 = require('../enums/commands');

var _commands3 = _interopRequireDefault(_commands2);

var _filesystem = require('../filesystem');

var _filesystem2 = _interopRequireDefault(_filesystem);

var _logger = require('../logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Balance = function () {
    function Balance() {
        _classCallCheck(this, Balance);

        this._mapGroupsToButtons = this._mapGroupsToButtons.bind(this);
    }

    _createClass(Balance, [{
        key: 'initIfNeed',
        value: function initIfNeed(message, bot) {
            var balance = _server.store.getState().balance[message.chat.id];
            if (balance === undefined || balance === null || balance === '') {
                var _period = new Date().getMonth();
                _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, _period));
            }
        }
    }, {
        key: 'balance',
        value: function balance(message, bot) {
            var balance = _server.store.getState().balance[message.chat.id];
            var res = '';
            if (balance === undefined || balance === null || balance === '') {
                _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));
                res = _server.store.getState().balanceInit[message.chat.id];
            }
            var period = new Date().getMonth();
            if (period != balance.period) {
                _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));
                res = _server.store.getState().balanceInit[message.chat.id];
            }
            res = balance.balance;
            bot.sendMessage(message.chat.id, '\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + res + ' \uD83E\uDD16');
            return res;
        }
    }, {
        key: 'change',
        value: function change(message, bot) {
            var _this = this;

            var text = message.text;

            _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_CHANGE));

            var parser = new _exprEval.Parser();
            try {
                text = parser.parse(text).evaluate();
            } catch (ex) {
                bot.sendMessage(message.chat.id, '\u041D\u0435 \u043F\u043E\u043D\u044F\u043B \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \uD83E\uDD16');
                return;
            }

            var period = new Date().getMonth();
            var balance = _server.store.getState().balance[message.chat.id];
            if (balance && balance.period != period) _server.store.dispatch((0, _actions.balanceInit)(message.chat.id, period));
            _server.store.dispatch((0, _actions.balanceChange)(message.chat.id, period, text));
            var newState = _server.store.getState(); //TODO: так нехорошо, надо высчитывать баланс
            balance = newState.balance[message.chat.id].balance;
            _server.store.dispatch((0, _actions.jsonSave)(_config3.default.fileState, newState));

            var sendBalance = function sendBalance() {
                var id = message.id;

                bot.sendMessage(message.chat.id, '\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + balance + ' \uD83E\uDD16', {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[{
                            text: "Удалить",
                            callback_data: JSON.stringify({
                                hId: id,
                                cmd: _commands3.default.BALANCE_REMOVE
                            })
                        }]]
                    })
                });
            };

            //сохранение истории
            var file = _config3.default.dirStorage + 'balance-hist-' + message.chat.id + '.json';
            if (_filesystem2.default.isDirExists(_config3.default.dirStorage, true) && _filesystem2.default.isFileExists(file, true, null, '[]')) {
                _filesystem2.default.readJson(file).then(function (data) {
                    var date = new Date();
                    var id = message.id;

                    var historyItem = {
                        'id': message.id,
                        'date_create': date,
                        'date_edit': date,
                        'date_delete': null,
                        'category': 'uncat',
                        'value': text,
                        'user_id': message.from,
                        'comment': ''
                    };
                    var history = data;
                    if (!history || history.constructor !== Array) history = [];
                    history.push(historyItem);
                    _filesystem2.default.saveJson(file, history).then(function (data) {
                        data = data; //TODO: Callig w/o callback is deprecated
                    }).catch(function (err) {
                        (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                    });

                    var groups = newState.paymentGroups[message.chat.id];
                    if (!groups || groups.length == 0) {
                        //для чата не заданы группы
                        sendBalance();
                        return;
                    }

                    var cols = 3; // кол-во в блоке
                    var buttons = []; //результат
                    var blocksCount = parseInt(groups.length / cols) + (groups.length % cols > 0 ? 1 : 0);
                    for (var i = 0; i < blocksCount; i++) {
                        buttons.push(groups.slice(i * cols, i * cols + cols).map(function (group) {
                            return _this._mapGroupsToButtons(id, group);
                        }));
                    }

                    // const rowCount = 2
                    // const remDiv = groups.length % 3
                    // const rows = parseInt(groups.length / rowCount)
                    //     + (remDiv ? 1 : 0)

                    // let i = 0
                    // const buttons = []
                    // for (i; i < rows; i++) {
                    //     if (i != rows - 1)
                    //         buttons.push(
                    //             groups.slice(i * rowCount, i * rowCount + rowCount)
                    //                 .map(group => this._mapGroupsToButtons(id, group))
                    //         )
                    //     else
                    //         buttons.push(
                    //             groups.slice(i * rowCount, i * rowCount + remDiv)
                    //                 .map(group => this._mapGroupsToButtons(id, group))
                    //         )
                    // }
                    bot.sendMessage(message.chat.id, '\u0412\u044B\u0431\u0435\u0440\u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E \uD83E\uDD16', {
                        reply_markup: JSON.stringify({
                            inline_keyboard: buttons
                        })
                    }).then(function (x) {
                        sendBalance();
                    }).catch(function (ex) {
                        sendBalance();
                    });
                }).catch(function (err) {
                    sendBalance();
                    (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                });
            }
        }
    }, {
        key: 'categoryChange',
        value: function categoryChange(message, bot, data) {
            _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_CATEGORY_CHANGE));

            //сохранение категории
            var file = _config3.default.dirStorage + 'balance-hist-' + message.chat.id + '.json';
            if (_filesystem2.default.isFileExists(file, true, null, '[]')) {
                _filesystem2.default.readJson(file).then(function (json) {
                    var history = json || [];
                    var category = data;

                    var hId = category.hId;

                    var article = history.filter(function (item) {
                        return item.id == hId;
                    });
                    if (!article || article.length == 0) {
                        bot.sendMessage(message.chat.id, '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');
                        return;
                    }
                    article = article[0];
                    var groups = _server.store.getState().paymentGroups[message.chat.id] || [];
                    var oldCategory = '';
                    if (article.category && article.category != 'uncat') oldCategory = article.category + ' -> ';
                    article.category = groups.filter(function (item) {
                        return category.gId == item.id;
                    })[0].title;

                    _filesystem2.default.saveJson(file, history).then(function (data) {
                        bot.sendMessage(message.chat.id, article.value + ', ' + oldCategory + article.category + ' \uD83E\uDD16');
                    }).catch(function (err) {
                        (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                    });
                }).catch(function (err) {
                    (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                });
            }
        }
    }, {
        key: 'commentChange',
        value: function commentChange(message, bot) {
            _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_COMMENT_CHANGE));

            //сохранение коммента к последней записи
            //TODO: вынести общий код в History
            var file = _config3.default.dirStorage + 'balance-hist-' + message.chat.id + '.json';
            if (_filesystem2.default.isFileExists(file, true, null, '[]')) {
                _filesystem2.default.readJson(file).then(function (json) {
                    var history = json || [];
                    var article = history.sort(function (i1, i2) {
                        return i2.id - i1.id;
                    });
                    if (!article || article.length == 0) {
                        bot.sendMessage(message.chat.id, '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');
                        return;
                    }
                    article = article[0];
                    article.comment = message.text;

                    _filesystem2.default.saveJson(file, history).then(function (data) {
                        bot.sendMessage(message.chat.id, article.value + ', ' + article.comment + ' \uD83E\uDD16');
                    }).catch(function (err) {
                        (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                    });
                }).catch(function (err) {
                    (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                });
            }
        }
    }, {
        key: 'delete',
        value: function _delete(message, bot, data) {
            //удаление записи
            //TODO: вынести общий код
            var file = _config3.default.dirStorage + 'balance-hist-' + message.chat.id + '.json';
            if (_filesystem2.default.isFileExists(file, true, null, '[]')) {
                _filesystem2.default.readJson(file).then(function (json) {
                    var history = json || [];
                    var category = data;

                    var hId = category.hId;

                    var article = history.filter(function (item) {
                        return item.id == hId;
                    });
                    if (!article || article.length == 0) {
                        bot.sendMessage(message.chat.id, '\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u0430\u0439\u0442\u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \uD83E\uDD16');
                        return;
                    }
                    article = article[0];
                    if (article.date_delete) {
                        bot.sendMessage(message.chat.id, '\u0417\u0430\u043F\u0438\u0441\u044C \u0443\u0436\u0435 \u0431\u044B\u043B\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0430 \uD83E\uDD16');
                        return;
                    }
                    _server.store.dispatch((0, _actions.botCmd)(message.chat.id, _commands3.default.BALANCE_REMOVE));
                    article.date_delete = new Date();

                    var balance = _server.store.getState().balance[message.chat.id] || {};
                    var success = void 0;
                    if (balance.period != article.date_delete.getMonth()) {
                        success = article.value + ' \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438. \u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0437\u0430 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0435\u0441\u044F\u0446 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0441\u044F \uD83E\uDD16';
                    } else {
                        _server.store.dispatch((0, _actions.balanceChange)(message.chat.id, new Date(article.date_create).getMonth(), -article.value));
                        success = article.value + ' \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438. \u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + (parseInt(balance.balance) + parseInt(article.value)) + ' \uD83E\uDD16';
                    }

                    _filesystem2.default.saveJson(file, history).then(function (data) {
                        bot.sendMessage(message.chat.id, success);
                    }).catch(function (err) {
                        (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                    });
                }).catch(function (err) {
                    (0, _logger.log)('\u041E\u0448\u0438\u0431\u043A\u0430 \u0447\u0442\u0435\u043D\u0438\u044F \u0444\u0430\u0439\u043B\u0430 \u0438\u0441\u0430\u0442\u043E\u0440\u0438\u0438 \u0431\u0430\u043B\u0430\u043D\u0441\u0430. err = ' + err + '. file = ' + file);
                });
            }
        }
    }, {
        key: '_mapGroupsToButtons',
        value: function _mapGroupsToButtons(id, group) {
            return {
                text: group.title,
                callback_data: JSON.stringify({
                    gId: group.id,
                    hId: id,
                    cmd: _commands3.default.BALANCE_CATEGORY_CHANGE
                })
            };
        }
    }]);

    return Balance;
}();

exports.default = Balance;