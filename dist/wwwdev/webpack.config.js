'use strict'; // Source: https://github.com/alicoding/react-webpack-babel

var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var DashboardPlugin = require('webpack-dashboard/plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var HOST = process.env.HOST || '127.0.0.1';
var PORT = process.env.PORT || '8888';

loaders.push({
    test: /\.scss$/,
    loaders: ['style-loader', 'css-loader?importLoaders=1', 'sass-loader'],
    exclude: ['node_modules'] });


module.exports = {
    entry: [
    'react-hot-loader/patch',
    './src/wwwdev/src/index.jsx'],

    devtool: process.env.WEBPACK_DEVTOOL || 'eval-source-map',
    output: {
        publicPath: '/',
        path: path.join(__dirname, 'wwwroot'),
        filename: 'bundle.js' },

    resolve: {
        extensions: ['.js', '.jsx'] },

    module: {
        loaders: loaders },

    devServer: {
        contentBase: './wwwroot',
        // do not print bundle build stats
        noInfo: true,
        // enable HMR
        hot: true,
        // embed the webpack-dev-server runtime into the bundle
        inline: true,
        // serve index.html in place of 404 responses to allow HTML5 history
        historyApiFallback: true,
        port: PORT,
        host: HOST },

    plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
        filename: 'style.css',
        allChunks: true }),

    new DashboardPlugin(),
    new HtmlWebpackPlugin({
        template: './src/wwwdev/template.html',
        files: {
            css: ['style.css'],
            js: ['bundle.js'] } })] };