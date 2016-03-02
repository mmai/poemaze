var path = require('path');
var webpack = require('webpack');

module.exports = {
  resolve: {
    alias: {
      settings: path.join(__dirname, `src/settings.${process.env.NODE_ENV}.js`)
    }
  },
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'www/wp-content/themes/arbre-integral/'),
    publicPath: '/wp-content/themes/arbre-integral/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /.jsx?$/, include: [path.resolve(__dirname, "src")], loader: 'babel-loader' },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
      })
  ],
  devServer: {
    //XXX webpack-dev-server do not understand dots in urls, thus e2e tests on urls with '0.0.1' will fail
    // host: "arbre-integral.net",
    host: "localhost",
    port: 1234,
    historyApiFallback: true,
    proxy: {
      '/wp-json/*': {
                target: 'http://arbre-integral.net',
                secure: false,
              }
            }
          },
        };
