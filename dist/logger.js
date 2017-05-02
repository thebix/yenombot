"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.l = exports.log = exports.getDateString = exports.logLevel = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _config2 = require("./config.js");

var _config3 = _interopRequireDefault(_config2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logLevel = exports.logLevel = {
    ERROR: "ERROR",
    INFO: "INFO ",
    DEBUG: "DEBUG"
};

var getDateString = exports.getDateString = function getDateString() {
    var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();

    var options = {
        year: '2-digit', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: 'numeric',
        hour12: false,
        weekday: "long"
    };
    return date.toLocaleDateString() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
};

var log = exports.log = function log(text) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : logLevel.DEBUG;

    if (!text) return;
    if (_config3.default.log == logLevel.DEBUG || _config3.default.log == logLevel.INFO && (level == logLevel.INFO || level == logLevel.ERROR) || _config3.default.log == logLevel.ERROR && level == logLevel.ERROR) {
        var t = getDateString() + " | " + level + " | " + text;
        console.log(t);
    }
};

var l = exports.l = function l(text) {
    var obj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "zero";

    if ((typeof text === "undefined" ? "undefined" : _typeof(text)) === 'object') {
        text = JSON.stringify(text);
    }
    if (obj !== "zero") {
        text = text + " = " + JSON.stringify(obj);
    }
    log(text, logLevel.DEBUG);
};