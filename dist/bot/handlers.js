'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.mapUserActionToBotMessages = exports.storageId = exports.dateTimeString = undefined;




var _Observable = require('rxjs/Observable');
var _exprEval = require('expr-eval');

var _message = require('./message');
var _commands = require('./commands');var _commands2 = _interopRequireDefault(_commands);
var _storage = require('../storage');var _storage2 = _interopRequireDefault(_storage);
var _logger = require('../logger');
var _token = require('../token');var _token2 = _interopRequireDefault(_token);
var _inputParser = require('./inputParser');var _inputParser2 = _interopRequireDefault(_inputParser);
var _config = require('../config');var _config2 = _interopRequireDefault(_config);
var _history = require('../history/history');var _history2 = _interopRequireDefault(_history);
var _root = require('../lib/root');var _root2 = _interopRequireDefault(_root);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}} /*
                                                                                                                                                                                                                                                                                                                                                                       * INFO:
                                                                                                                                                                                                                                                                                                                                                                       *      - every handler should return Observable.from([BotMessage])
                                                                                                                                                                                                                                                                                                                                                                       */var lastCommands = {};var lastChangeBalanceBotMessageId = {};

/*
                                                                                                                                                                                                                                                                                                                                                                                                                                        * ERRORS HANDERS
                                                                                                                                                                                                                                                                                                                                                                                                                                        */
var errorToUser = function errorToUser(userId, chatId) {return [
    new _message.BotMessage(userId, chatId, 'При при обработке запроса произошла ошибка. Пожалуйста, начните заново')];};

var botIsInDevelopmentToUser = function botIsInDevelopmentToUser(userId, chatId) {
    (0, _logger.log)('handlers.botIsInDevelopmentToUser: userId="' + userId + '" is not in token.developers array.', _logger.logLevel.ERROR);
    return _Observable.Observable.from([
    new _message.BotMessage(
    userId, chatId,
    // eslint-disable-next-line max-len
    '\u0412 \u0434\u0430\u043D\u043D\u044B\u0439 \u043C\u043E\u043C\u0435\u043D\u0442 \u0431\u043E\u0442 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u0440\u0435\u0436\u0438\u043C\u0435 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438. \n\u0412\u0430\u0448 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440 \u0432 \u043C\u0435\u0441\u0441\u0435\u043D\u0434\u0436\u0435\u0440\u0435 - "' + userId + '". \u0421\u043E\u043E\u0431\u0449\u0438\u0442\u0435 \u0441\u0432\u043E\u0439 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0440 \u043F\u043E \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u0430\u043C \u0432 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0438 \u0431\u043E\u0442\u0430, \u0447\u0442\u043E\u0431\u044B \u0412\u0430\u0441 \u0434\u043E\u0431\u0430\u0432\u0438\u043B\u0438 \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A\u043E\u0432')]);


};

/*
    * COMMON METHODS
    */
var dateTimeString = exports.dateTimeString = function dateTimeString() {var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();return date.toLocaleDateString() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);}; // eslint-disable-line max-len

var storageId = exports.storageId = function storageId(userId, chatId) {return '' + chatId;};

var initializeBalanceObservable = function initializeBalanceObservable(userId, chatId) {return (
        _storage2.default.getItem(storageId(userId, chatId), 'balanceInit').
        switchMap(function (balanceInitValue) {
            var balanceObject = {
                balance: balanceInitValue || 0,
                period: new Date().getMonth() };

            return _storage2.default.updateItem(storageId(userId, chatId), 'balance', balanceObject).
            map(function (isBalanceObjectUpdated) {return (
                    isBalanceObjectUpdated === true ?
                    balanceObject :
                    null);});
        }));};
var getBalanceObservable = function getBalanceObservable(userId, chatId) {return (
        _storage2.default.getItem(storageId(userId, chatId), 'balance').
        switchMap(function (balanceObject) {
            if (balanceObject === false)
            return _Observable.Observable.of(null);
            var period = new Date().getMonth();
            if (balanceObject === undefined || balanceObject === null || balanceObject === '' ||
            period !== balanceObject.period) {
                return initializeBalanceObservable(userId, chatId);
            }
            return _Observable.Observable.of(balanceObject);
        }));};
