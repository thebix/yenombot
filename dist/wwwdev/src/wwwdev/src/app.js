'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = undefined;var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _react = require('react');var _react2 = _interopRequireDefault(_react);
require('../css/index.scss');


var _history = require('./history.jsx');var _history2 = _interopRequireDefault(_history);

var _logger = require('../../logger');var _logger2 = _interopRequireDefault(_logger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // eslint-disable-next-line no-unused-vars
var
App = function (_Component) {(0, _inherits3.default)(App, _Component);function App() {(0, _classCallCheck3.default)(this, App);return (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).apply(this, arguments));}(0, _createClass3.default)(App, [{ key: 'render', value: function render()
        {
            _logger2.default.d('App render');
            return (
                _react2.default.createElement('div', null,

                    _react2.default.createElement('div', { id: 'content' },
                        _react2.default.createElement(_history2.default, null))));




        } }]);return App;}(_react.Component);exports.default = App;;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register(App, 'App', 'src/wwwdev/src/wwwdev/src/app.jsx');}();;