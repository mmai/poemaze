var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
 
module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'www/wp-content/themes/arbre-integral/'),
    publicPath: '/wp-content/themes/arbre-integral/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /.jsx?$/, include: [path.resolve(__dirname, "src")], loader: 'babel-loader' },
      { test: /\.scss$/, include: [path.resolve(__dirname, "src")], loader: ExtractTextPlugin.extract("style-loader", "css!sass") }
    ]
  },
  plugins: [
    new ExtractTextPlugin("bundle.css"),
    new webpack.ProvidePlugin({
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
      })
  ]
};