var getCategoriesObservable = function getCategoriesObservable(userId, chatId) {return (
        _storage2.default.getItem(storageId(userId, chatId), 'paymentGroups').
        map(function (categoriesArray) {
            if (categoriesArray === false)
            (0, _logger.log)('handlers:getCategoriesObservable: can\'t fetch categories. userId:<' +
            userId + '>, chatId:<' + chatId + '>',
            _logger.logLevel.ERROR);

            return categoriesArray || [];
        }));};

var getCurrenciesObservable = function getCurrenciesObservable(userId, chatId) {return (
        _storage2.default.getItem(storageId(userId, chatId), 'currencies').
        map(function (currencies) {
            if (currencies == null)
            (0, _logger.log)('handlers:getCurrenciesObservable: can\'t fetch currencies. userId:<' + userId + '>, chatId:<' + chatId + '>', _logger.logLevel.INFO);
            return currencies || { RUB: 1 };
        }));};

/*
                * HANDLERS
                */
/*
                    * USER MESSAGE HELPERS
                    */
var start = function start(userId, chatId) {return _Observable.Observable.from([
    new _message.BotMessage(userId, chatId, 'Вас приветствует yenomBot!')]);};

var help = function help(userId, chatId) {return _Observable.Observable.from([
    new _message.BotMessage(userId, chatId, 'Помощь\nЗдесь Вы можете узнать актуальную информацию о своих деньгах.')]);};

var tokenInit = function tokenInit(userId, chatId, text) {
    var tokenKey = text.split(' ')[1];
    if (Object.keys(_token2.default.initData).indexOf(tokenKey) === -1)
    return _Observable.Observable.from([new _message.BotMessage(userId, chatId, 'Токен не найден')]);

    var initDataItems = _token2.default.initData[tokenKey];
    var dataItems = Object.keys(initDataItems).
    map(function (key) {return {
            fieldName: key,
            item: initDataItems[key] };});

    return _storage2.default.updateItems(storageId(userId, chatId), dataItems).
    mergeMap(function (isStorageUpdated) {return (
            !isStorageUpdated ?
            _Observable.Observable.from(errorToUser(userId, chatId)) :
            _Observable.Observable.from([new _message.BotMessage(userId, chatId, 'Токен принят')]));});

};

var balance = function balance(userId, chatId) {return (
        getBalanceObservable(userId, chatId).
        switchMap(function (balanceObject) {
            if (!balanceObject) {
                return _Observable.Observable.from(errorToUser(userId, chatId));
            }
            return _Observable.Observable.from([new _message.BotMessage(userId, chatId, '\u041E\u0441\u0442\u0430\u0442\u043E\u043A ' + balanceObject.balance)]);
        }));};

var balanceInit = function balanceInit(userId, chatId) {return (
        initializeBalanceObservable(userId, chatId).
        switchMap(function () {return balance(userId, chatId);}));};

