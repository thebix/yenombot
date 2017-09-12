'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.CheckBoxStatefull = exports.CheckBoxStateless = undefined;var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _react = require('react');var _react2 = _interopRequireDefault(_react);
var _propTypes = require('prop-types');var _propTypes2 = _interopRequireDefault(_propTypes);
var _classnames = require('classnames');var _classnames2 = _interopRequireDefault(_classnames);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var CheckBoxStateless = exports.CheckBoxStateless = function CheckBoxStateless(_ref) {var checked = _ref.checked,onClick = _ref.onClick,title = _ref.title,classes = _ref.classes;
    var checkbox = _react2.default.createElement('input', { className: (0, _classnames2.default)(classes), type: 'checkbox', checked: checked ? 'checked' : '', onChange: function onChange() {return onClick();} });
    if (title)
    checkbox = _react2.default.createElement('span', { className: (0, _classnames2.default)('check', classes) }, checkbox, title);
    return checkbox;
};var
CheckBoxStatefull = exports.CheckBoxStatefull = function (_Component) {(0, _inherits3.default)(CheckBoxStatefull, _Component);
    function CheckBoxStatefull(props) {(0, _classCallCheck3.default)(this, CheckBoxStatefull);var _this = (0, _possibleConstructorReturn3.default)(this, (CheckBoxStatefull.__proto__ || (0, _getPrototypeOf2.default)(CheckBoxStatefull)).call(this,
        props));var
        checked = props.checked;
        _this.state = { checked: !!checked };
        _this.onClick = _this.onClick.bind(_this);return _this;
    }(0, _createClass3.default)(CheckBoxStatefull, [{ key: 'onClick', value: function onClick()
        {var
            stateUpdate = this.props.stateUpdate;var
            checked = this.state.checked;
            if (typeof stateUpdate === 'function') stateUpdate(!checked);
            this.setState({ checked: !checked });
        } }, { key: 'render', value: function render()
        {var _props =
            this.props,title = _props.title,classes = _props.classes;var
            checked = this.state.checked;
            return _react2.default.createElement(CheckBoxStateless, {
                checked: checked,
                classes: classes,
                onClick: this.onClick,
                title: title });
        } }]);return CheckBoxStatefull;}(_react.Component);


// https://github.com/facebook/prop-types#prop-types
CheckBoxStatefull.propTypes = {
    optionalFunc: _propTypes2.default.func,
    optionalString: _propTypes2.default.string };