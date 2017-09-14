'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _trim = require('babel-runtime/core-js/string/trim');var _trim2 = _interopRequireDefault(_trim);var _keys = require('babel-runtime/core-js/object/keys');var _keys2 = _interopRequireDefault(_keys);var _extends2 = require('babel-runtime/helpers/extends');var _extends3 = _interopRequireDefault(_extends2);var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = require('babel-runtime/helpers/inherits');var _inherits3 = _interopRequireDefault(_inherits2);var _react = require('react');var _react2 = _interopRequireDefault(_react);
var _reactRedux = require('react-redux');
var _classnames = require('classnames');var _classnames2 = _interopRequireDefault(_classnames);

var _CheckBox = require('./components/CheckBox.jsx');
var _Dynamic = require('./components/Dynamic.jsx');var _Dynamic2 = _interopRequireDefault(_Dynamic);
var _Input = require('./components/Input.jsx');var _Input2 = _interopRequireDefault(_Input);

require('../css/history.scss');

var _logger = require('../../logger');var _logger2 = _interopRequireDefault(_logger);
var _actions = require('./actions');










var _time = require('../../../../lib/lib/time');var _time2 = _interopRequireDefault(_time);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // INFO: bad reference

var HISTORY_PAGE_COUNT = 150;

var timeLib = new _time2.default();

var TableHeaderCell = function TableHeaderCell(_ref) {var children = _ref.children,_ref$classes = _ref.classes,classes = _ref$classes === undefined ? [] : _ref$classes;return _react2.default.createElement('div', { className: (0, _classnames2.default)('table-header-cell', classes) }, children);};

var checkDateInput = function checkDateInput(value) {
    var current = new Date();
    var backDate = timeLib.getBack(value);
    if (current.getTime() > backDate.getTime()) {
        return backDate;
    }
    return null;
};

var fetchHistory = function fetchHistory(_ref2)





{var dispatch = _ref2.dispatch,historyId = _ref2.historyId,historySkip = _ref2.historySkip,selectedCategories = _ref2.selectedCategories,selectedUsers = _ref2.selectedUsers,selectedDates = _ref2.selectedDates;
    _logger2.default.d('History:fetchHistory()');
    // TODO: move this request to other lyfecycle method
    dispatch((0, _actions.usersFetch)());var
    dateStart = selectedDates.dateStart,dateEnd = selectedDates.dateEnd;
    var start = checkDateInput(dateStart);
    var end = checkDateInput(dateEnd);

    if (end) {
        var currentDate = new Date();
        end = timeLib.isDateSame(currentDate, end) ?
        currentDate :
        timeLib.getChangedDateTime({ days: 1 }, end);
    }

    dispatch((0, _actions.historyFetch)(historyId, historySkip, selectedCategories, selectedUsers,
    start ? start.getTime() : null,
    end ? end.getTime() : null));
};exports.default =