var balanceChange = function balanceChange(user, chatId, text, messageId) {var
    userId = user.id,firstName = user.firstName,lastName = user.lastName;
    var parser = new _exprEval.Parser();
    var value = void 0;
    try {
        value = parser.parse(text.replace(/ /g, '').replace(/,/g, '.')).evaluate();
        if (!value)
        return _Observable.Observable.from([new _message.BotMessage(userId, chatId, 'Не понял выражение')]);
        if (value === Infinity)
        return _Observable.Observable.from([
        new _message.BotMessage(
        userId, chatId,
        'Я открою тебе маленькую тайну http://elementy.ru/email/1530320/Pochemu_nelzya_delit_na_nol')]);

        value = Math.round(value * 100) / 100;
    } catch (ex) {
        return _Observable.Observable.from([new _message.BotMessage(userId, chatId, 'Не понял выражение')]);
    }

    // TODO: this error should prevent further observables from emitting
    var addUserToStorageError = _storage2.default.getItem(storageId(userId, chatId), 'balanceUsers').
    concatMap(function (balanceUsers) {
        var balanceUsersUpdated = {};
        if (balanceUsers) {
            balanceUsersUpdated = balanceUsers;
        }
        if (!balanceUsersUpdated[userId]) {
            balanceUsersUpdated[userId] = (firstName || '') + ' ' + (lastName || '');
            return _storage2.default.updateItem(storageId(userId, chatId), 'balanceUsers', balanceUsersUpdated).
            switchMap(function (updateResult) {return updateResult ?
                _Observable.Observable.empty() :
                _Observable.Observable.from(errorToUser(userId, chatId));});

        }
        return _Observable.Observable.empty();
    });

    var newBalanceObservable = getBalanceObservable(userId, chatId).
    switchMap(function (balanceObject) {
        if (!balanceObject) {
            return _Observable.Observable.from(errorToUser(userId, chatId));
        }var
        balanceValue = balanceObject.balance;
        var newBalanceObject = Object.assign({}, balanceObject, { balance: Math.round((balanceValue - value) * 100) / 100 });
        return _storage2.default.updateItem(storageId(userId, chatId), 'balance', newBalanceObject).
        map(function (isBalanceUpdated) {return isBalanceUpdated ?
            newBalanceObject :
            null;});

    }).share();

    var balanceUpdateError = newBalanceObservable.
    filter(function (newBalanceObject) {return !newBalanceObject;}).
    switchMap(function () {
        (0, _logger.log)('handlers: balanceChange: can\'t update balance. userId:<' +
        userId + '>, chatId:<' + chatId + '>, text:<' + text + '>, messageId:<' + messageId + '>',
        _logger.logLevel.ERROR);

        return [new _message.BotMessage(userId, chatId, 'При обновлении баланса возникла ошибка')];
    });

    var historySaveObservable =
    _Observable.Observable.combineLatest(
    newBalanceObservable.
    filter(function (newBalanceObject) {return !!newBalanceObject;}),
    getCurrenciesObservable(userId, chatId),
    function (newBalanceObject, currencies) {
        var values = {};
        Object.keys(currencies).
        forEach(function (keyCurrency) {
            values[keyCurrency] = Math.round(currencies[keyCurrency] * 100 * value) / 100;
        });
        return { newBalanceObject: newBalanceObject, values: values };
    }).

    switchMap(function (_ref) {var newBalanceObject = _ref.newBalanceObject,values = _ref.values;return (
            _history2.default.add(
            new _history.HistoryItem(messageId, userId, Math.round(value * 100) / 100, values),
            chatId).

            map(function (isHistorySaved) {return isHistorySaved ?
                newBalanceObject :
                null;}));}).
    share();

    var historySaveError = historySaveObservable.
    filter(function (isHistorySaved) {return !isHistorySaved;}).
    switchMap(function () {
        (0, _logger.log)('handlers:balanceChange: can\'t save history item. userId:<' +
        userId + '>, chatId:<' + chatId + '>, text:<' + text + '>, messageId:<' + messageId + '>',
        _logger.logLevel.ERROR);

        return [new _message.BotMessage(userId, chatId, 'При обновлении истории возникла ошибка')];
    });

    var successObservable =
    _Observable.Observable.combineLatest(
    getCategoriesObservable(userId, chatId),
    historySaveObservable.
    filter(function (isHistorySaved) {return !!isHistorySaved;}),
    function (categories) {
        var cols = 3; // count in horizontal block
        var buttonsGroups = [
        new _message.InlineButtonsGroup([
        new _message.InlineButton('Удалить', {
            hId: messageId,
            cmd: _commands2.default.BALANCE_REMOVE })])];

        var blocksCount = parseInt(categories.length / cols, 10) + (
        categories.length % cols > 0 ? 1 : 0);
        for (var i = 0; i < blocksCount; i += 1) {
            // eslint-disable-next-line function-paren-newline
            buttonsGroups.push(
            // eslint-disable-next-line function-paren-newline
            new _message.InlineButtonsGroup(
            categories.slice(i * cols, cols * (i + 1)).
            map(function (category) {var
                id = category.id,title = category.title;
                return new _message.InlineButton(title, {
                    gId: id,
                    hId: messageId,
                    cmd: _commands2.default.BALANCE_CATEGORY_CHANGE });

            })));
        }
        lastCommands[storageId(userId, chatId)] = _commands2.default.BALANCE_CHANGE;
        // buttonsGroups.length > 1 since at least one group (Delete button) always exists
        return _Observable.Observable.from([
        new _message.BotMessage(
        userId, chatId, '\u0417\u0430\u043F\u0438\u0441\u0430\u043B ' +
        value + '.' + (buttonsGroups.length > 1 ? ' Выбери категорию' : ''),
        buttonsGroups)]).

        concat(balance(userId, chatId));
    }).

    concatMap(function (item) {return item.delay(10);});
    return _Observable.Observable.merge(addUserToStorageError, balanceUpdateError, historySaveError, successObservable);
};

