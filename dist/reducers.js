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
    command: _defineProperty({}, '84677480', ''),
    balance: _defineProperty({}, '84677480', {
        balance: _token3.default.balanceInit,
        period: ''
    })
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

    switch (action.type) {
        case _actions.BALANCE_INIT:
            {
                return Object.assign({}, state, _defineProperty({}, action.chatId, {
                    period: action.period,
                    balance: _token3.default.balanceInit
                }));
            }
        case _actions.BALANCE_CHANGE:
            var _balance2 = Object.keys(state).some(function (x) {
                return x == action.chatId;
            }) ? state[action.chatId].balance - action.sub : _token3.default.balanceInit - action.sub;
            return Object.assign({}, state, _defineProperty({}, action.chatId, {
                period: action.period,
                balance: _balance2
            }));
    }
    return state;
};

exports.default = function (state, action) {
    return {
        command: command(state.command, action),
        balance: balance(state.balance, action)
    };
};