(0, _reactRedux.connect)(function (state) {return {
        historyData: state.historyData,
        historyId: state.historyId,
        users: state.users,
        historySkip: state.historySkip,
        categories: state.historyCategories,
        selectedCategories: state.historySelectedCategories,
        selectedUsers: state.historySelectedUsers,
        selectedDates: state.historySelectedDates };})(function (_Component) {(0, _inherits3.default)(History, _Component);

    function History(props) {(0, _classCallCheck3.default)(this, History);var _this = (0, _possibleConstructorReturn3.default)(this, (History.__proto__ || (0, _getPrototypeOf2.default)(History)).call(this,
        props));var _this$props =
        _this.props,dispatch = _this$props.dispatch,historyId = _this$props.historyId;
        var date = new Date();
        dispatch((0, _actions.historyDateSet)(timeLib.dateString(new Date(date.setDate(1)))));
        dispatch((0, _actions.historyDateSet)(timeLib.dateString(), false));

        dispatch((0, _actions.usersFetch)());
        dispatch((0, _actions.historyFetch)(historyId));
        dispatch((0, _actions.categoriesFetch)(historyId));return _this;
    }(0, _createClass3.default)(History, [{ key: 'componentDidUpdate', value: function componentDidUpdate(
        prevProps) {
            // l.d('componentDidUpdate')
            var _props =




            this.props,historySkip = _props.historySkip,selectedCategories = _props.selectedCategories,selectedUsers = _props.selectedUsers,selectedDates = _props.selectedDates;
            if (prevProps.historySkip !== historySkip ||
            prevProps.selectedCategories !== selectedCategories ||
            prevProps.selectedUsers !== selectedUsers ||
            prevProps.selectedDates !== null && selectedDates !== null &&
            !prevProps.selectedDates.dateStart &&
            !prevProps.selectedDates.dateEnd &&
            selectedDates.dateStart &&
            selectedDates.dateEnd)
            {
                // l.d('and passed if')
                fetchHistory(this.props);
            }
        } }, { key: 'render', value: function render()
        {var _this2 = this;
            // l.d('History.render()')
            var _props2 =








            this.props,historyData = _props2.historyData,users = _props2.users,dispatch = _props2.dispatch,historySkip = _props2.historySkip,categories = _props2.categories,selectedCategories = _props2.selectedCategories,selectedUsers = _props2.selectedUsers,selectedDates = _props2.selectedDates;
            var itemsWithTitles = [];
            for (var i = 0; i < historyData.data.length; i += 1) {
                if (i === 0 ||
                timeLib.getStartDate(new Date(historyData.data[i - 1].date_create)).getTime() !==
                timeLib.getStartDate(new Date(historyData.data[i].date_create)).getTime())
                itemsWithTitles.push({
                    id: i + 100500, // TODO: normal keys for titles
                    date_create: historyData.data[i].date_create });

                itemsWithTitles.push(historyData.data[i]);
            }

            var historyRows = itemsWithTitles.map(function (item) {
                var user = '';
                if (users && users[item.user_id])
                user = users[item.user_id].firstName + ' ' + users[item.user_id].lastName;
                return _react2.default.createElement(Row, { key: item.id, item: item, user: user });
            });
            return (
                _react2.default.createElement('div', { className: 'table-history' },
                    _react2.default.createElement('div', { className: 'table-header' },
                        _react2.default.createElement('div', { className: 'table-header-row' },
                            _react2.default.createElement(Navigation, { props: this.props })),

                        _react2.default.createElement('div', { className: 'table-header-row table-header-filters' },
                            _react2.default.createElement(Categories, {
                                categories: categories,
                                dispatch: dispatch,
                                selected: selectedCategories }),
                            _react2.default.createElement(TableHeaderCell, { classes: ['padding-right-7'] },
                                _react2.default.createElement(Users, {
                                    users: users,
                                    dispatch: dispatch,
                                    selected: selectedUsers }),
                                _react2.default.createElement(Dates, {
                                    selected: selectedDates,
                                    dispatch: dispatch,
                                    doUpdate: function doUpdate() {return fetchHistory(_this2.props);} })))),



                    _react2.default.createElement('div', { className: 'table-content' },
                        historyRows)));



        } }]);return History;}(_react.Component));


