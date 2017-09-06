'use strict';var _config2 = require('./config');var _config3 = _interopRequireDefault(_config2);
var _root = require('./root');var _root2 = _interopRequireDefault(_root);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

console.log('Start server ' + (_config3.default.isProduction ? '<Production>' : '<Debug>'));

console.log(_root2.default.time.dateTimeString());