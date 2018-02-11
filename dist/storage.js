'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.archiveName = undefined;var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}(); // in memory sotrage.

var _rxjs = require('rxjs');
var _root = require('./lib/root');var _root2 = _interopRequireDefault(_root);
var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _logger = require('./logger');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

var archiveName = exports.archiveName = 'storage_archive';

var compositeSubscription = new _rxjs.Subscription();var

Storage = function () {
    function Storage() {var _this = this;_classCallCheck(this, Storage);
        this.storage = {};
        this.isFsLoadedBehaviorSubject = new _rxjs.BehaviorSubject(false);
        compositeSubscription.add(
        // load saved storage from fs
        // check if directory and file exists, if not - create
        _root2.default.fs.isExists(_config2.default.dirStorage).
        switchMap(function (isStorageDirExists) {
            if (isStorageDirExists !== true) {
                (0, _logger.log)('Storage:constructor: storage directory doesn\'t exists, creating. path: <' + _config2.default.dirStorage + '>', _logger.logLevel.INFO);
                return _root2.default.fs.mkDir(_config2.default.dirStorage).
                switchMap(function () {return _root2.default.fs.isExists(_config2.default.fileState);}).
                catch(function (error) {
                    throw new Error('Storage:constructor: can\'t create storage directory. path: <' + _config2.default.dirStorage + '>. error: <' + error + '>'); // eslint-disable-line max-len
                });
            }
            return _root2.default.fs.isExists(_config2.default.fileState);
        }).
        switchMap(function (isStateFileExists) {
            if (isStateFileExists !== true) {
                (0, _logger.log)('Storage:constructor: state file doesn\'t exists, creating. path: <' + _config2.default.fileState + '>', _logger.logLevel.INFO);
                return _root2.default.fs.saveJson(_config2.default.fileState, {}).
                map(function () {return true;}).
                catch(function (error) {
                    throw new Error('Storage:constructor: can\'t create state file. path: <' + _config2.default.fileState + '>. error: <' + error + '>');
                });
            }
            return _rxjs.Observable.of(true);
        }).
        switchMap(function (isStorageDirAndStateFileExists) {
            if (isStorageDirAndStateFileExists)
            return _root2.default.fs.readJson(_config2.default.fileState).
            do(function (fileStorage) {
                _this.storage = fileStorage;
            }).
            map(function () {return true;}).
            catch(function (error) {
                throw new Error('Storage:constructor: can\'t read state file. path: <' + _config2.default.fileState + '>. error: <' + error + '>');
            });
            return _rxjs.Observable.of(false);
        }).
        subscribe(
        function (initResult) {
            _this.isFsLoadedBehaviorSubject.next(initResult);
            compositeSubscription.unsubscribe();
        },
        function (initError) {
            (0, _logger.log)(initError, _logger.logLevel.ERROR);
            compositeSubscription.unsubscribe();
        }));

    }_createClass(Storage, [{ key: 'isInitialized', value: function isInitialized()
        {
            return this.isFsLoadedBehaviorSubject.asObservable();
        } }, { key: 'getStorageKeys', value: function getStorageKeys()
        {
            return _rxjs.Observable.of(Object.keys(this.storage));
        } }, { key: 'getItem', value: function getItem(
        id, field) {
            if (!this.storage[id] || !this.storage[id][field])
            return _rxjs.Observable.of(null);
            return _rxjs.Observable.of(this.storage[id][field]);
        } }, { key: 'getItems', value: function getItems(
        id) {var _this2 = this;var fieldsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            var result = {};
            fieldsArray.forEach(function (field) {
                result[field] = _this2.storage[id] && _this2.storage[id][field] ?
                _this2.storage[id][field] : null;
            });
            return _rxjs.Observable.of(result);
        } }, { key: 'updateItem', value: function updateItem(
        id, fieldName, item) {var _this3 = this;
            var field = fieldName || '0';
            if (!this.storage[id])
            this.storage[id] = {};
            this.storage[id][field] = item;
            var oldValue = Object.assign({}, this.storage[id][field]);
            return _root2.default.fs.saveJson(_config2.default.fileState, this.storage).
            map(function () {return true;}).
            catch(function (error) {
                (0, _logger.log)('Storage:updateItem: can\'t save to state file. path: <' + _config2.default.fileState + '>, error:<' + error + '>', _logger.logLevel.ERROR);
                // rollback changes to fs storage to previous values on error
                _this3.storage[id][field] = oldValue;
                return _rxjs.Observable.of(false);
            });
        }
        // itemsArray = [{fieldName, item}]
    }, { key: 'updateItems', value: function updateItems(id) {var _this4 = this;var itemsArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
            if (!this.storage[id])
            this.storage[id] = {};
            var oldValues = {};
            itemsArray.forEach(function (itemToSave) {var
                fieldName = itemToSave.fieldName,item = itemToSave.item;
                var field = fieldName || '0';
                oldValues[field] = Object.assign({}, _this4.storage[id][field]);
                _this4.storage[id][field] = item;
            });
            return _root2.default.fs.saveJson(_config2.default.fileState, this.storage).
            map(function () {return true;}).
            catch(function (error) {
                (0, _logger.log)('Storage:updateItems: can\'t save to state file. path: <' + _config2.default.fileState + '>, error:<' + error + '>', _logger.logLevel.ERROR);
                // rollback changes to fs storage to previous values on error
                itemsArray.forEach(function (itemToSave) {var
                    fieldName = itemToSave.fieldName;
                    var field = fieldName || '0';
                    _this4.storage[id][field] = oldValues[field];
                });
                return _rxjs.Observable.of(false);
            });
        } }, { key: 'removeItem', value: function removeItem(
        id, fieldName) {var _this5 = this;
            var field = fieldName || '0';
            if (this.storage[id]) {
                var oldValue = Object.assign({}, this.storage[id][field]);
                delete this.storage[id][field];
                return _root2.default.fs.saveJson(_config2.default.fileState, this.storage).
                map(function () {return true;}).
                catch(function (error) {
                    (0, _logger.log)('Storage:removeItem: can\'t save to state file. path: <' + _config2.default.fileState + '>, error:<' + error + '>', _logger.logLevel.ERROR);
                    // rollback changes to fs storage to previous values on error
                    _this5.storage[id][field] = oldValue;
                    return _rxjs.Observable.of(false);
                });
            }
            return _rxjs.Observable.of(true);
        } }, { key: 'archive', value: function archive(
        id) {var _this6 = this;
            var archive = this.storage[archiveName] || {};
            if (id !== archiveName && this.storage[id]) {
                archive[id] = this.storage[id];
                this.storage[archiveName] = archive;
                delete this.storage[id];
                return _root2.default.fs.saveJson(_config2.default.fileState, this.storage).
                map(function () {return true;}).
                catch(function (error) {
                    (0, _logger.log)('Storage:archive: can\'t save to state file. path: <' + _config2.default.fileState + '>, error:<' + error + '>', _logger.logLevel.ERROR);
                    // rollback changes to fs storage to previous values on error
                    _this6.storage[id] = archive[id];
                    delete _this6.storage[archiveName][id];
                    return _rxjs.Observable.of(false);
                });
            }
            return _rxjs.Observable.of(true);
        } }]);return Storage;}();


var storage = new Storage();exports.default =

storage;