var Navigation = function Navigation(_ref3) {var props = _ref3.props;
    // l.d('History.Navigation()')
    var selectedDates =



    props.selectedDates,_props$dispatch = props.dispatch,dispatch = _props$dispatch === undefined ? function () {} : _props$dispatch,_props$historySkip = props.historySkip,historySkip = _props$historySkip === undefined ? 0 : _props$historySkip,_props$historyData = props.historyData,historyData = _props$historyData === undefined ? { meta: { lengh: 0 }, data: [] } : _props$historyData;
    // const propsFixed = { ...props }
    var meta = historyData.meta,data = historyData.data;
    var historyLength = meta.length;

    var dtStart = checkDateInput(selectedDates ? selectedDates.dateStart : 'NONE');
    return _react2.default.createElement(TableHeaderCell, { classes: ['fixed'] },
        _react2.default.createElement('input', {
            type: 'button', value: '< 1 month',
            disabled: !dtStart || dtStart.getMonth() <= 4 &&
            dtStart.getFullYear() <= 2015,
            onClick: function onClick() {
                var start = checkDateInput(selectedDates.dateStart);
                if (start) {
                    start = timeLib.getMonthStartDate(
                    timeLib.getChangedDateTime({ months: -1 }, start));

                    var dateStart = timeLib.dateString(start);
                    dispatch((0, _actions.historyDateSet)(dateStart));
                    var dateEnd =
                    timeLib.dateString(timeLib.getMonthEndDate(start));
                    dispatch((0, _actions.historyDateSet)(dateEnd, false));
                    dispatch((0, _actions.historySkipAction)(0));
                    fetchHistory((0, _extends3.default)({},
                    props, {
                        historySkip: 0,
                        selectedDates: { dateStart: dateStart, dateEnd: dateEnd } }));

                }
            } }),
        _react2.default.createElement('input', { disabled: historySkip === -1 || historyLength <= data.length + historySkip,
            type: 'button', value: '<<',
            onClick: function onClick() {
                dispatch((0, _actions.historySkipAction)(-1));
            } }),
        _react2.default.createElement('input', { disabled: historySkip === -1 || historyLength <= data.length + historySkip,
            type: 'button',
            value: '<< ' + HISTORY_PAGE_COUNT, onClick: function onClick() {
                var skip = historySkip !== -1 ? historySkip + HISTORY_PAGE_COUNT : -1;
                dispatch((0, _actions.historySkipAction)(skip));
            } }),
        _react2.default.createElement('input', { disabled: historySkip === 0, type: 'button', value: HISTORY_PAGE_COUNT + ' >>', onClick: function onClick() {
                var skip = historySkip &&
                historySkip > HISTORY_PAGE_COUNT !== -1 ? historySkip - HISTORY_PAGE_COUNT : 0;
                dispatch((0, _actions.historySkipAction)(skip));
            } }),
        _react2.default.createElement('input', { disabled: historySkip === 0, type: 'button', value: '>>', onClick: function onClick() {
                dispatch((0, _actions.historySkipAction)(0));
            } }),
        _react2.default.createElement('input', {
            type: 'button', value: '1 month >',
            disabled: !dtStart || dtStart.getMonth() >= new Date().getMonth() &&
            dtStart.getFullYear() >= new Date().getFullYear(),
            onClick: function onClick() {
                var start = checkDateInput(selectedDates.dateStart);
                if (start) {
                    start = timeLib.getMonthStartDate(
                    timeLib.getChangedDateTime({ months: 1 }, start));
                    var current = new Date();
                    var end = current.getFullYear() === start.getFullYear() &&
                    current.getMonth() === start.getMonth() ?
                    current :
                    timeLib.getMonthEndDate(start);
                    start = timeLib.getMonthStartDate(start);
                    var dateStart = timeLib.dateString(start);
                    dispatch((0, _actions.historyDateSet)(dateStart));
                    var dateEnd = timeLib.dateString(end);
                    dispatch((0, _actions.historyDateSet)(dateEnd, false));
                    dispatch((0, _actions.historySkipAction)(0));
                    fetchHistory((0, _extends3.default)({},
                    props, {
                        historySkip: 0,
                        selectedDates: { dateStart: dateStart, dateEnd: dateEnd } }));

                }
            } }),
        _react2.default.createElement('input', {
            type: 'button', value: 'today',
            disabled: !dtStart || dtStart.getMonth() >= new Date().getMonth() &&
            dtStart.getFullYear() >= new Date().getFullYear(),
            onClick: function onClick() {
                var end = new Date();
                var start = timeLib.getMonthStartDate(end);
                var dateStart = timeLib.dateString(start);
                var dateEnd = timeLib.dateString(end);
                dispatch((0, _actions.historyDateSet)(dateStart));
                dispatch((0, _actions.historyDateSet)(dateEnd, false));
                dispatch((0, _actions.historySkipAction)(0));
                fetchHistory((0, _extends3.default)({},
                props, {
                    historySkip: 0,
                    selectedDates: { dateStart: dateStart, dateEnd: dateEnd } }));

            } }));

};