var commentChange = function commentChange(userId, chatId, text) {
    var historyAllObservable = _history2.default.getAll(chatId).share();
    var historyAllError = historyAllObservable.
    filter(function (historyAll) {return !historyAll || historyAll.length === 0;}).
    switchMap(function () {
        (0, _logger.log)('handlers:commentChange: can\'t fetch history items. userId:<' + userId + '>, chatId:<' + chatId, _logger.logLevel.ERROR);
        return errorToUser(userId, chatId);
    });

    var historyUpdateObservable =
    historyAllObservable.
    filter(function (historyAll) {return historyAll && historyAll.length !== 0;}).
    switchMap(function (historyAll) {
        var historyLastId = Math.max.apply(Math, _toConsumableArray(historyAll.map(function (historyItem) {return historyItem.id;})));
        return _history2.default.update(historyLastId, { comment: text }, chatId);
    }).share();

    var historyUpdateError =
    historyUpdateObservable.
    filter(function (updatedHistoryItem) {return !updatedHistoryItem;}).
    switchMap(function () {
        (0, _logger.log)('handlers:commentChange: can\'t update last history item. userId:<' + userId + '>, chatId:<' + chatId, _logger.logLevel.ERROR);
        return errorToUser(userId, chatId);
    });

    var successObservable =
    historyUpdateObservable.
    filter(function (updatedHistoryItem) {return !!updatedHistoryItem;}).
    switchMap(function (updatedHistoryItem) {
        lastCommands[storageId(userId, chatId)] = undefined;
        var editMessageId = lastChangeBalanceBotMessageId[storageId(userId, chatId)];
        if (!editMessageId) {
            return _Observable.Observable.empty();
        }
        return _Observable.Observable.of(new _message.BotMessageEdit(
        editMessageId, chatId,
        updatedHistoryItem.value + ', ' + updatedHistoryItem.category + ', ' + updatedHistoryItem.comment + (updatedHistoryItem.date_delete ?
        ' удалено из истории' : ''),
        [new _message.InlineButtonsGroup(updatedHistoryItem.date_delete ?
        [] :
        [new _message.InlineButton('Удалить', { hId: updatedHistoryItem.id, cmd: _commands2.default.BALANCE_REMOVE })])]));

    }).
    concat(balance(userId, chatId));

    return _Observable.Observable.merge(historyAllError, historyUpdateError, successObservable);
};

