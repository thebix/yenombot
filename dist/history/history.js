'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.HistoryItem = undefined;var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();











var _rxjs = require('rxjs');
var _logger = require('../logger');
var _config = require('../config');var _config2 = _interopRequireDefault(_config);
var _root = require('../lib/root');var _root2 = _interopRequireDefault(_root);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} // historyItem = {
//     'id': message.id,
//     'date_create': date,
//     'date_edit': date,
//     'date_delete': null,
//     'category': 'uncat',
//     'value': number,
//     'values': object,
//     'user_id': message.from,
//     'comment': ''
// }
var HistoryItem = exports.HistoryItem = function HistoryItem(id, userId, value, values)

{var category = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'uncat';var comment = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : '';var dateCreate = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : new Date();var dateEdit = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : new Date();var dateDelete = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : undefined;_classCallCheck(this, HistoryItem);
    this.id = id;
    this.user_id = userId;
    this.value = value;
    this.values = values;
    this.category = category;
    this.comment = comment;
    this.date_create = dateCreate;
    this.date_edit = dateEdit;
    this.date_delete = dateDelete;
};var


History = function () {
    function History() {_classCallCheck(this, History);
        this.path = _config2.default.dirStorage;
        this.fileTemplate = 'hist-$[id].json';
        this.getFilePath = this.getFilePath.bind(this);
    }_createClass(History, [{ key: 'add', value: function add(
        historyItem) {var templateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            if (!historyItem.id) throw new Error('Идентификатор обязателен для истории');
            if (!historyItem.user_id) throw new Error('user_id обязателен для истории');
            if (!historyItem.value) throw new Error('value обязателен для истории');
            if (!historyItem.values) throw new Error('values обязателен для истории');
            if (!historyItem.date_create) throw new Error('date_create обязателен для истории');
            var file = this.getFilePath(templateId);
            return _root2.default.fs.appendFile(file, JSON.stringify(historyItem) + ',').
            map(function (isAdded) {return isAdded !== false;}).
            catch(function (error) {
                (0, _logger.log)('history:add: error while add to file historyItem. templateId: <' + templateId + '>, error=' + error, _logger.logLevel.ERROR);
                return _rxjs.Observable.of(false);
            });
        } }, { key: 'get', value: function get(
        id) {var templateId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return this.getAll(templateId).
            map(function (allHistory) {
                var res = allHistory.filter(function (item) {return item.id === id;});
                return res && res.length > 0 ?
                res[0] :
                null;
            });
        }
        // returns updated item or false
    }, { key: 'update', value: function update(id, newValue) {var _this = this;var templateId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            return this.getAll(templateId)
            // eslint-disable-next-line complexity
            .flatMap(function (allHistory) {
                var updatedItem = void 0;
                var indexToEdit = -1;
                var i = 0;
                for (i; i < allHistory.length; i += 1) {
                    if (allHistory[i].id === id) {
                        indexToEdit = i;
                        updatedItem = allHistory[i];
                        if (newValue.date_create !== undefined)
                        updatedItem.date_create = newValue.date_create;
                        if (newValue.value !== undefined)
                        updatedItem.value = newValue.value;
                        if (newValue.values !== undefined)
                        updatedItem.values = newValue.values;
                        if (newValue.category !== undefined)
                        updatedItem.category = newValue.category;
                        if (newValue.comment !== undefined)
                        updatedItem.comment = newValue.comment;
                        if (newValue.date_edit !== undefined)
                        updatedItem.date_edit = newValue.date_edit;
                        if (newValue.date_delete !== undefined)
                        updatedItem.date_delete = newValue.date_delete;
                        break;
                    }
                }
                if (!updatedItem) {
                    (0, _logger.log)('History:setById: can\'t find historyItem by id:<' + id + '>, templateId:<' + templateId + '>. Adding as new.', _logger.logLevel.ERROR);
                    return _this.add(Object.assign({}, newValue, { id: id }), templateId);
                }
                var newHistory = [].concat(_toConsumableArray(allHistory.slice(0, indexToEdit)), [updatedItem], _toConsumableArray(allHistory.slice(indexToEdit + 1)));
                var file = _this.getFilePath(templateId);
                var newHistoryText = JSON.stringify(newHistory);
                return _root2.default.fs.saveFile(file, newHistoryText.slice(1, newHistoryText.length - 1) + ',').
                map(function () {return updatedItem;}).
                catch(function (error) {
                    (0, _logger.log)('history:update: error while update to file historyItem. id:<' +
                    id + '>, templateId: <' + templateId + '>, error=' + error,
                    _logger.logLevel.ERROR);

                    return _rxjs.Observable.of(false);
                });
            });
        } }, { key: 'getAll', value: function getAll()
        {var templateId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var historyFile = this.getFilePath(templateId);
            return _root2.default.fs.readFile(historyFile).
            map(function (historyFileContent) {
                var historyFileContentText = historyFileContent.toString().trim();
                if (historyFileContentText.length > 0)
                historyFileContentText = historyFileContentText.slice(0, -1);
                return JSON.parse('[' + historyFileContentText + ']');
            }).
            catch(function (error) {
                (0, _logger.log)('history:getAll: error while get from file historyItem. templateId: <' + templateId + '>, error=' + error, _logger.logLevel.ERROR);
                return _rxjs.Observable.of([]);
            });
        } }, { key: 'getFilePath', value: function getFilePath()
        {var templateId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var file = templateId ? '' +
            this.fileTemplate.replace('$[id]', templateId) :
            this.fileTemplate;
            return '' + this.path + file;
        } }]);return History;}();


var history = new History();exports.default =

history;