const path = require('path')
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

module.exports = function (env, argv) {
  return {
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
        },
      ],
    },
    resolve: {
      modules: ['node_modules', path.resolve(__dirname, 'src')],
      extensions: ['.js', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    externals: {
      '@babel/standalone': 'commonjs2 @babel/standalone',
    },
    mode: env.prod ? 'production' : 'development',
    devtool: !env.prod && 'source-map',
    optimization: {
      usedExports: true,
    },
    plugins: [
      new LodashModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!env.prod),
      }),
    ],
  }
}
