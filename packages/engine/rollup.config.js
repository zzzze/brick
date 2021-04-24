import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import virtual from '@rollup/plugin-virtual'
import path from 'path'
import pkg from './package.json'

export default (prefix) => [
  {
    input: path.join(prefix, 'index.ts'),
    output: {
      dir: path.join(prefix, 'lib'),
      format: 'cjs',
    },
    plugins: [
      typescript({
        tsconfig: path.join(prefix, 'tsconfig.json'),
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
    external: [
      ...Object.keys(pkg.dependencies || {}).map((key) => new RegExp(`${key}(/.*)?`)),
      ...Object.keys(pkg.peerDependencies || {}).map((key) => new RegExp(`${key}(/.*)?`)),
      'tslib',
      /lodash(\/.*)?/,
    ],
    onwarn: (warning, next) => {
      if (warning.code === 'EVAL') return
      next(warning)
    },
  },
  {
    input: path.join(prefix, 'index.pure.ts'),
    output: {
      dir: path.join(prefix, 'lib'),
      format: 'cjs',
    },
    plugins: [
      virtual({
        './brick-wrapper': `
          export default ({children}) => children
          export const createRemoveItemFromParentFn = () => () => null
          export const ITEM_TYPE = 'brick-instance'
        `,
        './render-config-form': `export default () => null`,
        './brick-menu': `export default () => null`,
      }),
      typescript({
        tsconfig: path.join(prefix, 'tsconfig.json'),
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
    external: [
      ...Object.keys(pkg.dependencies || {}).map((key) => new RegExp(`${key}(/.*)?`)),
      ...Object.keys(pkg.peerDependencies || {}).map((key) => new RegExp(`${key}(/.*)?`)),
      'tslib',
      /lodash(\/.*)?/,
    ],
    onwarn: (warning, next) => {
      if (warning.code === 'EVAL') return
      next(warning)
    },
  },
]
