'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _react = require('react');var _react2 = _interopRequireDefault(_react);
var _classnames = require('classnames');var _classnames2 = _interopRequireDefault(_classnames);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.default =

function (_ref) {var placeholder = _ref.placeholder,value = _ref.value,_onChange = _ref.onChange,onBlur = _ref.onBlur,_ref$classes = _ref.classes,classes = _ref$classes === undefined ? [] : _ref$classes;return (
        _react2.default.createElement('input', { value: value,
            onBlur: onBlur,
            placeholder: placeholder,
            className: (0, _classnames2.default)('input', classes),
            onChange: function onChange(event) {return _onChange(event.target.value);} }));};