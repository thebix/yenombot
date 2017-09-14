'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.InputStatefull = undefined;var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _react = require('react');var _react2 = _interopRequireDefault(_react);
var _classnames = require('classnames');var _classnames2 = _interopRequireDefault(_classnames);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var Input = function Input(_ref) {var
    placeholder = _ref.placeholder,
    value = _ref.value,_ref$onBlur = _ref.
    onBlur,onBlur = _ref$onBlur === undefined ? function () {} : _ref$onBlur,_ref$onChange = _ref.
    onChange,_onChange = _ref$onChange === undefined ? function () {} : _ref$onChange,_ref$onKeyPress = _ref.
    onKeyPress,_onKeyPress = _ref$onKeyPress === undefined ? function () {} : _ref$onKeyPress,
    defaultValue = _ref.defaultValue,_ref$classes = _ref.
    classes,classes = _ref$classes === undefined ? [] : _ref$classes;return (

        _react2.default.createElement('input', { value: value,
            onBlur: onBlur,
            placeholder: placeholder,
            className: (0, _classnames2.default)('input', classes),
            onChange: function onChange(event) {return _onChange(event.target.value);},
            defaultValue: defaultValue,
            onKeyPress: function onKeyPress(event) {return _onKeyPress(event.charCode);} }));};exports.default =

Input;var

InputStatefull = exports.InputStatefull = function (_Component) {(0, _inherits3.default)(InputStatefull, _Component);
    function InputStatefull(props) {(0, _classCallCheck3.default)(this, InputStatefull);var _this = (0, _possibleConstructorReturn3.default)(this, (InputStatefull.__proto__ || (0, _getPrototypeOf2.default)(InputStatefull)).call(this,
        props));
        _this.state = { value: props.defaultValue };return _this;
    }(0, _createClass3.default)(InputStatefull, [{ key: 'render', value: function render()
        {var _this2 = this;var _props =





            this.props,placeholder = _props.placeholder,_props$onBlur = _props.onBlur,_onBlur = _props$onBlur === undefined ? function () {} : _props$onBlur,_props$onChange = _props.onChange,_onChange2 = _props$onChange === undefined ? function () {} : _props$onChange,_props$onKeyPress = _props.onKeyPress,_onKeyPress2 = _props$onKeyPress === undefined ? function () {} : _props$onKeyPress,classes = _props.classes,defaultValue = _props.defaultValue;var
            value = this.state.value;
            return _react2.default.createElement(Input, {
                defaultValue: defaultValue,
                onBlur: function onBlur() {return _onBlur(value);},
                placeholder: placeholder,
                classes: classes,
                onChange: function onChange(val) {
                    _onChange2(val);
                    _this2.setState({ value: val });
                },
                onKeyPress: function onKeyPress(char) {return _onKeyPress2(char, value);} });

        } }]);return InputStatefull;}(_react.Component);