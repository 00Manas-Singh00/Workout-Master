export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/app.js',
    '!server/**/*.test.js',
    '!server/**/*.spec.js',
  ],
  testMatch: [
    '**/server/**/*.test.js',
    '**/server/**/*.spec.js',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/server/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],
  testTimeout: 10000,
};
