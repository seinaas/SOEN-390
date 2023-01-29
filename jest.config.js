const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  collectCoverage: true,
  coverageDirectory: 'jest-coverage',
  // coverageReporters: ['json'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['src/pages', 'src/components'],
};

module.exports = createJestConfig(customJestConfig);
