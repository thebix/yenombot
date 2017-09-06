'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.RESPONSE_STATUS = undefined;var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}(); // Source: https://stackoverflow.com/questions/6084360/using-node-js-as-a-simple-web-server

var _url = require('url');var _url2 = _interopRequireDefault(_url);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _Rx = require('rxjs/Rx');var _Rx2 = _interopRequireDefault(_Rx);

var _root = require('../root');var _root2 = _interopRequireDefault(_root);
var _httpServer = require('./http-server');var _httpServer2 = _interopRequireDefault(_httpServer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

var mimeTypes = {
    html: 'text/html',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    js: 'text/javascript',
    css: 'text/css' };


var RESPONSE_STATUS = exports.RESPONSE_STATUS = {
    HTTP_200: '200',
    HTTP_404: '404',
    CANT_CREATE_READ_STREAM: 'CANT_CREATE_READ_STREAM',
    API_CALL: 'API_CALL' };var


WwwServer = function () {
    function WwwServer() {var port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 80;var wwwroot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : './';var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'index.html';var api = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];_classCallCheck(this, WwwServer);
        this.httpServer = new _httpServer2.default(port);
        this.wwwroot = wwwroot;
        this.index = index;
        this.api = api;
    }_createClass(WwwServer, [{ key: 'response', get: function get()



        {var _this = this;
            return this.httpServer.requests.
            concatMap(function (data) {
                var uri = _url2.default.parse(data.request.url).pathname;
                var filename = _path2.default.join(process.cwd(), _this.wwwroot, uri !== '/' ? uri : _this.index);
                if (_this.api && _this.api.indexOf(uri) !== -1)
                return _Rx2.default.Observable.of({ data: data, filename: filename, isExists: false });
                return _root2.default.fs.accessRead(filename).
                map(function (isExists) {return Object.create({ data: data, filename: filename, isExists: isExists });});
            }).
            flatMap(function (file) {var
                isExists = file.isExists,data = file.data,filename = file.filename;
                var uri = _url2.default.parse(data.request.url).pathname;
                if (_this.api && _this.api.indexOf(uri) !== -1)
                return _Rx2.default.Observable.of({
                    data: data,
                    status: RESPONSE_STATUS.API_CALL });

                if (!isExists) {
                    console.log('not exists: ' + filename);
                    data.response.writeHead(404, { 'Content-Type': 'text/plain' });
                    data.response.end('404 Not Found');

                    return _Rx2.default.Observable.of({
                        data: data,
                        status: RESPONSE_STATUS.HTTP_404 });

                }

                var mimeType = mimeTypes[_path2.default.extname(filename).split('.')[1]];
                data.response.writeHead(200, { 'Content-Type': mimeType });

                return _root2.default.fs.createReadStream(filename).
                map(function (fileStream) {
                    fileStream.pipe(data.response);
                    return { data: data, status: RESPONSE_STATUS.HTTP_200 };
                })
                // INFO: not working
                .catch(function () {return Object.create({
                        data: data,
                        status: RESPONSE_STATUS.CANT_CREATE_READ_STREAM });});

            });
        }
        // TODO: builder pattern?
    }, { key: 'apiUrls', set: function set(apiUrls) {
            this.api = Array.isArray(apiUrls) ? apiUrls : [];
        } }, { key: 'wwwRootPath', set: function set(
        value) {
            this.wwwroot = value || './';
        } }, { key: 'indexPage', set: function set(
        page) {
            this.index = page || 'index.html';
        }
        // TODO: bad - already subscribed response() has old server
    }, { key: 'httpServerSet', set: function set(port) {
            this.httpServer = new _httpServer2.default(port);
        } }], [{ key: 'createEmpty', value: function createEmpty() {return new WwwServer(0);} }]);return WwwServer;}();exports.default = WwwServer;