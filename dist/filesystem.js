'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _jsonfile = require('jsonfile');

var _jsonfile2 = _interopRequireDefault(_jsonfile);

var _logger = require('./logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSystem = function () {
    function FileSystem() {
        _classCallCheck(this, FileSystem);
    }

    _createClass(FileSystem, null, [{
        key: 'getFile',
        value: function getFile(file) {
            return new Promise(function (resolve, reject) {
                _fs2.default.readFile(file, function (err, data) {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
        }
    }, {
        key: 'saveFile',
        value: function saveFile(file, data) {
            return new Promise(function (resolve, reject) {
                _fs2.default.writeFile(file, data, function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
    }, {
        key: 'appendFile',
        value: function appendFile(file, data) {
            return new Promise(function (resolve, reject) {
                _fs2.default.appendFile(file, data, function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
    }, {
        key: 'readJson',
        value: function readJson(file) {
            return new Promise(function (resolve, reject) {
                _jsonfile2.default.readFile(file, function (err, data) {
                    if (err) return reject(err);
                    resolve(data);
                });
            });
        }
    }, {
        key: 'saveJson',
        value: function saveJson(file, data) {
            return new Promise(function (resolve, reject) {
                _jsonfile2.default.writeFile(file, data, function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }
    }]);

    return FileSystem;
}();

FileSystem.isFileExists = function (path) {
    var isMakeIfNot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var isLogErrIfNot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

    if (!_fs2.default.existsSync(path)) {
        if (isLogErrIfNot) {
            (0, _logger.log)('\u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F \u0438\u043B\u0438 \u0444\u0430\u0439\u043B \u0441 \u043F\u0443\u0442\u0435\u043C \'' + path + '\' \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442. ' + (isMakeIfNot ? 'Создаем' : 'Не создаем'), logLevel.ERROR);
        }
        if (!isMakeIfNot) {
            return false;
        }
        _fs2.default.writeFileSync(path, data);
    }
    return true;
};

FileSystem.isDirExists = function (path) {
    var isMakeIfNot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var isLogErrIfNot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (!_fs2.default.existsSync(path)) {
        if (isLogErrIfNot) {
            (0, _logger.log)('\u0414\u0438\u0440\u0435\u043A\u0442\u043E\u0440\u0438\u044F \u0438\u043B\u0438 \u0444\u0430\u0439\u043B \u0441 \u043F\u0443\u0442\u0435\u043C \'' + path + '\' \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442. ' + (isMakeIfNot ? 'Создаем' : 'Не создаем'), logLevel.ERROR);
        }
        if (!isMakeIfNot) {
            return false;
        }
        _fs2.default.mkdirSync(path);
    }
    return true;
};

exports.default = FileSystem;