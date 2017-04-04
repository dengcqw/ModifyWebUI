var webpack = require('webpack');

module.exports = {
  entry: __dirname+'/js/entry.js',
  output: {
    path: __dirname+'/js',
    filename: 'bundle.js',
    publicPath: 'http://localhost:8080/js/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
        ]
      },
      {
        test: /\.(png|jpg)$/,
        use: [
          {
            loader: 'url-loader?limit=2000000'
          }
        ]
      },
      {
        test: /\.(html|htm)$/,
        use: 'raw-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options:{
            presets: ['env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ],
  target: 'web', /* default */
  node: {
    console: false,
    global: true,
    process: true,
    Buffer: false, /* make bundle.js smaller */
    __filename: "mock",
    __dirname: "mock",
    setImmediate: true
  }
}
