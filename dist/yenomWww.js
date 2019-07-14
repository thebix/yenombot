'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _rxjs = require('rxjs');
var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _wwwServer = require('./lib/lib/wwwServer');var _wwwServer2 = _interopRequireDefault(_wwwServer);
var _logger = require('./logger');
var _history = require('./history/history');var _history2 = _interopRequireDefault(_history);
var _storage = require('./storage');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;}

var HISTORY_PAGE_COUNT = 150;

var handleApiError404 = function handleApiError404(urlPath) {return new _wwwServer.WwwResponse({
        httpCode: 404,
        filePath: urlPath,
        contentType: _wwwServer.mimeTypes.text,
        data: '404 not found' });};

var handleApiError500 = function handleApiError500(urlPath, error) {return new _wwwServer.WwwResponse({
        httpCode: 500,
        filePath: urlPath,
        contentType: _wwwServer.mimeTypes.text,
        data: error });};


var handleApi = {
    '/api/categories': function apiCategories(_ref) {var body = _ref.body,method = _ref.method;var
        chatId = body.chatId;
        if (method !== 'POST' || !chatId)
        return _rxjs.Observable.of(handleApiError404('/api/categories'));
        return _storage.storage.getItem('paymentGroups', chatId).
        map(function (storageCategories) {return new _wwwServer.WwwResponse({
                httpCode: 200,
                filePath: '/api/categories',
                contentType: _wwwServer.mimeTypes.json,
                data: JSON.stringify(storageCategories || []),
                headData: [{ 'Access-Control-Allow-Origin': '*' }] });});

    },
    '/api/users': function apiUsers(_ref2) {var body = _ref2.body,method = _ref2.method;var
        chatId = body.chatId;
        if (method !== 'POST' || !chatId)
        return _rxjs.Observable.of(handleApiError404('/api/users'));
        return _storage.storage.getItem('balanceUsers', chatId).
        map(function (storageBalanceUsers) {return new _wwwServer.WwwResponse({
                httpCode: 200,
                filePath: '/api/users',
                contentType: _wwwServer.mimeTypes.json,
                data: JSON.stringify(storageBalanceUsers || []),
                headData: [{ 'Access-Control-Allow-Origin': '*' }] });});

    },
    '/api/historyGet': function apiHistoryGet(_ref3) {var body = _ref3.body,method = _ref3.method;var

        chatId =





        body.id,bodyCategories = body.categories,bodyUsers = body.users,dateStart = body.dateStart,dateEnd = body.dateEnd,_body$skip = body.skip,skipParam = _body$skip === undefined ? 0 : _body$skip;
        if (method !== 'POST' || !chatId)
        return _rxjs.Observable.of(handleApiError404('/api/historyGet'));
        var skip = +skipParam;
        return _rxjs.Observable.combineLatest(
        _history2.default.getAll(chatId),
        _storage.storage.getItem('nonUserPaymentGroups', chatId),
        function (historyAll, nonUserPaymentCategories) {
            var categories = bodyCategories ? bodyCategories.split(',') : [];
            var users = bodyUsers ? bodyUsers.split(',') : [];
            var dtStart = dateStart ? new Date(+dateStart) : null;
            var dtEnd = dateEnd ? new Date(+dateEnd) : null;
            var historyFiltered = historyAll.
            filter(function (item) {return (categories.length === 0 || categories.indexOf(item.category) > -1) && (
                users.length === 0 || users.indexOf('' + item.user_id) > -1) && (
                !dtStart || dtStart.getTime() <= new Date(item.date_create).getTime()) && (
                !dtEnd || dtEnd.getTime() > new Date(item.date_create).getTime());}).
            sort(function (a, b) {return b.id - a.id;});
            var historyFilteredLength = historyFiltered.length;
            if (skip === -1)
            skip = historyFilteredLength - HISTORY_PAGE_COUNT;
            var historyFilteredSkipped = historyFiltered.slice(+skip);
            historyFilteredSkipped.splice(HISTORY_PAGE_COUNT);

            var activeCategories = {};
            Array.from(new Set(historyFiltered.map(function (item) {return item.category;}))).
            forEach(function (category) {
                activeCategories[category] = {
                    sum: historyFiltered.
                    filter(function (it) {return !it.date_delete && it.category === category;}).
                    map(function (it) {return it.value || 0;}).
                    reduce(function (sum, prev) {return sum + prev;}, 0) };

            });

            var activeUsersIds = {};
            var nonUserCategories = nonUserPaymentCategories || [];
            Array.from(new Set(historyFiltered.map(function (item) {return item.user_id;}))).
            forEach(function (userId) {
                activeUsersIds[userId] = {
                    sum: historyFiltered.
                    filter(function (it) {return !it.date_delete && it.user_id === userId &&
                        nonUserCategories.indexOf(it.category) === -1;}).
                    map(function (it) {return it.value || 0;}).
                    reduce(function (sum, prev) {return sum + prev;}, 0) };

            });

            var totalSum = historyFiltered.filter(function (it) {return !it.date_delete;}).
            reduce(function (sum, current) {return sum + current.value;}, 0);

            return new _wwwServer.WwwResponse({
                httpCode: 200,
                filePath: '/api/historyGet',
                contentType: _wwwServer.mimeTypes.json,
                headData: [{ 'Access-Control-Allow-Origin': '*' }],
                data: JSON.stringify({
                    data: historyFilteredSkipped,
                    meta: {
                        length: historyFilteredLength,
                        activeCategories: activeCategories,
                        activeUsersIds: activeUsersIds,
                        totalSum: totalSum } }) });



        });

    },
    '/api/historySet': function apiHistorySet(_ref4) {var body = _ref4.body,method = _ref4.method;var
        id = body.id,chatId = body.chatId,changes = _objectWithoutProperties(body, ['id', 'chatId']);
        if (method !== 'POST' || !chatId)
        return _rxjs.Observable.of(handleApiError404('/api/historySet'));
        if (id <= 0 || !changes)
        return _rxjs.Observable.of(handleApiError500('/api/historySet', 'Write history error'));

        return _history2.default.update(id, changes, chatId).
        map(function (updatedItem) {
            if (!updatedItem)
            return _rxjs.Observable.of(handleApiError500('/api/historySet', 'Write history error'));
            return new _wwwServer.WwwResponse({
                httpCode: 200,
                filePath: '/api/historySet',
                contentType: _wwwServer.mimeTypes.json,
                data: 'ok',
                headData: [{ 'Access-Control-Allow-Origin': '*' }] });

        });
    } };exports.default =


function () {
    (0, _logger.log)('yenomWww.startWwwServer()', _logger.logLevel.INFO);
    var wwwServer = new _wwwServer2.default({
        port: _config2.default.www.port,
        wwwRoot: _config2.default.www.wwwRoot,
        handleApi: handleApi });

    return wwwServer.response;
};