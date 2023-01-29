const { defineConfig } = require('cypress');
const codeCoverageTask = require('@bahmutov/cypress-code-coverage/plugin');

module.exports = defineConfig({
  downloadsFolders: 'tests/cypress/downloads',
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/screenshots',
  video: false,

  e2e: {
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/e2e.ts',
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      return Object.assign({}, config, codeCoverageTask(on, config));
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'tests/cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/component.ts',
    indexHtmlFile: 'tests/cypress/support/component-index.html',
    setupNodeEvents(on, config) {
      return Object.assign({}, config, codeCoverageTask(on, config));
    },
  },
});
