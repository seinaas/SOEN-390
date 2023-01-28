const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  collectCoverage: true,
  coverageDirectory: 'jest-coverage',
  // coverageReporters: ['json'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};

module.exports = createJestConfig(customJestConfig);
