module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: ['**/__tests__/*.test.(js|ts|tsx)'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.md$': './src/tools/jest/demoPreprocessor',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
