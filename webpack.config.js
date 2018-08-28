const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const IS_PROD =
  process.argv.find(a => a.includes('mode=production')) !== undefined;

const enabledFavicons = {
  favicons: true,
  android: false,
  appleIcon: false,
  appleStartup: false,
  coast: false,
  firefox: false,
  opengraph: false,
  twitter: false,
  yandex: false,
  windows: false,
};

module.exports = {
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, './dist/_static'),
    filename: '[name].[hash].js',
    publicPath: '/_static/',
  },
  devtool: IS_PROD ? 'source-map' : 'cheap-module-eval-source-map',
  devServer: { port: 9000, hot: true },
  optimization: {
    splitChunks: { chunks: 'all' },
  },

  resolve: {
    alias: {
      react: 'preact-compat',
      'react-dom': 'preact-compat',
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: { presets: ['env', 'stage-1', 'react'] },
      },
      {
        test: /\.svg$/,
        include: path.resolve('./icons'),
        use: [
          {
            loader: 'svg-sprite-loader',
            options: { spriteFilename: 'sprite.[hash].svg', esModule: false },
          },
          {
            loader: 'svgo-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'app.html' }),
    new SpriteLoaderPlugin(),
    new FaviconsWebpackPlugin({
      logo: './icons/folder.svg',
      icons: enabledFavicons,
      prefix: 'favicons-[hash]/',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
