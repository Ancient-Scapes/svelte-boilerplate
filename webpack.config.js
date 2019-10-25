const path = require('path');

module.exports = {
  mode: 'none',
  entry: {
    main: './src/js/index.js'
  },
  output: {
    filename: 'bundle.js',
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: [
              ['@babel/preset-env', { modules: false }]
            ]
          }
        }
      },
      {
        test: /\.js$/,
        use: 'webpack-import-glob-loader'
      }
    ]
  }
}