var stats = function stats(userId, chatId, text) {
    // getting the interval
    var dateEnd = void 0,
    dateStart = void 0,
    dateEndUser = void 0;
    var split = ('' + text).split(' ');
    if (split.length === 1) {// without params => just this month statistics
        dateEnd = _root2.default.time.getEndDate();
        dateStart = _root2.default.time.getMonthStartDate(dateEnd);
        dateEndUser = dateEnd;
    } else if (split.length < 3) {// date start - till - current date
        dateEnd = _root2.default.time.getEndDate();
        dateStart = _root2.default.time.getBack(split[1].trim(' '), dateEnd);
        dateEndUser = dateEnd;
    } else {// date start - till - date end
        // end day should be added to statistics
        var end = _root2.default.time.getBack(split[2].trim(' ')); // date end (starts from 0:00)
        dateStart = _root2.default.time.getBack(split[1].trim(' '), end);
        dateEnd = _root2.default.time.getEndDate(end);
        if (_root2.default.time.isDateSame(dateStart, dateEnd))
        dateEndUser = dateEnd;else

            // we are showing to user the date one day less
            dateEndUser = _root2.default.time.getChangedDateTime({ days: -1 }, dateEnd);
    }
    var dateEndTime = dateEnd.getTime();
    var dateStartTime = dateStart.getTime();
    var curTicks = dateEndTime - dateStartTime;
    if (curTicks < 1000 * 60 * 60 * 4)
    return _Observable.Observable.from([new _message.BotMessage(
    userId, chatId,
    'Слишком короткий интервал. Минимум 4 часа.')]);


    var intervalLength = _root2.default.time.daysBetween(dateStart, _root2.default.time.getChangedDateTime({ ticks: 1 }, dateEnd));

    return _Observable.Observable.combineLatest(
    _storage2.default.getItems(storageId(userId, chatId), ['nonUserPaymentGroups', 'balanceUsers']),
    _history2.default.getAll(chatId),
    function (storageData, historyAll) {var

        nonUserPaymentCategories =

        storageData.nonUserPaymentGroups,balanceUsers = storageData.balanceUsers;
        return {
            nonUserPaymentCategories: nonUserPaymentCategories || [],
            historyAll: historyAll || [],
            balanceUsers: balanceUsers || {} };

    }).
    concatMap(function (storageData) {var _storageData$nonUserP =




        storageData.nonUserPaymentCategories,nonUserPaymentCategories = _storageData$nonUserP === undefined ? [] : _storageData$nonUserP,_storageData$historyA = storageData.historyAll,historyAll = _storageData$historyA === undefined ? [] : _storageData$historyA,_storageData$balanceU = storageData.balanceUsers,balanceUsers = _storageData$balanceU === undefined ? {} : _storageData$balanceU;
        var periodNumber = 0;
        var historyAllSorted = historyAll.
        filter(function (historyItem) {return !historyItem.date_delete;}).
        sort(function (i1, i2) {return i2.id - i1.id;});
        var successMessages = [
        new _message.BotMessage(
        userId, chatId,
        // eslint-disable-next-line max-len
        '\u041F\u0435\u0440\u0438\u043E\u0434: ' + _root2.default.time.dateWeekdayString(dateStart) + ' - ' + _root2.default.time.dateWeekdayString(dateEndUser) + '\n\u0414\u043D\u0435\u0439: ' + _root2.default.time.daysBetween(dateStart, dateEnd))];


        if (historyAllSorted.length === 0) {
            successMessages.push(new _message.BotMessage(userId, chatId, 'Нет записей для отображения'));
            return _Observable.Observable.from(successMessages).
            concat(balance(userId, chatId));
        }

        // users in history
        // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
        var historyUsers = Array.from(new Set(historyAllSorted.map(function (item) {return item.user_id;}))) || [];
        // categories in history
        // http://stackoverflow.com/questions/1960473/unique-values-in-an-array
        var historyCategories = Array.from(new Set(historyAllSorted.map(function (item) {return item.category;}))) || [];
        var userSumsPevPeriods = {}; // summary of all payments by user in previous periods ~~, doesn't unclude current period~~
        historyUsers.forEach(function (user) {
            userSumsPevPeriods[user] = 0;
        });
        nonUserPaymentCategories.forEach(function (category) {
            userSumsPevPeriods[category] = 0;
        });
        var categoriesSumsPevPeriods = {}; // summary of all payments by category in previous periods ~~, doesn't unclude current period~~
        historyCategories.forEach(function (category) {
            categoriesSumsPevPeriods[category] = 0;
        });
        nonUserPaymentCategories.forEach(function (category) {
            categoriesSumsPevPeriods[category] = 0;
        });
        var userSumsByPeriods = {}; // payments by user by period, including current period
        var categoriesSumsByPeriods = {}; // payments by category by period, including current period
        var initCurrentPeriodUsersSums = function initCurrentPeriodUsersSums() {
            userSumsByPeriods[periodNumber] = {};
            historyUsers.forEach(function (user) {
                userSumsByPeriods[periodNumber][user] = 0;
            });
            nonUserPaymentCategories.forEach(function (category) {
                userSumsByPeriods[periodNumber][category] = 0;
            });
        };
        var initCurrentPeriodCategoriesSums = function initCurrentPeriodCategoriesSums() {
            categoriesSumsByPeriods[periodNumber] = {};
            historyCategories.forEach(function (category) {
                categoriesSumsByPeriods[periodNumber][category] = 0;
            });
            nonUserPaymentCategories.forEach(function (category) {
                categoriesSumsByPeriods[periodNumber][category] = 0;
            });
        };
        initCurrentPeriodUsersSums();
        initCurrentPeriodCategoriesSums();
        var curIntervalDateStart = dateStart;
        var curIntervalDateEnd = dateEnd;

        // get intervals before the last historyItem
        var historyItemLast = historyAllSorted[0];
        var historyItemTicks = new Date(historyItemLast.date_create).getTime();
        while (historyItemTicks < curIntervalDateStart.getTime()) {
            periodNumber += 1;
            curIntervalDateStart = _root2.default.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateStart);
            curIntervalDateEnd = _root2.default.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateEnd);
            initCurrentPeriodUsersSums();
            initCurrentPeriodCategoriesSums();
        }
        var i = 0;
        for (i; i < historyAllSorted.length; i += 1) {var _historyAllSorted$i =







            historyAllSorted[i],date_create = _historyAllSorted$i.date_create,value = _historyAllSorted$i.value,user_id = _historyAllSorted$i.user_id,category = _historyAllSorted$i.category;
            historyItemTicks = new Date(date_create).getTime();
            // check if we need to increase period
            while (historyItemTicks < curIntervalDateStart.getTime()) {
                periodNumber += 1;
                curIntervalDateStart = _root2.default.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateStart);
                curIntervalDateEnd = _root2.default.time.getChangedDateTime({ days: -intervalLength }, curIntervalDateEnd);
                initCurrentPeriodUsersSums();
                initCurrentPeriodCategoriesSums();
            }
            if (nonUserPaymentCategories.indexOf(category) === -1) {
                userSumsByPeriods[periodNumber][user_id] += value;
                userSumsPevPeriods[user_id] += value;
            } else {
                userSumsByPeriods[periodNumber][category] += value;
                userSumsPevPeriods[category] += value;
            }
            categoriesSumsByPeriods[periodNumber][category] += value;
            categoriesSumsPevPeriods[category] += value;
        }

        var periodsAllCount = Object.keys(userSumsByPeriods).length; // all history periods count
        if (periodsAllCount === 0) {
            successMessages.push(new _message.BotMessage(userId, chatId, 'Нет записей для отображения'));
            return _Observable.Observable.from(successMessages).
            concat(balance(userId, chatId));
        }
        var usersInCurrentPeriod =
        Object.keys(userSumsByPeriods[0]).
        filter(function (user) {return userSumsByPeriods[0][user] > 0;});
        var categoriesInCurrentPeriod =
        Object.keys(categoriesSumsByPeriods[0]).
        filter(function (category) {return categoriesSumsByPeriods[0][category] > 0;});
        var periodsCountByCategories = {}; // count of periods for concrete category. including current period
        categoriesInCurrentPeriod.forEach(function (category) {
            var periodsCountTmp = 0;
            var periodNum = 0;
            for (periodNum; periodNum < periodsAllCount; periodNum += 1) {
                periodsCountTmp += 1;
                if (categoriesSumsByPeriods[periodNum][category] !== 0) {
                    periodsCountByCategories[category] = (periodsCountByCategories[category] || 0) + periodsCountTmp;
                    periodsCountTmp = 0;
                }
            }
        });

        // sums by user
        var usersSumsText = 'Потрачено [в этом | в среднем]:';
        usersInCurrentPeriod.forEach(function (userIdOrCategoryTitle) {
            var userName = void 0;
            var perCount = void 0; // periods count
            if (balanceUsers[userIdOrCategoryTitle]) {
                userName = balanceUsers[userIdOrCategoryTitle];
                perCount = periodsAllCount; // user periods - all available in history
            } else {
                userName = userIdOrCategoryTitle; // category title from nonUserGroups
                perCount = periodsCountByCategories[userIdOrCategoryTitle]; // periods count for every category is different
            }

            var sum = Math.round(userSumsByPeriods[0][userIdOrCategoryTitle]) || 0;
            var bef = Math.round(userSumsPevPeriods[userIdOrCategoryTitle] / perCount) || 0;
            usersSumsText = usersSumsText + '\r\n' + userName + ': ' + sum + ' | ' + bef;
        });
        successMessages.push(new _message.BotMessage(userId, chatId, usersSumsText));

        // sums by category
        var sumsCategoriesText = 'По категориям [в этом | в среднем]:';
        categoriesInCurrentPeriod.
        sort(function (cat1, cat2) {return (
                Math.round(categoriesSumsByPeriods[0][cat2]) - Math.round(categoriesSumsByPeriods[0][cat1]));}).
        forEach(function (categoryTitle) {
            var cur = Math.round(categoriesSumsByPeriods[0][categoryTitle]);
            var bef = Math.round(categoriesSumsPevPeriods[categoryTitle] / periodsCountByCategories[categoryTitle]);
            sumsCategoriesText = sumsCategoriesText + '\r\n' + categoryTitle + ': ' + (cur || 0) + ' | ' + (bef || 0);
        });
        successMessages.push(new _message.BotMessage(userId, chatId, sumsCategoriesText));

        return _Observable.Observable.from(successMessages).
        concat(balance(userId, chatId));
    });
};

