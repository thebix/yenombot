'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.usersFetch = exports.historySkipAction = exports.historyFetch = exports.USERS_FETCH_DONE = exports.USERS_FETCH = exports.HISTORY_SKIP = exports.HISTORY_FETCH_DONE = exports.HISTORY_FETCH = undefined;var _stringify = require('babel-runtime/core-js/json/stringify');var _stringify2 = _interopRequireDefault(_stringify);var _isomorphicFetch = require('isomorphic-fetch');var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _config2 = require('../../config');var _config3 = _interopRequireDefault(_config2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var HISTORY_FETCH = exports.HISTORY_FETCH = 'HISTORY_FETCH';
var HISTORY_FETCH_DONE = exports.HISTORY_FETCH_DONE = 'HISTORY_FETCH_DONE';
var HISTORY_SKIP = exports.HISTORY_SKIP = 'HISTORY_SKIP';
var USERS_FETCH = exports.USERS_FETCH = 'USERS_FETCH';
var USERS_FETCH_DONE = exports.USERS_FETCH_DONE = 'USERS_FETCH_DONE';

var restUrl = _config3.default.isProduction ? '' : '//127.0.0.1:42042';

var historyFetchDone = function historyFetchDone(id, json) {return {
        type: HISTORY_FETCH_DONE,
        id: id,
        data: json || [] };};


var historyFetch = exports.historyFetch = function historyFetch(id) {var skip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;return function (dispatch) {return (
            (0, _isomorphicFetch2.default)(restUrl + '/api/historyGet?id=' + id + '&skip=' + skip, {
                method: 'POST',
                body: (0, _stringify2.default)({ id: id, skip: skip }) })

            // Do not use catch, because that will also catch
            // any errors in the dispatch and resulting render,
            // causing an loop of 'Unexpected batch number' errors.
            // https://github.com/facebook/react/issues/6895
            .then(function (response) {return response.json();}, function (error) {return console.log('An error occured.', error);}).
            then(function (json) {return dispatch(historyFetchDone(id, json));}));};};

var historySkipAction = exports.historySkipAction = function historySkipAction(skip) {return {
        type: HISTORY_SKIP,
        skip: skip };};


var usersFetchDone = function usersFetchDone(json) {return {
        type: USERS_FETCH_DONE,
        data: json || {} };};


var usersFetch = exports.usersFetch = function usersFetch() {return function (dispatch) {return (
            (0, _isomorphicFetch2.default)(restUrl + '/api/users', {
                method: 'POST' }).

            then(function (response) {return response.json();}, function (error) {return console.log('An error occured.', error);}).
            then(function (json) {return dispatch(usersFetchDone(json));}));};};