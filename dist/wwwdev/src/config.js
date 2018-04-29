'use strict';Object.defineProperty(exports, "__esModule", { value: true });var isProduction = process.env.NODE_ENV === 'production';var _default =

{
    isProduction: isProduction,
    log: isProduction ? 'INFO' : 'DEBUG',
    dirStorage: __dirname + '/state/' };exports.default = _default;;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register(isProduction, 'isProduction', 'src/wwwdev/src/config.js');__REACT_HOT_LOADER__.register(_default, 'default', 'src/wwwdev/src/config.js');}();;