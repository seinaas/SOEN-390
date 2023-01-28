// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="cypress" />

describe('Example Cypress TodoMVC test', () => {
  beforeEach(() => {
    // usually we recommend setting baseUrl in cypress.json
    // but for simplicity of this example we just use it here
    // https://on.cypress.io/visit
    cy.visit('/');
  });

  it('should see sign in button if not signed in', () => {
    cy.get('[data-cy=auth-button]').should('have.text', 'Sign in');
  });

  it('should see sign out button if signed in', () => {
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          id: '1',
          name: 'John Doe',
        },
      },
    });

    cy.visit('/');
    cy.get('[data-cy=auth-button]').should('have.text', 'Sign out');
  });

  it('should navigate to sign in page when clicking sign in button', () => {
    cy.get('[data-cy=auth-button]').click();
    cy.url().should('include', '/auth/signin');
  });

  // more examples
  //
  // https://github.com/cypress-io/cypress-example-todomvc
  // https://github.com/cypress-io/cypress-example-kitchensink
  // https://on.cypress.io/writing-your-first-test
});