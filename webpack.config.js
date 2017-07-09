const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HardSourcePlugin = require('hard-source-webpack-plugin');
const nodeObjectHash = require('node-object-hash');

module.exports = function(env) {
  const isProduction = env === 'production';

  const config = {
    entry: [path.join(__dirname, 'src/index.js')],
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: isProduction ? './' : '/',
      path: path.join(__dirname, 'build')
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [{
            loader: 'babel-loader',
            options: {cacheDirectory: true}
          }]
        }
      ]
    },
    plugins: [
      new HardSourcePlugin({
        cacheDirectory: path.join(__dirname, `node_modules/.cache/hardsource/${isProduction ? 'prod' : 'dev'}/[confighash]`),
        recordsPath: path.join(__dirname, `node_modules/.cache/hardsource/${isProduction ? 'prod' : 'dev'}/[confighash]/records.json`),
        configHash(webpackConfig) {
          return nodeObjectHash().hash(webpackConfig);
        }
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'index.html')
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      })
    ]
  };

  if(!isProduction) {
    config.devServer = {
			historyApiFallback: true,
			hot: true,
			inline: true,
			stats: 'errors-only',
		};

		config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return config;
};
