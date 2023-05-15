const path = require('path')
const webpack = require('webpack')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { UniversalFederationPlugin } = require('@module-federation/node');


const isProduction = process.env.NODE_ENV === 'production'

const config = {
  entry: './src/index.tsx',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'build/client'),
    publicPath: '/dist/',
    // library: {type: 'commonjs-module',}
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: 'index.html'
    // })
    // mfPLugin
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
                syntax: 'typescript'
              }
            }
          }
        }
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset'
      }

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    fallback: {
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify")
    }
  },
}

module.exports = (isServer) => {
  // if(typeof isServer !== 'boolean') {
    // }
  config.plugins.push(new UniversalFederationPlugin({
    isServer: isServer === true,
    remotes: {
      // fake is required for node to be setup to accept remote chunks in node env
    'fake': 'promise new Promise((resolve) => {resolve({get:()=>Promise.resolve(()=>{}),init:()=>{}})})',
    },     
    shared: [
      { react: { singleton: true, eager: true, requiredVersion: "*" }},
      {'react-dom': { singleton: true, eager: true, requiredVersion: "*" }},
      {'react-router-dom': { singleton: true, eager: true, requiredVersion: "*" }}
    ]
    // shared: [
    //   {
    //     react: { singleton: true, eager: true, requiredVersion: "*" },
    //     'react-dom': { singleton: true, eager: true, requiredVersion: "*" }
    //   }
    // ],
  }))
  // config.plugins.push(new webpack.container.ModuleFederationPlugin({
  //   shared: [
  //     { react: { singleton: true, eager: true, requiredVersion: "*" }},
  //     {'react-dom': { singleton: true, eager: true, requiredVersion: "*" }}
  //   ]
  // }))
  config.target = isServer === true ? false : 'web'
  
  return config
}
