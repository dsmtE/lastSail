const webpack = require('webpack')
const path = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin");

const IS_DEV = process.env.NODE_ENV === "dev";

const config = {
  entry: path.resolve(__dirname, './src/sketch.js'),
  devtool: 'eval-source-map',
  watch: true,
  output: {
    path: path.resolve(__dirname, './out'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: 'out',
    port: 8080
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "src/index.html",
      filename: "index.html"
    })
  ]
}

module.exports = config
