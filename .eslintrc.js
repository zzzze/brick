module.exports = {
  root: true,
  env: {
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/standard',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './tsconfig.eslint.json',
      './packages/engine/tsconfig.eslint.json',
      './packages/components/tsconfig.eslint.json',
      './packages/example/tsconfig.eslint.json',
      './packages/cli/tsconfig.eslint.json',
      './packages/shared/tsconfig.eslint.json',
    ],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
}
