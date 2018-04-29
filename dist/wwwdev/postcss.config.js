'use strict'; // Source: https://github.com/alicoding/react-webpack-babel

var AUTOPREFIXER_BROWSERS = [
'Android 2.3',
'Android >= 4',
'Chrome >= 35',
'Firefox >= 31',
'Explorer >= 9',
'iOS >= 7',
'Opera >= 12',
'Safari >= 7.1'];


module.exports = {
    plugins: [
    require('autoprefixer')({ browsers: AUTOPREFIXER_BROWSERS })] };;var _temp = function () {if (typeof __REACT_HOT_LOADER__ === 'undefined') {return;}__REACT_HOT_LOADER__.register(AUTOPREFIXER_BROWSERS, 'AUTOPREFIXER_BROWSERS', 'src/wwwdev/postcss.config.js');}();;