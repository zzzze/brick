import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import virtual from '@rollup/plugin-virtual'
import json from '@rollup/plugin-json'

export default [
  {
    input: 'packages/engine/index.ts',
    output: {
      dir: 'packages/engine/lib',
      format: 'cjs',
    },
    plugins: [
      typescript({
        tsconfig: 'packages/engine/tsconfig.json',
      }),
      alias({
        entries: [{ find: /^@\/(.*)/, replacement: '$1' }],
      }),
      nodeResolve({
        moduleDirectories: ['node_modules'],
        extensions: ['.js', '.ts', '.tsx'],
      }),
      commonjs(),
    ],
    external: ['react', 'react-dom', 'tslib', '@babel/standalone', 'eventemitter3', /@brick(\/.*)?/, /lodash(\/.*)?/],
    onwarn: (warning, next) => {
      if (warning.code === 'EVAL') return
      next(warning)
    },
  },
  {
    input: 'packages/engine/index.noconfig.ts',
    output: {
      dir: 'packages/engine/lib',
      format: 'cjs',
    },
    plugins: [
      virtual({
        './brick-wrapper': `export default (children) => children`,
      }),
      typescript({
        tsconfig: 'packages/engine/tsconfig.json',
      }),
      alias({
        entries: [{ find: /^@\/(.*)/, replacement: '$1' }],
      }),
      nodeResolve({
        moduleDirectories: ['node_modules'],
        extensions: ['.js', '.ts', '.tsx'],
      }),
      commonjs(),
    ],
    external: ['react', 'react-dom', 'tslib', '@babel/standalone', 'eventemitter3', /@brick(\/.*)?/, /lodash(\/.*)?/],
    onwarn: (warning, next) => {
      if (warning.code === 'EVAL') return
      next(warning)
    },
  },
  {
    input: 'packages/components/index.tsx',
    output: {
      dir: 'packages/components/lib',
      format: 'cjs',
    },
    plugins: [
      typescript({
        tsconfig: 'packages/components/tsconfig.json',
      }),
      alias({
        entries: [{ find: /^@\/(.*)/, replacement: '$1' }],
      }),
      nodeResolve({
        moduleDirectories: ['node_modules'],
        extensions: ['.js', '.ts', '.tsx'],
      }),
      commonjs(),
    ],
    external: ['react', 'react-dom', 'tslib', /lodash(\/.*)?/],
  },
  {
    input: [
      'packages/cli/index.ts',
      'packages/cli/loader.ts',
      'packages/cli/mock-babel-standalone.ts',
      'packages/cli/webpack.config.ts',
    ],
    output: {
      dir: 'packages/cli/lib',
      format: 'cjs',
    },
    plugins: [
      typescript({
        tsconfig: 'packages/cli/tsconfig.json',
      }),
      nodeResolve({
        moduleDirectories: ['node_modules'],
        extensions: ['.js', '.ts', '.tsx'],
      }),
      json(),
      commonjs(),
    ],
    external: ['tslib', 'webpack', 'lodash-webpack-plugin', 'html-webpack-plugin', 'webpack-dev-server'],
  },
]
