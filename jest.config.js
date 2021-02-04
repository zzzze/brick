module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.md$': './packages/tools/jest/demoPreprocessor',
  },
  projects: ['<rootDir>/packages/engine/jest.config.js', '<rootDir>/packages/components/jest.config.js'],
}
