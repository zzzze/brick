import typescript from '@rollup/plugin-typescript'
import alias from '@rollup/plugin-alias'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import virtual from '@rollup/plugin-virtual'

export default [
  {
    input: 'packages/engine/src/index.tsx',
    output: {
      file: 'packages/engine/lib/engine.js',
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
    external: [
      'react',
      'react-dom',
      'tslib',
      '@babel/standalone',
      '@brick/components',
      'eventemitter3',
      'lodash/get',
      'lodash/set',
    ],
    onwarn: (warning, next) => {
      if (warning.code === 'EVAL') return
      next(warning)
    },
  },
  {
    input: 'packages/engine/src/index.tsx',
    output: {
      file: 'packages/engine/lib/engine.noconfig.js',
      format: 'cjs',
    },
    plugins: [
      virtual({
        '@/brick-wrapper': `export default (children) => children`,
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
    external: [
      'react',
      'react-dom',
      'tslib',
      '@babel/standalone',
      '@brick/components',
      'eventemitter3',
      'lodash/get',
      'lodash/set',
    ],
    onwarn: (warning, next) => {
      if (warning.code === 'EVAL') return
      next(warning)
    },
  },
  {
    input: 'packages/components/index.tsx',
    output: {
      file: 'packages/components/lib/index.js',
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
    external: ['react', 'react-dom', 'tslib', 'lodash/isPlainObject'],
  },
]
