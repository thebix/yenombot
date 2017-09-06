'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _react = require('react');var _react2 = _interopRequireDefault(_react);
var _reactRedux = require('react-redux');
var _classnames = require('classnames');var _classnames2 = _interopRequireDefault(_classnames);

require('../css/history.scss');

var _actions = require('./actions');




var _time = require('../../../../lib/lib/time');var _time2 = _interopRequireDefault(_time);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // INFO: bad reference

var timeLib = new _time2.default();exports.default =

(0, _reactRedux.connect)(function (state) {return {
        historyData: state.historyData,
        historyId: state.historyId,
        users: state.users,
        historySkip: state.historySkip };})(function (_Component) {(0, _inherits3.default)(History, _Component);function History() {(0, _classCallCheck3.default)(this, History);return (0, _possibleConstructorReturn3.default)(this, (History.__proto__ || (0, _getPrototypeOf2.default)(History)).apply(this, arguments));}(0, _createClass3.default)(History, [{ key: 'componentDidMount', value: function componentDidMount()

        {var _props =
            this.props,dispatch = _props.dispatch,historyId = _props.historyId;
            dispatch((0, _actions.usersFetch)());
            dispatch((0, _actions.historyFetch)(historyId));
        } }, { key: 'componentDidUpdate', value: function componentDidUpdate(
        prevProps) {var _props2 =
            this.props,dispatch = _props2.dispatch,historyId = _props2.historyId,historySkip = _props2.historySkip;
            if (prevProps.historySkip !== historySkip) {
                dispatch((0, _actions.usersFetch)());
                dispatch((0, _actions.historyFetch)(historyId, historySkip));
            }
        } }, { key: 'render', value: function render()
        {var _props3 =
            this.props,historyData = _props3.historyData,users = _props3.users,dispatch = _props3.dispatch,historySkip = _props3.historySkip;
            var itemsWithTitles = [];
            for (var i = 0; i < historyData.length; i += 1) {
                if (i === 0 ||
                timeLib.getStartDate(new Date(historyData[i - 1].date_create)).getTime() !==
                timeLib.getStartDate(new Date(historyData[i].date_create)).getTime())
                itemsWithTitles.push({
                    id: i + 100500, // TODO: normal keys for titles
                    date_create: historyData[i].date_create
                    // category: timeLib.dateString(new Date(historyData[i].date_create))
                });
                itemsWithTitles.push(historyData[i]);
            }

            var historyRows = itemsWithTitles.map(function (item) {
                var user = '';
                if (users && users[item.user_id])
                user = users[item.user_id].firstName + ' ' + users[item.user_id].lastName;
                return _react2.default.createElement(Row, { key: item.id, item: item,
                    user: user });
            });
            return (
                _react2.default.createElement('div', { className: 'table-history' },
                    _react2.default.createElement('div', { className: 'table-header' },
                        _react2.default.createElement('div', { className: 'table-header-cell' },
                            _react2.default.createElement('input', { type: 'button', value: '<<', onClick: function onClick() {
                                    dispatch((0, _actions.historySkipAction)(-1));
                                } }),

                            _react2.default.createElement('input', { type: 'button', value: '<< 50', onClick: function onClick() {
                                    var skip = historySkip !== -1 ? historySkip + 50 : -1;
                                    dispatch((0, _actions.historySkipAction)(skip));
                                } }),

                            _react2.default.createElement('input', { type: 'button', value: '50 >>', onClick: function onClick() {
                                    var skip = historySkip && historySkip > 50 !== -1 ? historySkip - 50 : 0;
                                    dispatch((0, _actions.historySkipAction)(skip));
                                } }),

                            _react2.default.createElement('input', { type: 'button', value: '>>', onClick: function onClick() {
                                    dispatch((0, _actions.historySkipAction)(0));
                                } }))),



                    _react2.default.createElement('div', { className: 'table-content' },
                        historyRows)));



        } }]);return History;}(_react.Component));


var Row = function Row(_ref) {var item = _ref.item,user = _ref.user;
    if (!user) {
        return _react2.default.createElement('div', { className: 'table-row-title' },
            timeLib.dateString(new Date(item.date_create)));
    }
    return (
        _react2.default.createElement('div', { className: (0, _classnames2.default)('table-row', {
                    'table-row-deleted': !!item.date_delete }) },

            _react2.default.createElement('div', { className: 'table-cell', style: { color: 'grey' } },
                item.id),

            _react2.default.createElement('div', { className: 'table-cell', style: { paddingLeft: '7px' } },
                timeLib.dateTimeString(new Date(item.date_create))),

            _react2.default.createElement('div', { className: (0, _classnames2.default)('table-cell', {
                        warning: item.category === 'uncat' && !item.date_delete }),
                    style: { paddingLeft: '7px', width: '130px' } },
                item.category),

            _react2.default.createElement('div', { className: 'table-cell', style: { width: '65px' } },
                item.value),

            _react2.default.createElement('div', { className: 'table-cell', style: { width: '150px' } },
                user),

            _react2.default.createElement('div', { className: 'table-cell' },
                item.comment)));


};