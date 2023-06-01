const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { UniversalFederationPlugin } = require('@module-federation/node');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

const getSharedDeps = () => [
  {
    react: { requiredVersion: '*', singleton: true },
    'react-dom': { requiredVersion: '*', singleton: true },
    'react-router-dom': { requiredVersion: '*', singleton: true },
    '@scalprum/react-core': { requiredVersion: '*', singleton: true },
  },
];

const getConfig = (isServer = false) => ({
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    cacheDirectory: path.resolve(__dirname, '.cache', isServer ? 'server' : 'client'),
  },
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
    new MiniCssExtractPlugin({
      chunkFilename: '[name].[contenthash].css',
    }),
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
    ...(isServer
      ? []
      : [
          new WebpackManifestPlugin({
            fileName: 'asset-manifest.json',
            filter: (file) => {
              return file.isInitial || (file.chunk?.runtime && file.name.match(/\.css$/));
            },
            generate: (_seed, files, entries) => {
              const entryChunks = Object.keys(entries);
              return files
                .map((file) => {
                  return {
                    name: file.name,
                    path: file.path,
                    initial: file.isInitial || entryChunks.includes(file?.chunk.runtime),
                  };
                })
                .filter(({ initial }) => initial);
            },
          }),
        ]),
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
    alias: {
      '@openshift/dynamic-plugin-sdk': isServer
        ? path.resolve(__dirname, '../node_modules/@openshift/dynamic-plugin-sdk/dist/index.cjs.js')
        : path.resolve(__dirname, '../node_modules/@openshift/dynamic-plugin-sdk'),
      react: path.resolve(__dirname, '../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
      ...(isServer && {
        uuid: path.resolve(__dirname, '../node_modules/uuid/dist/esm-node'),
      }),
    },
    fallback: isServer
      ? {}
      : {
          os: require.resolve('os-browserify/browser'),
          path: require.resolve('path-browserify'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
        },
  },
});

module.exports = getConfig;
