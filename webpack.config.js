var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/app.jsx',
  devtool: 'source-map',
  output: { filename: 'bundle.min.js' },
  resolve: { extensions: ['', '.js', '.jsx'] },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: { presets: ['es2015', 'react'] }
    }]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({minimize: true})
  ]
};
