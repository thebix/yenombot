'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _fs = require('./lib/fs');
var _time = require('./lib/time');var _time2 = _interopRequireDefault(_time);
var _wwwServer = require('./lib/www-server');var _wwwServer2 = _interopRequireDefault(_wwwServer);
var _config = require('./config');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var fs = new _fs.RxFileSystem();
var time = new _time2.default();
var www = _config2.default && _config2.default.http ?
new _wwwServer2.default(_config2.default.http.port, _config2.default.http.wwwroot) :
_wwwServer2.default.createEmpty();exports.default =

{
    fs: fs,
    time: time,
    www: www };