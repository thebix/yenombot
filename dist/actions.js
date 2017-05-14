'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.userAdd = exports.jsonSave = exports.jsonRead = exports.fileSave = exports.fileRead = exports.balanceChange = exports.balanceInit = exports.initByToken = exports.setBotBalanceMessageId = exports.botCmdClear = exports.botCmd = exports.USER_ADD = exports.FS_JSON_WRITE_DONE = exports.FS_JSON_WRITE = exports.FS_JSON_READ_DONE = exports.FS_JSON_READ = exports.FS_FILE_WRITE_DONE = exports.FS_FILE_WRITE = exports.FS_FILE_READ_DONE = exports.FS_FILE_READ = exports.BALANCE_CHANGE = exports.BALANCE_INIT = exports.INIT_BY_TOKEN = exports.BOT_BALANCE_MESSAGE_ID = exports.BOT_CMD_CLEAR = exports.BOT_CMD = undefined;

var _filesystem = require('./lib/filesystem');

var _filesystem2 = _interopRequireDefault(_filesystem);

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BOT_CMD = exports.BOT_CMD = 'BOT_CMD';
var BOT_CMD_CLEAR = exports.BOT_CMD_CLEAR = 'BOT_CMD_CLEAR';
var BOT_BALANCE_MESSAGE_ID = exports.BOT_BALANCE_MESSAGE_ID = 'BOT_BALANCE_MESSAGE_ID';

var INIT_BY_TOKEN = exports.INIT_BY_TOKEN = 'INIT_BY_TOKEN';

var BALANCE_INIT = exports.BALANCE_INIT = 'BALANCE_INIT';
var BALANCE_CHANGE = exports.BALANCE_CHANGE = 'BALANCE_CHANGE';

var FS_FILE_READ = exports.FS_FILE_READ = 'FS_FILE_READ';
var FS_FILE_READ_DONE = exports.FS_FILE_READ_DONE = 'FS_FILE_READ_DONE';
var FS_FILE_WRITE = exports.FS_FILE_WRITE = 'FS_FILE_WRITE';
var FS_FILE_WRITE_DONE = exports.FS_FILE_WRITE_DONE = 'FS_FILE_WRITE_DONE';
var FS_JSON_READ = exports.FS_JSON_READ = 'FS_JSON_READ';
var FS_JSON_READ_DONE = exports.FS_JSON_READ_DONE = 'FS_JSON_READ_DONE';
var FS_JSON_WRITE = exports.FS_JSON_WRITE = 'FS_JSON_WRITE';
var FS_JSON_WRITE_DONE = exports.FS_JSON_WRITE_DONE = 'FS_JSON_WRITE_DONE';

var USER_ADD = exports.USER_ADD = 'USER_ADD';

var botCmd = exports.botCmd = function botCmd(chatId, command) {
    var pars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    return {
        type: BOT_CMD,
        chatId: chatId,
        command: command,
        pars: pars
    };
};

var botCmdClear = exports.botCmdClear = function botCmdClear(chatId) {
    return {
        type: BOT_CMD_CLEAR,
        chatId: chatId
    };
};

var setBotBalanceMessageId = exports.setBotBalanceMessageId = function setBotBalanceMessageId(chatId, messageId) {
    return {
        type: BOT_BALANCE_MESSAGE_ID,
        messageId: messageId,
        chatId: chatId
    };
};

var initByToken = exports.initByToken = function initByToken(chatId, token) {
    return {
        type: INIT_BY_TOKEN,
        chatId: chatId,
        token: token
    };
};

var balanceInit = exports.balanceInit = function balanceInit(chatId, period) {
    return {
        type: BALANCE_INIT,
        chatId: chatId,
        period: period
    };
};

var balanceChange = exports.balanceChange = function balanceChange(chatId, period, sub) {
    return {
        type: BALANCE_CHANGE,
        chatId: chatId,
        period: period,
        sub: sub

    };
};

var fileReadRequest = function fileReadRequest(file) {
    return {
        type: FS_FILE_READ
    };
};

var fileReadDone = function fileReadDone(file, data) {
    return {
        type: FS_FILE_READ_DONE,
        file: file,
        data: data
    };
};

var fileRead = exports.fileRead = function fileRead(file) {
    return function (dispatch) {
        dispatch(fileReadRequest(file));
        return _filesystem2.default.getFile(file).then(function (data) {
            return dispatch(fileReadDone(file, data));
        }).catch(function (err) {
            //TODO: обработка ошибки
        });
    };
};

var fileSaveRequest = function fileSaveRequest(file, data) {
    return {
        type: FS_FILE_WRITE,
        file: file,
        data: data
    };
};

var fileSaveDone = function fileSaveDone(file) {
    return {
        type: FS_FILE_WRITE_DONE,
        file: file
    };
};

var fileSave = exports.fileSave = function fileSave(file, data, type) {
    return function (dispatch) {
        dispatch(fileSaveRequest(file, data));
        return _filesystem2.default.saveFile(file, data).then(function (data) {
            return dispatch(fileSaveDone(file));
        }).catch(function (err) {
            //TODO: обработка ошибки
        });
    };
};

var jsonReadRequest = function jsonReadRequest(file, id) {
    return {
        type: FS_JSON_READ
    };
};

var jsonReadDone = function jsonReadDone(file, id, data) {
    return {
        type: FS_JSON_READ_DONE,
        id: id,
        file: file,
        data: data
    };
};

var jsonRead = exports.jsonRead = function jsonRead(file, id) {
    return function (dispatch) {
        dispatch(jsonReadRequest(file, id));
        return _filesystem2.default.getJson(file).then(function (data) {
            return dispatch(jsonReadDone(file, id, data));
        }).catch(function (err) {
            //TODO: обработка ошибки
        });
    };
};

var jsonSaveRequest = function jsonSaveRequest(file, data) {
    return {
        type: FS_JSON_WRITE,
        file: file,
        data: data
    };
};

var jsonSaveDone = function jsonSaveDone(file) {
    return {
        type: FS_JSON_WRITE_DONE,
        file: file
    };
};

var jsonSave = exports.jsonSave = function jsonSave(file, data) {
    return function (dispatch) {
        dispatch(jsonSaveRequest(file, data));
        return _filesystem2.default.saveJson(file, data).then(function (data) {
            return dispatch(jsonSaveDone(file));
        }).catch(function (err) {
            //TODO: обработка ошибки
        });
    };
};

var userAdd = exports.userAdd = function userAdd(_ref) {
    var id = _ref.id,
        firstName = _ref.firstName,
        lastName = _ref.lastName,
        username = _ref.username;

    return {
        type: USER_ADD,
        id: id,
        firstName: firstName,
        lastName: lastName,
        username: username
    };
};