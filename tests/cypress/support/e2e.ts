import './index';

import '@bahmutov/cypress-code-coverage/support';

Cypress.Commands.add('register', (em?: string, pass?: string) => {
  const email = em || `testuser-${Cypress._.random(0, 1e6)}@test.com`;
  const password = pass || 'testpassword';

  cy.visit('/auth/register');
  cy.dataCy('email-input').type(email);

  cy.dataCy('password-input').type(password);
  cy.dataCy('confirm-password-input').type(password);

  cy.dataCy('register-btn').click();

  cy.dataCy('first-name-input').type('Test');
  cy.dataCy('last-name-input').type('User');

  cy.dataCy('register-btn').click();

  return cy.wrap({ email, password });
});
