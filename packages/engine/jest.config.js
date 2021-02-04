module.exports = {
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.ts'],
  testMatch: ['**/__tests__/*.test.(js|ts|tsx)'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.md$': '../tools/jest/demoPreprocessor',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@brick/engine$': '<rootDir>/src/index.tsx',
    '^@brick/engine/(.*)$': '<rootDir>/src/$1',
  },
}
