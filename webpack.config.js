const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const htmlTemplate = new HtmlWebpackPlugin({
  filename: '_static/index.html',
  template: 'app.html',
});

const commonChunk = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: module => /node_modules/.test(module.resource),
});

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '_static/[name].[hash].js',
    publicPath: '/',
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
      use:  [ 'style-loader', 'css-loader', 'sass-loader' ],
    },
    {
      test:    /\.svg$/,
      include: path.resolve('./icons'),
      use: [{
        loader:  'svg-sprite-loader',
        options: { spriteFilename: '_static/sprite.[hash].svg', esModule: false },
      },
      {
        loader: 'svgo-loader',
      }],
    }],
  },
  plugins: [
    htmlTemplate,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    commonChunk,
    new webpack.optimize.CommonsChunkPlugin({ name: 'bundle', minChunks: Infinity }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new SpriteLoaderPlugin(),
  ],
};
