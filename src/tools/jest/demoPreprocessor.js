const { relative } = require('path')
const crypto = require('crypto')
const markTwain = require('mark-twain')
const JsonML = require('jsonml.js/lib/utils')
const babel = require('@babel/core')
const babelConfig = require('../../../babel.config')
const pkg = require('../../../package.json')

function getCode(tree) {
  let code
  const find = (node) => {
    if (code) return
    if (!JsonML.isElement(node)) return
    if (JsonML.getTagName(node) !== 'pre') {
      JsonML.getChildren(node).forEach(find)
      return
    }
    code = JsonML.getChildren(JsonML.getChildren(node)[0] || '')[0] || ''
  }
  find(tree)
  return code
}

function createDemo({ types: t }) {
  return {
    visitor: {
      Program(path) {
        const importReact = t.ImportDeclaration(
          [t.importDefaultSpecifier(t.Identifier('React'))],
          t.StringLiteral('react')
        )
        path.unshiftContainer('body', importReact)
      },

      CallExpression(path) {
        if (
          path.node.callee.object &&
          path.node.callee.object.name === 'ReactDOM' &&
          path.node.callee.property.name === 'render'
        ) {
          const app = t.VariableDeclaration('const', [
            t.VariableDeclarator(t.Identifier('__Demo'), path.node.arguments[0]),
          ])
          // 参考 https://github.com/babel/babel/blob/8d492b159b342cfd1f399e4292e3cb12a895e1d3/packages/babel-plugin-transform-typescript/src/enum.js#L28
          path.scope.registerDeclaration(path.replaceWith(app)[0])
          const exportDefault = t.ExportDefaultDeclaration(t.Identifier('__Demo'))
          path.insertAfter(exportDefault)
          path.insertAfter(app)
          path.remove()
        }
      },
    },
  }
}

module.exports = {
  process(src, path) {
    const markdown = markTwain(src)
    src = getCode(markdown.content)
    if (!babelConfig.plugins) {
      babelConfig.plugins = []
    }
    babelConfig.plugins = [...babelConfig.plugins]
    if (!~babelConfig.plugins.indexOf(createDemo)) {
      babelConfig.plugins.push(createDemo)
    }
    babelConfig.filename = path
    src = babel.transform(src, babelConfig).code
    return src
  },

  getCacheKey(fileData, filename, configString, options) {
    const { instrument, rootDir } = options
    return crypto
      .createHash('md5')
      .update(fileData)
      .update('\0', 'utf8')
      .update(relative(rootDir, filename))
      .update('\0', 'utf8')
      .update(configString)
      .update('\0', 'utf8')
      .update(instrument ? 'instrument' : '')
      .update('\0', 'utf8')
      .update(pkg.version)
      .digest('hex')
  },
}