/*
    * USER ACTION HELPERS
    */
var categoryChange = function categoryChange(userId, chatId, data, messageId) {var
    hId = data.hId,gId = data.gId;

    var historyUpdateObservable = getCategoriesObservable(userId, chatId).
    switchMap(function (categories) {
        if (!categories || categories.length === 0)
        return errorToUser(userId, chatId);
        return _history2.default.update(hId, {
            category: categories.filter(function (category) {return gId === category.id;})[0].title },
        chatId);
    }).
    share();

    var historyUpdateError =
    historyUpdateObservable.
    filter(function (updatedHistoryItem) {return !updatedHistoryItem;}).
    switchMap(function () {
        (0, _logger.log)('handlers:categoryChange: can\'t update history item. hId:<' + hId + '>, gId:<' + gId, _logger.logLevel.ERROR);
        return errorToUser(userId, chatId);
    });

    var successObservable =
    historyUpdateObservable.
    filter(function (updatedHistoryItem) {return !!updatedHistoryItem;}).
    map(function (updatedHistoryItem) {
        lastCommands[storageId(userId, chatId)] = _commands2.default.BALANCE_CATEGORY_CHANGE;
        lastChangeBalanceBotMessageId[storageId(userId, chatId)] = messageId;
        return new _message.BotMessageEdit(
        messageId,
        chatId,
        updatedHistoryItem.value + ', ' + updatedHistoryItem.category,
        [new _message.InlineButtonsGroup([new _message.InlineButton('Удалить', { hId: hId, cmd: _commands2.default.BALANCE_REMOVE })])]);

    });
    return _Observable.Observable.merge(historyUpdateError, successObservable);
};

