const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const branding = process.env.BRANDING || 'waitress';

const vendorChunk = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: module => /node_modules/.test(module.resource),
});

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].[hash].js',
    publicPath: '/_static/',
  },
  devtool: 'source-map',
  devServer: { port: 9000, hot: true },
  module: {
    rules: [{
      test:    /\.js$/,
      loader:  'babel-loader',
      options: { presets: ['env', 'stage-1', 'react'] },
    },
    {
      test: /\.scss$/,
      use:  ExtractTextPlugin.extract([ 'css-loader', 'sass-loader' ]),
    },
    {
      test:    /\.svg$/,
      include: path.resolve('./icons'),
      use: [{
        loader:  'svg-sprite-loader',
        options: { spriteFilename: 'sprite.[hash].svg', esModule: false },
      },
      {
        loader: 'svgo-loader',
      }],
    }],
  },
  plugins: [
    vendorChunk,
    new ExtractTextPlugin({ filename: '[name].[contenthash].css' }),
    new HtmlWebpackPlugin({ template: 'app.html' }),
    new SpriteLoaderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({ name: 'bundle', minChunks: Infinity }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({ BRANDING: JSON.stringify(branding) }),
  ],
};
