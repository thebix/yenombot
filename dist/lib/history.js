'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _logger = require('../logger');
var _filesystem = require('./filesystem');var _filesystem2 = _interopRequireDefault(_filesystem);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

History = function () {
    function History() {var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : './';var fileTemplate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'hist-$[id].json';_classCallCheck(this, History);
        this.path = path;
        if (this.path && this.path.length > 0 && this.path[this.path.length - 1] !== '/') {
            this.path = this.path + '/';
        }
        this.fileTemplate = fileTemplate;

        this.getById = this.getById.bind(this);
        this.setById = this.setById.bind(this);
        this.getAll = this.getAll.bind(this);

        this.getFilePath = this.getFilePath.bind(this);
    }_createClass(History, [{ key: 'create', value: function create(
        value) {var templateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            if (!value.id) throw new Error('Идентификатор обязателен для истории');
            if (!value.user_id) throw new Error('user_id обязателен для истории');
            if (!value.value) throw new Error('value обязателен для истории');
            if (!value.date_create) throw new Error('date_create обязателен для истории');
            var file = this.getFilePath(templateId);
            return this.getAll(templateId).
            then(function (data) {
                var all = data;
                if (!all || all.constructor !== Array)
                all = [];
                all.push(value);
                return _filesystem2.default.saveJson(file, all);
            }).
            catch(function (err) {return Promise.reject(err);});
        } }, { key: 'getById', value: function getById(
        id) {var templateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return this.getAll(templateId).
            then(function (data) {
                var all = data;
                if (!all || all.constructor !== Array)
                all = [];
                var res = all.filter(function (item) {return item.id === id;});
                if (res && res.length > 0) res = res[0];else
                res = null;
                return Promise.resolve(res);
            }).catch(function (err) {return Promise.reject(err);});
        } }, { key: 'setById', value: function setById(
        id, newValue) {var _this = this;var templateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            return this.getAll(templateId).
            then(function (data) {
                var all = data;
                if (!all || all.constructor !== Array)
                all = [];
                var item = all.filter(function (itm) {return itm.id === id;});
                if (item && item.length > 0) item = item[0];

                if (newValue.value !== undefined)
                item.value = newValue.value;
                if (newValue.category !== undefined)
                item.category = newValue.category;
                if (newValue.comment !== undefined)
                item.comment = newValue.comment;
                if (newValue.date_edit !== undefined)
                item.date_edit = newValue.date_edit;
                if (newValue.date_delete !== undefined)
                item.date_delete = newValue.date_delete;

                var file = _this.getFilePath(templateId);
                return _filesystem2.default.saveJson(file, all).
                then(function () {return Promise.resolve(item);});
            }).catch(function (err) {return Promise.reject(err);});
        } }, { key: 'getAll', value: function getAll()
        {var templateId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var path = this.getFilePath(templateId);

            if (_filesystem2.default.isDirExists(this.path, true) &&
            _filesystem2.default.isFileExists(path, true, null, '[]')) {
                return _filesystem2.default.readJson(path).
                then(function (data) {
                    var all = data;
                    if (!all || all.constructor !== Array) {
                        all = [];
                        (0, _logger.log)('\u0414\u043B\u044F \'' + templateId + '\' \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0444\u0430\u0439\u043B \'' + path + '\'', _logger.logLevel.ERROR);
                    }
                    return Promise.resolve(all.sort(function (i1, i2) {return i2.id - i1.id;}));
                }).
                catch(function (ex) {return Promise.reject('\u0414\u043B\u044F \'' + templateId + '\' \u043D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0444\u0430\u0439\u043B \'' + path + '\', ex = \'' + ex + '\'');});
            }
            return Promise.reject('Problem with file access');
        } }, { key: 'getFilePath', value: function getFilePath()
        {var templateId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var file = templateId ? '' +
            this.fileTemplate.replace('$[id]', templateId) :
            this.fileTemplate;
            return '' + this.path + file;
        } }]);return History;}();


// historyItem = {
//     'id': message.id,
//     'date_create': date,
//     'date_edit': date,
//     'date_delete': null,
//     'category': 'uncat',
//     'value': text,
//     'user_id': message.from,
//     'comment': ''
// }
// class HistoryItem {
//     constructor({ id, user_id, value, category = null, comment = null, date_create = null,
//                      date_edit = null, date_delete = null }) {
//         if (!id) throw 'Идентификатор обязателен для истории'
//         if (!user_id) throw 'user_id обязателен для истории'
//         if (!value) throw 'value обязателен для истории'
//         const currentDate = new Date()
//         this.id = id
//         this.user_id = user_id
//         this.value = value
//         this.category = category
//         this.comment = comment
//         this.date_create = date_create || currentDate
//         this.date_edit = date_edit || currentDate
//         this.date_delete = date_delete
//     }
//     update({ value, category, comment, date_edit, date_delete }) {
//         this.value = value || this.value
//         this.category = category || this.category
//         this.comment = comment || this.comment
//         this.date_edit = date_edit || this.date_edit
//         this.date_delete = date_delete || this.date_delete
//     }
// }
exports.default = History;