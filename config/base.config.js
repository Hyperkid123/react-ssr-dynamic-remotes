const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { UniversalFederationPlugin } = require('@module-federation/node');

const getSharedDeps = () => [
  {
    react: { requiredVersion: '*', singleton: true },
    'react-dom': { requiredVersion: '*', singleton: true },
    'react-router-dom': { requiredVersion: '*', singleton: true },
    '@scalprum/react-core': { requiredVersion: '*', singleton: true },
  },
];

const getConfig = (isServer = false) => ({
  entry: isServer
    ? {
        serverStart: path.resolve(__dirname, '../server/index.ts'),
        serverAPI: path.resolve(__dirname, '../server/server.ts'),
      }
    : path.resolve(__dirname, isServer ? '../server/index.ts' : '../src/index.ts'),
  mode: 'development',
  output: {
    path: path.resolve(__dirname, isServer ? '../build/server' : '../build/client'),
    filename: '[name].js',
    publicPath: '/dist/',
    ...(isServer
      ? {
          libraryTarget: 'commonjs-module',
        }
      : {
          chunkFilename: '[name].js',
        }),
  },
  target: isServer ? false : 'web',
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      'process.env.IS_SERVER': isServer === true,
    }),
    new UniversalFederationPlugin({
      isServer,
      remotes: {
        ...(isServer
          ? {
              // fake is required for node to be setup to accept remote chunks in node env
              fake: 'promise new Promise((resolve) => {resolve({get:()=>Promise.resolve(()=>{}),init:()=>{}})})',
            }
          : {}),
      },
      shared: getSharedDeps(),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
      },
      {
        test: /\.s?[ac]ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: {
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
});

module.exports = getConfig;
