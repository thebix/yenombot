'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _react = require('react');var _react2 = _interopRequireDefault(_react);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _default =

function _default(_ref) {var items = _ref.items,selected = _ref.selected,_ref$onChange = _ref.onChange,_onChange = _ref$onChange === undefined ? function () {} : _ref$onChange;return (
        _react2.default.createElement('select', { defaultValue: selected,
                onChange: function onChange(event) {return _onChange(event.target.value);} },
            items.map(function (item) {return (
                    _react2.default.createElement('option', {
                            value: item,
                            key: item }, item));})));};exports.default = _default;;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register(_default, 'default', 'src/wwwdev/src/wwwdev/src/components/Select.jsx');}();;