'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.timerTypes = undefined;var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _logger = require('../logger');function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

var timerTypes = exports.timerTypes = {
    NONE: 'NONE',
    MAIN: 'MAIN' };var


Timer = function () {
    function Timer(type, callback) {_classCallCheck(this, Timer);
        if (!type || type === timerTypes.NONE) {
            (0, _logger.log)('\u0412 \u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0442\u043E\u0440 \u0442\u0430\u0439\u043C\u0435\u0440\u0430 \u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u043D \u0442\u0438\u043F. timerTypes = ' + type, _logger.logLevel.ERROR);
            return;
        }
        if (!callback || typeof callback !== 'function') {
            (0, _logger.log)('В конструктор таймера не передана колбэк функция.', _logger.logLevel.ERROR);
            return;
        }
        this.type = type; // тип таймера
        this.timerId = null; // выключение таймера по id
        this.callback = callback; // функция "триггер таймера"
        this.onTrigger = this.onTrigger.bind(this); // функция "триггер по интервалу"
        this.onCheckDateTime = this.onCheckDateTime.bind(this); // функция "триггер по дате"
        this.start = this.start.bind(this); // функция "старт таймера"
        this.isStopped = true; // Состояние таймера - выключен
    }_createClass(Timer, [{ key: 'onCheckDateTime', value: function onCheckDateTime()
        {
            if (this.isStopped)
            return;
            var dt = new Date();
            if (!this.dateTime || dt < this.dateTime) {
                if (this.timerId)
                clearInterval(this.timerId);
                var interval = this.dateTime.getTime() - dt.getTime();
                if (interval < 2000) interval = 2000;
                this.timerId = setTimeout(this.onCheckDateTime, interval);
                this.isStopped = false;
                return;
            }
            this.isStopped = true;
            this.callback(this.type);
        } }, { key: 'onTrigger', value: function onTrigger()
        {
            if (this.isStopped)
            return;
            this.isStopped = true;
            this.callback(this.type);
        } }, { key: 'start', value: function start(_ref)
        {var interval = _ref.interval,dateTime = _ref.dateTime;
            if (interval) {
                this.isStopped = false;
                this.timerId = setTimeout(this.onTrigger, interval * 1000);
            } else if (dateTime) {
                this.dateTime = dateTime;
                this.isStopped = false;
                var intrvl = this.dateTime.getTime() - new Date().getTime();
                if (intrvl < 2000) intrvl = 2000;
                this.timerId = setTimeout(this.onCheckDateTime, intrvl);
            }
        } }, { key: 'stop', value: function stop()
        {
            this.isStopped = true;
            if (this.timerId)
            clearInterval(this.timerId);
        } }]);return Timer;}();exports.default = Timer;