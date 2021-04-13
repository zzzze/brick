const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    '../packages/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config, { configType }) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, '../node_modules/monaco-editor/min/vs'), to: 'vs' },
        ],
      })
    )
    return config
  },
}
