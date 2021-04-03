/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const IS_PROD = process.argv.find(a => a.includes('mode=production'));

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, './dist/_static'),
    filename: '[name].[fullhash].js',
    publicPath: '/_static/',
  },
  devtool: IS_PROD ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: {port: 8080, hot: true},
  optimization: {
    splitChunks: {chunks: 'all'},
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', {targets: {chrome: '64'}}],
            ['@babel/preset-react'],
          ],
          plugins: [['@babel/plugin-proposal-class-properties']],
        },
      },
      {
        test: /\.svg$/,
        include: path.resolve('./icons'),
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {spriteFilename: 'sprite.[fullhash].svg', esModule: false},
          },
          {
            loader: 'svgo-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'app.html',
      favicon: 'icons/favicon.ico',
    }),
    new SpriteLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
