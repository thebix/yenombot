'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _actions = require('./actions');





var defaultState = {
    historyId: null,
    historyData: [],
    historyOrder: [],
    historySkip: 0,
    users: {}


    // TODO: chat selector
};var historyId = function historyId() {return -211718771;};

var historyData = function historyData() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyData;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_FETCH_DONE:
            return action.data;
        default:}

    return state;
};

var historyOrder = function historyOrder() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyOrder;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_FETCH_DONE:
            return action.data.map(function (item) {return item.id;});
        default:}

    return state;
};

var users = function users() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.users;var action = arguments[1];
    switch (action.type) {
        case _actions.USERS_FETCH_DONE:
            return action.data;
        default:}

    return state;
};

var historySkip = function historySkip() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historySkip;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_SKIP:
            return action.skip;
        default:}

    return state;
};exports.default =

function () {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;var action = arguments[1];return {
        historyId: historyId(state.historyId, action),
        historyData: historyData(state.historyData, action),
        historyOrder: historyOrder(state.historyOrder, action),
        historySkip: historySkip(state.historySkip, action),
        users: users(state.users, action) };};