var Categories = function Categories(_ref4) {var categories = _ref4.categories,dispatch = _ref4.dispatch,selected = _ref4.selected;
    var cell0 = [],
    cell1 = void 0,
    cell2 = void 0;
    var categoryMapper = function categoryMapper(category) {return _react2.default.createElement('div', { key: category.id },
            _react2.default.createElement(_CheckBox.CheckBoxStateless, { key: category.id, title: category.title,
                checked: selected.indexOf(category.title) > -1,
                onClick: function onClick() {
                    dispatch((0, _actions.historySkipAction)(0));
                    dispatch((0, _actions.historyCategoryToggle)(category.title));
                } }));};

    if (categories && categories.length > 0) {
        cell0.push(_react2.default.createElement('span', { key: 3 },
            _react2.default.createElement(_CheckBox.CheckBoxStatefull, { stateUpdate: function stateUpdate(state) {
                    dispatch((0, _actions.historySkipAction)(0));
                    if (state) {
                        dispatch((0, _actions.historyCategoriesSelected)(categories.map(function (item) {return item.title;})));
                    } else {
                        dispatch((0, _actions.historyCategoriesSelected)());
                    }
                } }),
            _react2.default.createElement(_CheckBox.CheckBoxStatefull, { classes: ['margin-left-8'], title: 'uncat', stateUpdate: function stateUpdate() {
                    dispatch((0, _actions.historySkipAction)(0));
                    dispatch((0, _actions.historyCategoryToggle)('uncat'));
                } })));

        if (categories.length < 8) {
            cell0 = cell0.concat(categories.map(categoryMapper));
        } else {
            var cellLength = categories.length / 3;
            cell0 = cell0.concat(categories.slice(0, cellLength).map(categoryMapper));
            cell1 = categories.slice(cellLength, cellLength * 2).map(categoryMapper);
            cell2 = categories.slice(cellLength * 2).map(categoryMapper);
        }
    }
    return _react2.default.createElement('span', null, _react2.default.createElement(TableHeaderCell, { classes: ['padding-right-7'], key: 0 }, cell0),
        cell1 && _react2.default.createElement(TableHeaderCell, { classes: ['padding-right-7'], key: 1 }, cell1),
        cell2 && _react2.default.createElement(TableHeaderCell, { classes: ['padding-right-7'], key: 2 }, cell2));
};

var Users = function Users(_ref5) {var users = _ref5.users,dispatch = _ref5.dispatch,selected = _ref5.selected;
    if (!users) return null;
    var selUsers = Array.isArray(selected) ? selected : [];
    var usersIds = (0, _keys2.default)(users);
    return _react2.default.createElement('div', null,
        usersIds.map(function (id) {return _react2.default.createElement('div', { key: id }, _react2.default.createElement(_CheckBox.CheckBoxStateless, { key: id, title: users[id].firstName + ' ' + users[id].lastName,
                    checked: selUsers.indexOf(id) > -1,
                    onClick: function onClick() {
                        dispatch((0, _actions.historySkipAction)(0));
                        dispatch((0, _actions.historyUserToggle)(id));
                    } }));}));

};

var Dates = function Dates(_ref6) {var dispatch = _ref6.dispatch,selected = _ref6.selected,doUpdate = _ref6.doUpdate;
    if (!selected) return null;var
    dateStart = selected.dateStart,dateEnd = selected.dateEnd;
    var start = checkDateInput(dateStart);
    var end = checkDateInput(dateEnd);

    return _react2.default.createElement('div', { className: 'margin-top-2' },
        _react2.default.createElement('div', null, _react2.default.createElement(_Input2.default, { value: timeLib.dateString(dateStart), placeholder: start ? timeLib.dateString(timeLib.getStartDate(start)) : '',
                classes: [start && dateStart ? 'allowed' : 'not-allowed', 'width-80'],
                onChange: function onChange(value) {return dispatch((0, _actions.historyDateSet)((0, _trim2.default)(value)));},
                onBlur: function onBlur() {
                    dispatch((0, _actions.historySkipAction)(0));
                    doUpdate();
                } }),
            start ? '  ' + start.toDateString() : null),
        _react2.default.createElement('div', null, _react2.default.createElement(_Input2.default, { value: timeLib.dateString(dateEnd), placeholder: end ? timeLib.dateString(timeLib.getStartDate(end)) : '',
                classes: [end && dateEnd ? 'allowed' : 'not-allowed', 'width-80'],
                onChange: function onChange(value) {return dispatch((0, _actions.historyDateSet)((0, _trim2.default)(value), false));},
                onBlur: function onBlur() {
                    dispatch((0, _actions.historySkipAction)(0));
                    doUpdate();
                } }), end ? '  ' + end.toDateString() : null));

};

var Row = function Row(_ref7) {var item = _ref7.item,user = _ref7.user;
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