var balanceDelete = function balanceDelete(userId, chatId, data, messageId) {var
    hId = data.hId;

    var historyUpdateObservable =
    _history2.default.update(hId, {
        date_delete: new Date() },
    chatId).
    share();

    var historyUpdateError =
    historyUpdateObservable.
    filter(function (updatedHistoryItem) {return !updatedHistoryItem;}).
    switchMap(function () {
        (0, _logger.log)('handlers:balanceDelete: can\'t delete history item. hId:<' + hId + '>, chatId:<' + chatId + ', messageId:<' + messageId + '>', _logger.logLevel.ERROR);
        return errorToUser(userId, chatId);
    });

    var successObservable = _Observable.Observable.combineLatest(
    historyUpdateObservable.
    filter(function (updatedHistoryItem) {return !!updatedHistoryItem;}),
    getBalanceObservable(userId, chatId),
    function (updatedHistoryItem, balanceObject) {
        var dateCreated = new Date(updatedHistoryItem.date_create);
        var currentDate = new Date();
        if (currentDate.getFullYear() === dateCreated.getFullYear() &&
        currentDate.getMonth() === dateCreated.getMonth()) {var
            balanceValue = balanceObject.balance;
            var newBalanceObject = Object.assign({}, balanceObject, { balance: balanceValue + updatedHistoryItem.value });
            return _storage2.default.updateItem(storageId(userId, chatId), 'balance', newBalanceObject).
            switchMap(function (isBalanceUpdated) {
                if (!isBalanceUpdated) {
                    (0, _logger.log)('handlers:balanceDelete: can\'t update storage item. hId:<' +
                    hId + '>, chatId:<' + chatId + ', messageId:<' + messageId + '>',
                    _logger.logLevel.ERROR);

                    return errorToUser(userId, chatId);
                }
                return _Observable.Observable.from([
                new _message.BotMessageEdit(
                messageId,
                chatId,
                updatedHistoryItem.value + ', ' + updatedHistoryItem.category + ', ' + updatedHistoryItem.comment + ' \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438')]).

                concat(balance(userId, chatId));
            });
        }
        return _Observable.Observable.from([
        new _message.BotMessageEdit(
        messageId,
        chatId,
        updatedHistoryItem.value + ', ' + updatedHistoryItem.category + ', ' + updatedHistoryItem.comment + ' \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u0438\u0441\u0442\u043E\u0440\u0438\u0438')]).

        concat(balance(userId, chatId));
    }).

    concatMap(function (item) {return item;});
    return _Observable.Observable.merge(historyUpdateError, successObservable);
};

