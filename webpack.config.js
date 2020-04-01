const webpack = require('webpack')
const path = require('path')
const HtmlWebPackPlugin = require("html-webpack-plugin");

const IS_DEV = process.env.NODE_ENV === "dev";

// const cssLoaders = [
//   'style-loader',
//   'css-loader'
//   // {
//   //   loader: 'postcss-loader',
//   //   options: {
//   //     plugins: (loader) => [
//   //       require('autoprefixer')()
//   //     ]
//   //   }
//   // }
// ]

const config = {
  entry: path.resolve(__dirname, './src/sketch.js'),
  devtool: 'source-map',
  watch: true,
  output: {
    path: path.resolve(__dirname, './out'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, './out'),
    port: 3000
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      },
      {
        test: /(.css)$/,
        use: ['style-loader', 'css-loader']
      },
      // {
      //   test: /\.s[ac]ss$/i,
      //   use: [
      //     'style-loader',
      //     'css-loader',
      //     'sass-loader',
      //   ],
      // },
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
