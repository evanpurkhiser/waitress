import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import SpriteLoaderPlugin from 'svg-sprite-loader/plugin';
import * as webpack from 'webpack';

import path from 'path';

const IS_PROD = process.argv.find(a => a.includes('mode=production'));

const config: webpack.Configuration = {
  entry: './app.tsx',
  output: {
    path: path.resolve(__dirname, './dist/_static'),
    filename: '[name].[fullhash].js',
    publicPath: '/_static/',
  },
  devtool: IS_PROD ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: {port: 8080},
  optimization: {
    splitChunks: {chunks: 'all'},
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env'],
            ['@babel/preset-typescript'],
            ['@babel/preset-react', {runtime: 'automatic'}],
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
    new ForkTsCheckerWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // @ts-expect-error The types on this are unfortunately not correct
    new SpriteLoaderPlugin(),
  ],
};

export default config;
