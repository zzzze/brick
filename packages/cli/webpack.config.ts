import path from 'path'
import webpack from 'webpack'
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

interface Env {
  prod?: boolean
}

const dir = process.env.PWD || './'

export default function (env: Env): webpack.Configuration {
  return {
    entry: path.resolve(dir, './index.tsx'),
    output: {
      path: path.resolve(dir, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /brick.config.json$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [['@babel/preset-env', { targets: 'defaults' }], '@babel/preset-react'],
              },
            },
            {
              loader: path.resolve(__dirname, 'loader.js'),
            },
          ],
          type: 'javascript/auto',
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
        },
      ],
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.ts', '.tsx'],
      alias: {
        '@brick/engine': '@brick/engine/lib/index.pure.js',
      },
    },
    mode: env.prod ? 'production' : 'development',
    devtool: !env.prod && 'source-map',
    optimization: {
      usedExports: true,
    },
    plugins: [
      new LodashModuleReplacementPlugin({
        paths: true,
      }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!env.prod),
      }),
      new webpack.NormalModuleReplacementPlugin(
        /^@babel\/standalone$/,
        path.resolve(__dirname, './mock-babel-standalone.js')
      ),
      new HtmlWebpackPlugin(),
    ],
  }
}