/*
    * EXPORTS
    */
var mapUserMessageToBotMessages = function mapUserMessageToBotMessages(message) {// eslint-disable-line complexity
    var
    text =




    message.text,from = message.from,chat = message.chat,id = message.id,user = message.user;
    var chatId = chat ? chat.id : from;

    var messagesToUser = void 0;
    if (!_config2.default.isProduction && !_inputParser2.default.isDeveloper(from)) {
        messagesToUser = botIsInDevelopmentToUser(from, chatId);
    } else if (_inputParser2.default.isStart(text)) {
        messagesToUser = start(from, chatId);
    } else if (_inputParser2.default.isHelp(text))
    messagesToUser = help(from, chatId);else
    if (_inputParser2.default.isToken(text))
    messagesToUser = tokenInit(from, chatId, text);else
    if (_inputParser2.default.isBalanceInit(text))
    messagesToUser = balanceInit(from, chatId);else
    if (_inputParser2.default.isBalance(text))
    messagesToUser = balance(from, chatId);else
    if (_inputParser2.default.isStats(text))
    messagesToUser = stats(from, chatId, text);else
    if (_inputParser2.default.isBalanceChange(text))
    messagesToUser = balanceChange(user, chatId, text, id);else
    if (_inputParser2.default.isCommentChange(lastCommands[storageId(from, chatId)]))
    messagesToUser = commentChange(from, chatId, text, id);

    if (!messagesToUser) {
        messagesToUser = help(from, chatId);
    }

    return _Observable.Observable.from(messagesToUser).
    concatMap(function (msgToUser) {return _Observable.Observable.of(msgToUser).delay(10);});
};

var mapUserActionToBotMessages = exports.mapUserActionToBotMessages = function mapUserActionToBotMessages(userAction) {// eslint-disable-line complexity
    var message = userAction.message,_userAction$data = userAction.data,data = _userAction$data === undefined ? {} : _userAction$data;var
    from = message.from,chat = message.chat,id = message.id;
    var chatId = chat ? chat.id : from;
    var callbackCommand = data.cmd || undefined;
    var messagesToUser = void 0;
    if (_inputParser2.default.isCategoryChange(callbackCommand))
    messagesToUser = categoryChange(from, chatId, data, id);else
    if (_inputParser2.default.isBalanceDelete(callbackCommand))
    messagesToUser = balanceDelete(from, chatId, data, id);else
    {
        (0, _logger.log)('handlers.mapUserActionToBotMessages: can\'t find handler for user action callback query. userId=' +
        from + ', chatId=' + chatId + ', data=' + JSON.stringify(data), // eslint-disable-line max-len
        _logger.logLevel.ERROR);

        messagesToUser = errorToUser(from, chatId);
    }

    return _Observable.Observable.from(messagesToUser).
    concatMap(function (msgToUser) {return _Observable.Observable.of(msgToUser).delay(10);});
};exports.default =

mapUserMessageToBotMessages;