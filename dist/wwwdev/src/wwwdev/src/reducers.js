'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _actions = require('./actions');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}
















var defaultState = {
    historyId: null,
    historyData: {
        data: [], meta: { length: 0 } },

    historyOrder: [],
    historySkip: 0,
    histroyCategories: [],
    historySelectedCategories: [],
    users: {},
    historySelectedUsers: [],
    historySelectedDates: { dateStart: null, dateEnd: null },
    historyEditId: null,
    historyEditUndo: {},
    historyUpdate: false


    // TODO: chat selector
};var historyId = function historyId() {return -211718771;};

var historyData = function historyData() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyData;var action = arguments[1];var
    data = action.data,meta = action.meta;
    switch (action.type) {
        case _actions.HISTORY_FETCH_DONE:
            return (0, _extends3.default)({}, state, { data: data, meta: meta });
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
};

var historyCategories = function historyCategories() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyCategories;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_CATEGORIES_FETCH_DONE:
            return action.data;
        default:}

    return state;
};

var historySelectedCategories = function historySelectedCategories() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historySelectedCategories;var action = arguments[1];
    var res = void 0;
    switch (action.type) {
        case _actions.HISTORY_CATEGORY_TOGGLE:
            {
                var index = state.indexOf(action.data);
                if (index !== -1)
                res = [].concat((0, _toConsumableArray3.default)(
                state.slice(0, index)), (0, _toConsumableArray3.default)(
                state.slice(index + 1)));else


                res = [].concat((0, _toConsumableArray3.default)(
                state.splice(0, index)), [
                action.data], (0, _toConsumableArray3.default)(
                state.splice(index + 1)));

            }
            return res;
        case _actions.HISTORY_CATEGORIES_SELECTED:
            if (Array.isArray(action.data))
            return action.data;
            break;
        default:}

    return state;
};

var historySelectedUsers = function historySelectedUsers() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historySelectedUsers;var action = arguments[1];
    var res = void 0;
    switch (action.type) {
        case _actions.HISTORY_USER_TOGGLE:
            {
                var index = state.indexOf(action.data);
                if (index !== -1)
                res = [].concat((0, _toConsumableArray3.default)(
                state.slice(0, index)), (0, _toConsumableArray3.default)(
                state.slice(index + 1)));else


                res = [].concat((0, _toConsumableArray3.default)(
                state.splice(0, index)), [
                action.data], (0, _toConsumableArray3.default)(
                state.splice(index + 1)));

            }
            return res;
        default:}

    return state;
};

var historySelectedDates = function historySelectedDates() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historySelectedDates;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_DATE_START:
            return (0, _extends3.default)({}, state, { dateStart: action.data });
        case _actions.HISTORY_DATE_END:
            return (0, _extends3.default)({}, state, { dateEnd: action.data });
        default:}

    return state;
};

var historyEditId = function historyEditId() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyEditId;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_EDIT_ON:
            return action.data;
        case _actions.HISTORY_EDIT_OFF:
            return null;
        default:}

    return state;
};

var historyEditUndo = function historyEditUndo() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyEditUndo;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_SAVE_UNDO:
            return {
                chatId: action.chatId,
                id: action.id,
                changes: action.changes };

        default:}

    return state;
};

var historyUpdate = function historyUpdate() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState.historyUpdate;var action = arguments[1];
    switch (action.type) {
        case _actions.HISTORY_UPDATE:
            return action.data;
        case _actions.HISTORY_SAVE_DONE:
            return true;
        case _actions.HISTORY_FETCH_DONE:
            return false;
        default:}

    return state;
};exports.default =

function () {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultState;var action = arguments[1];return {
        historyId: historyId(state.historyId, action),
        historyData: historyData(state.historyData, action),
        historyOrder: historyOrder(state.historyOrder, action),
        historySkip: historySkip(state.historySkip, action),
        users: users(state.users, action),
        historyCategories: historyCategories(state.historyCategories, action),
        historySelectedCategories: historySelectedCategories(state.historySelectedCategories, action),
        historySelectedUsers: historySelectedUsers(state.historySelectedUsers, action),
        historySelectedDates: historySelectedDates(state.historySelectedDates, action),
        historyEditId: historyEditId(state.historyEditId, action),
        historyEditUndo: historyEditUndo(state.historyEditUndo, action),
        historyUpdate: historyUpdate(state.historyUpdate, action) };};