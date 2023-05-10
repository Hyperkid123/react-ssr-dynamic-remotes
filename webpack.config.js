const path = require('path')
const webpack = require('webpack')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const moduleFederationConfig = require('./moduleFederationConfig');

const mfPLugin = new webpack.container.ModuleFederationPlugin(moduleFederationConfig('chrome', 'chrome.js'))


const isProduction = process.env.NODE_ENV === 'production'

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build/client'),
    publicPath: '/dist/'
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: 'index.html'
    // })
    mfPLugin
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
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...']
  },
}

module.exports = () => {
  if (isProduction) {
    config.mode = 'production'

    config.plugins.push(new WorkboxWebpackPlugin.GenerateSW())
  } else {
    config.mode = 'development'
    // config.plugins.push(new ReactRefreshWebpackPlugin())
  }
  return config
}
