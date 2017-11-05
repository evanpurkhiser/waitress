const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlTemplate = new HtmlWebpackPlugin({
  filename: '_static/index.html',
  template: 'index.html',
});

const commonChunk = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks: module => /node_modules/.test(module.resource),
});

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '_static/[name].js',
    publicPath: '/',
  },
  devtool: 'source-map',
  devServer: { port: 9000, hot: true },
  module: {
    loaders: [{
      test:   /\.js$/,
      loader: 'babel-loader',
      query: { presets: ['env', 'stage-1', 'react'] },
    },
    {
      test: /\.scss$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
    },
    {
      test:    /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
      loader:  'file-loader',
      options: { name: '_static/[hash].[ext]' },
    }],
  },
  plugins: [
    htmlTemplate,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    commonChunk,
    new webpack.optimize.CommonsChunkPlugin({ name: 'bundle', minChunks: Infinity }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};
