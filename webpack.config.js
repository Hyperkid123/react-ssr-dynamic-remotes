const path = require('path');
const webpack = require('webpack');
const { UniversalFederationPlugin } = require('@module-federation/node');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
  entry: './src/index.tsx',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'build/client'),
    publicPath: '/dist/',
  },
  plugins: [new MiniCssExtractPlugin()],
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
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          // {
          //   loader: 'resolve-url-loader',
          //   // options: {
          //   //   join: createJoinFunction('myJoinFn', createJoinImplementation(myGenerator)),
          //   // },
          // },
        ],
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
};

module.exports = (isServer) => {
  // if(typeof isServer !== 'boolean') {
  // }
  config.plugins.push(
    new UniversalFederationPlugin({
      isServer: isServer === true,
      remotes: {
        // fake is required for node to be setup to accept remote chunks in node env
        fake: 'promise new Promise((resolve) => {resolve({get:()=>Promise.resolve(()=>{}),init:()=>{}})})',
      },
      shared: [
        { react: { singleton: true, eager: true, requiredVersion: '*' } },
        { 'react-dom': { singleton: true, eager: true, requiredVersion: '*' } },
        { 'react-router-dom': { singleton: true, eager: true, requiredVersion: '*' } },
        { '@scalprum/react-core': { singleton: true, eager: true, requiredVersion: '*' } },
      ],
    })
  );
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.IS_SERVER': isServer === true,
    })
  );
  config.target = isServer === true ? false : 'web';

  return config;
};
