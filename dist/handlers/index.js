'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _misc = require('./misc');

var _misc2 = _interopRequireDefault(_misc);

var _auth = require('./auth');

var _auth2 = _interopRequireDefault(_auth);

var _help = require('./help');

var _help2 = _interopRequireDefault(_help);

var _balance = require('./balance');

var _balance2 = _interopRequireDefault(_balance);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    misc: new _misc2.default(),
    auth: new _auth2.default(),
    help: new _help2.default(),
    balance: new _balance2.default()
};