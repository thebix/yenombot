'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _token2 = require('./token');

var _token3 = _interopRequireDefault(_token2);

var _logger = require('./logger');

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var defaultState = {
    command: {},
    balance: {},
    balanceInit: {},
    paymentGroups: {},
    users: {}
};

var command = function command() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.command;
    var action = arguments[1];

    switch (action.type) {
        case _actions.BOT_CMD:
            return Object.assign({}, state, _defineProperty({}, action.chatId, action.command));
        case _actions.BOT_CMD_CLEAR:
            return Object.assign({}, state, _defineProperty({}, action.chatId, ''));
    }
    return state;
};

var balance = function balance() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.balance;
    var action = arguments[1];
    var balanceInit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : state.balanceInit;

    var initBalance = balanceInit ? balanceInit[action.chatId] || 0 : 0;
    switch (action.type) {
        case _actions.BALANCE_INIT:
            {
                return Object.assign({}, state, _defineProperty({}, action.chatId, {
                    period: action.period,
                    balance: initBalance
                }));
            }
        case _actions.BALANCE_CHANGE:
            var _balance = Object.keys(state).some(function (x) {
                return x == action.chatId;
            }) ? state[action.chatId].balance - action.sub : initBalance - action.sub;
            return Object.assign({}, state, _defineProperty({}, action.chatId, {
                period: action.period,
                balance: _balance
            }));
    }
    return state;
};

var paymentGroups = function paymentGroups() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.paymentGroups;
    var action = arguments[1];

    switch (action.type) {
        case _actions.INIT_BY_TOKEN:
            if (action.token && _token3.default.initData && _token3.default.initData[action.token] && _token3.default.initData[action.token].paymentGroups && _token3.default.initData[action.token].paymentGroups.length > 0) return Object.assign({}, state, _defineProperty({}, action.chatId, _token3.default.initData[action.token].paymentGroups));

    }
    return state;
};

var balanceInit = function balanceInit() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.balanceInit;
    var action = arguments[1];

    switch (action.type) {
        case _actions.INIT_BY_TOKEN:
            if (action.token && _token3.default.initData && _token3.default.initData[action.token] && _token3.default.initData[action.token].balanceInit) return Object.assign({}, state, _defineProperty({}, action.chatId, _token3.default.initData[action.token].balanceInit));

    }
    return state;
};

var users = function users() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.users;
    var action = arguments[1];

    switch (action.type) {
        case _actions.USER_ADD:
            return Object.assign({}, state, _defineProperty({}, action.id, {
                firstName: action.firstName,
                lastName: action.lastName,
                username: action.username,
                id: action.id
            }));
    }
    return state;
};

exports.default = function (state, action) {
    return {
        command: command(state.command, action),
        balance: balance(state.balance, action, state.balanceInit),
        paymentGroups: paymentGroups(state.paymentGroups, action),
        balanceInit: balanceInit(state.balanceInit, action),
        users: users(state.users, action)
    };
};