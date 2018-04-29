'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.historyShouldUpdate = exports.historySaveUndo = exports.historySave = exports.historyEditSwitch = exports.historyDateSet = exports.historyCategoriesSelected = exports.historyCategoryToggle = exports.categoriesFetch = exports.historyUserToggle = exports.usersFetch = exports.historySkipAction = exports.historyFetch = exports.HISTORY_UPDATE = exports.HISTORY_SAVE_UNDO = exports.HISTORY_SAVE_DONE = exports.HISTORY_SAVE = exports.HISTORY_EDIT_OFF = exports.HISTORY_EDIT_ON = exports.HISTORY_DATE_END = exports.HISTORY_DATE_START = exports.HISTORY_CATEGORIES_SELECTED = exports.HISTORY_CATEGORY_TOGGLE = exports.HISTORY_CATEGORIES_FETCH_DONE = exports.HISTORY_CATEGORIES_FETCH = exports.HISTORY_USER_TOGGLE = exports.USERS_FETCH_DONE = exports.USERS_FETCH = exports.HISTORY_SKIP = exports.HISTORY_FETCH_DONE = exports.HISTORY_FETCH = undefined;var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _stringify = require('babel-runtime/core-js/json/stringify');var _stringify2 = _interopRequireDefault(_stringify);var _isomorphicFetch = require('isomorphic-fetch');var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _config2 = require('../../config');var _config3 = _interopRequireDefault(_config2);
var _logger = require('../../logger');var _logger2 = _interopRequireDefault(_logger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var HISTORY_FETCH = exports.HISTORY_FETCH = 'HISTORY_FETCH';
var HISTORY_FETCH_DONE = exports.HISTORY_FETCH_DONE = 'HISTORY_FETCH_DONE';
var HISTORY_SKIP = exports.HISTORY_SKIP = 'HISTORY_SKIP';
var USERS_FETCH = exports.USERS_FETCH = 'USERS_FETCH';
var USERS_FETCH_DONE = exports.USERS_FETCH_DONE = 'USERS_FETCH_DONE';
var HISTORY_USER_TOGGLE = exports.HISTORY_USER_TOGGLE = 'HISTORY_USER_TOGGLE';
var HISTORY_CATEGORIES_FETCH = exports.HISTORY_CATEGORIES_FETCH = 'HISTORY_CATEGORIES_FETCH';
var HISTORY_CATEGORIES_FETCH_DONE = exports.HISTORY_CATEGORIES_FETCH_DONE = 'HISTORY_CATEGORIES_FETCH_DONE';
var HISTORY_CATEGORY_TOGGLE = exports.HISTORY_CATEGORY_TOGGLE = 'HISTORY_CATEGORY_TOGGLE';
var HISTORY_CATEGORIES_SELECTED = exports.HISTORY_CATEGORIES_SELECTED = 'HISTORY_CATEGORIES_SELECTED';
var HISTORY_DATE_START = exports.HISTORY_DATE_START = 'HISTORY_DATE_START';
var HISTORY_DATE_END = exports.HISTORY_DATE_END = 'HISTORY_DATE_END';
var HISTORY_EDIT_ON = exports.HISTORY_EDIT_ON = 'HISTORY_EDIT_ON';
var HISTORY_EDIT_OFF = exports.HISTORY_EDIT_OFF = 'HISTORY_EDIT_OFF';
var HISTORY_SAVE = exports.HISTORY_SAVE = 'HISTORY_SAVE';
var HISTORY_SAVE_DONE = exports.HISTORY_SAVE_DONE = 'HISTORY_SAVE_DONE';
var HISTORY_SAVE_UNDO = exports.HISTORY_SAVE_UNDO = 'HISTORY_SAVE_UNDO';
var HISTORY_UPDATE = exports.HISTORY_UPDATE = 'HISTORY_UPDATE';

var restUrl = _config3.default.isProduction ? '' : '//127.0.0.1:42042';

var historyFetchDone = function historyFetchDone(id, json) {return {
        type: HISTORY_FETCH_DONE,
        id: id,
        data: json.data || [],
        meta: json.meta };};


// categories = ['cat1', 'cat2', 'cat3']
var historyFetch = exports.historyFetch = function historyFetch(id) {var
    skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;var
    categories = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];var
    selectedUsers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];var
    dateStart = arguments[4];var
    dateEnd = arguments[5];return (
        function (dispatch) {
            _logger2.default.d('action.historyFetch()');
            var cats = '';
            if (Array.isArray(categories) && categories.length > 0) {
                cats = categories.join(',');
            }
            var usrs = '';
            if (Array.isArray(selectedUsers) && selectedUsers.length > 0) {
                usrs = selectedUsers.join(',');
            }
            return (0, _isomorphicFetch2.default)(restUrl + '/api/historyGet', {
                method: 'POST',
                body: (0, _stringify2.default)({ id: id, skip: skip, dateStart: dateStart, dateEnd: dateEnd, categories: cats, users: usrs }) })

            // Do not use catch, because that will also catch
            // any errors in the dispatch and resulting render,
            // causing an loop of 'Unexpected batch number' errors.
            // https://github.com/facebook/react/issues/6895
            .then(function (response) {return response.json();}, function (error) {return _logger2.default.e('An error occured.', error);}).
            then(function (json) {return dispatch(historyFetchDone(id, json));});
        });};

var historySkipAction = exports.historySkipAction = function historySkipAction(skip) {return {
        type: HISTORY_SKIP,
        skip: skip };};


var usersFetchDone = function usersFetchDone(json) {return {
        type: USERS_FETCH_DONE,
        data: json || {} };};


