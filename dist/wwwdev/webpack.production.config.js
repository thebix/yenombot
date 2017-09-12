'use strict'; // Source: https://github.com/alicoding/react-webpack-babel

var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

loaders.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader?sourceMap&localIdentName=[local]___[hash:base64:5]!sass-loader?outputStyle=expanded' }),
    exclude: ['node_modules'] });


module.exports = {
    entry: [
    './src/wwwdev/src/index.jsx',
    './src/wwwdev/css/index.scss'],

    output: {
        publicPath: './',
        path: path.join(__dirname, '../../wwwroot'),
        filename: '[chunkhash].js' },

    resolve: {
        extensions: ['.js', '.jsx'] },

    module: {
        loaders: loaders },

    plugins: [
    new WebpackCleanupPlugin(),
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"production"' } }),


    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            screw_ie8: true,
            drop_console: true,
            drop_debugger: true } }),


    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin({
        filename: 'style.css',
        allChunks: true }),

    new HtmlWebpackPlugin({
        template: './src/wwwdev/template.html',
        files: {
            css: ['style.css'],
            js: ['bundle.js'] } })] };