import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import virtual from '@rollup/plugin-virtual'
import json from '@rollup/plugin-json'
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
      json(),
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
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'tslib',
      /lodash(\/.*)?/,
    ],
  },
]
