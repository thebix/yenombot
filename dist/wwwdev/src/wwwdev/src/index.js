'use strict';var _react = require('react');var _react2 = _interopRequireDefault(_react);
var _reactDom = require('react-dom');
var _reactRedux = require('react-redux');
var _redux = require('redux');
var _reduxThunk = require('redux-thunk');var _reduxThunk2 = _interopRequireDefault(_reduxThunk);
var _reactHotLoader = require('react-hot-loader');
var _reducers = require('./reducers');var _reducers2 = _interopRequireDefault(_reducers);
var _app = require('./app.jsx');var _app2 = _interopRequireDefault(_app);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var store = (0, _redux.createStore)(_reducers2.default,

(0, _redux.applyMiddleware)(_reduxThunk2.default));


(0, _reactDom.render)(_react2.default.createElement(_reactHotLoader.AppContainer, null, _react2.default.createElement(_reactRedux.Provider, { store: store }, _react2.default.createElement(_app2.default, null))), document.querySelector('#app'));

if (module && module.hot) {
    module.hot.accept('./app', function () {
        (0, _reactDom.render)(
        _react2.default.createElement(_reactHotLoader.AppContainer, null,
            _react2.default.createElement(_reactRedux.Provider, { store: store },
                _react2.default.createElement(_app2.default, null))),


        document.querySelector('#app'));

    });
}