var usersFetch = exports.usersFetch = function usersFetch(chatId) {return function (dispatch) {return (
            (0, _isomorphicFetch2.default)(restUrl + '/api/users', {
                method: 'POST',
                body: (0, _stringify2.default)({ chatId: chatId }) }).

            then(function (response) {return response.json();}, function (error) {return _logger2.default.e('An error occured.', error);}).
            then(function (json) {return dispatch(usersFetchDone(json));}));};};

var historyUserToggle = exports.historyUserToggle = function historyUserToggle(id) {return {
        type: HISTORY_USER_TOGGLE,
        data: id };};


var categoriesFetchDone = function categoriesFetchDone(json) {return {
        type: HISTORY_CATEGORIES_FETCH_DONE,
        data: json || {} };};


var categoriesFetch = exports.categoriesFetch = function categoriesFetch(chatId) {return function (dispatch) {
        _logger2.default.d('action.categoriesFetch()');
        return (0, _isomorphicFetch2.default)(restUrl + '/api/categories', {
            method: 'POST',
            body: (0, _stringify2.default)({ chatId: chatId }) }).

        then(function (response) {return response.json();}, function (error) {return _logger2.default.e('An error occured.', error);}).
        then(function (json) {return dispatch(categoriesFetchDone(json));});
    };};

var historyCategoryToggle = exports.historyCategoryToggle = function historyCategoryToggle(category) {return {
        type: HISTORY_CATEGORY_TOGGLE,
        data: category };};


var historyCategoriesSelected = exports.historyCategoriesSelected = function historyCategoriesSelected() {var categories = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];return {
        type: HISTORY_CATEGORIES_SELECTED,
        data: categories };};


var historyDateSet = exports.historyDateSet = function historyDateSet() {var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();var isStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;return {
        type: isStart ? HISTORY_DATE_START : HISTORY_DATE_END,
        data: date };};


var historyEditSwitch = exports.historyEditSwitch = function historyEditSwitch() {var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;return {
        type: id === null ? HISTORY_EDIT_OFF : HISTORY_EDIT_ON,
        data: id };};


var historySaveDone = function historySaveDone() {var isError = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;return {
        type: HISTORY_SAVE_DONE,
        data: isError };};


// changes = { value, category, comment, date_delete, date_create }
var historySave = exports.historySave = function historySave(chatId, id, changes) {return (
        function (dispatch) {return (0, _isomorphicFetch2.default)(restUrl + '/api/historySet', {
                method: 'POST',
                body: (0, _stringify2.default)((0, _extends3.default)({},
                changes, {
                    chatId: chatId,
                    id: id })) })


            // Do not use catch, because that will also catch
            // any errors in the dispatch and resulting render,
            // causing an loop of 'Unexpected batch number' errors.
            // https://github.com/facebook/react/issues/6895
            .then(function (response) {return response.status !== 200;}, function (error) {
                historySaveDone(true);
                _logger2.default.e('An error occured.', error);
            }).
            then(function (isError) {return dispatch(historySaveDone(isError));});});};

var historySaveUndo = exports.historySaveUndo = function historySaveUndo(chatId, id, changes) {return {
        type: HISTORY_SAVE_UNDO,
        chatId: chatId,
        id: id,
        changes: changes };};


var historyShouldUpdate = exports.historyShouldUpdate = function historyShouldUpdate() {var shouldUpdate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;return {
        type: HISTORY_UPDATE,
        data: shouldUpdate };};;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register(HISTORY_FETCH, 'HISTORY_FETCH', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_FETCH_DONE, 'HISTORY_FETCH_DONE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_SKIP, 'HISTORY_SKIP', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(USERS_FETCH, 'USERS_FETCH', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(USERS_FETCH_DONE, 'USERS_FETCH_DONE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_USER_TOGGLE, 'HISTORY_USER_TOGGLE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_CATEGORIES_FETCH, 'HISTORY_CATEGORIES_FETCH', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_CATEGORIES_FETCH_DONE, 'HISTORY_CATEGORIES_FETCH_DONE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_CATEGORY_TOGGLE, 'HISTORY_CATEGORY_TOGGLE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_CATEGORIES_SELECTED, 'HISTORY_CATEGORIES_SELECTED', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_DATE_START, 'HISTORY_DATE_START', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_DATE_END, 'HISTORY_DATE_END', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_EDIT_ON, 'HISTORY_EDIT_ON', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_EDIT_OFF, 'HISTORY_EDIT_OFF', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_SAVE, 'HISTORY_SAVE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_SAVE_DONE, 'HISTORY_SAVE_DONE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_SAVE_UNDO, 'HISTORY_SAVE_UNDO', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(HISTORY_UPDATE, 'HISTORY_UPDATE', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(restUrl, 'restUrl', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyFetchDone, 'historyFetchDone', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyFetch, 'historyFetch', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historySkipAction, 'historySkipAction', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(usersFetchDone, 'usersFetchDone', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(usersFetch, 'usersFetch', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyUserToggle, 'historyUserToggle', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(categoriesFetchDone, 'categoriesFetchDone', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(categoriesFetch, 'categoriesFetch', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyCategoryToggle, 'historyCategoryToggle', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyCategoriesSelected, 'historyCategoriesSelected', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyDateSet, 'historyDateSet', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyEditSwitch, 'historyEditSwitch', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historySaveDone, 'historySaveDone', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historySave, 'historySave', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historySaveUndo, 'historySaveUndo', 'src/wwwdev/src/wwwdev/src/actions.js');__REACT_HOT_LOADER__.register(historyShouldUpdate, 'historyShouldUpdate', 'src/wwwdev/src/wwwdev/src/actions.js');}();;