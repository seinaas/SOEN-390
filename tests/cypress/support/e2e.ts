import './index';

import '@bahmutov/cypress-code-coverage/support';

Cypress.Commands.add('register', (em?: string, pass?: string, fn?: string, ln?: string) => {
  const randomId = Cypress._.random(0, 1e6);
  const email = em || `testuser-${randomId}@test.com`;
  const password = pass || 'testpassword';

  cy.visit('/auth/register');
  cy.dataCy('email-input').type(email);

  cy.dataCy('password-input').type(password);
  cy.dataCy('confirm-password-input').type(password);

  cy.dataCy('register-btn').click();

  cy.dataCy('first-name-input').type(fn || 'Test');
  cy.dataCy('last-name-input').type(ln || randomId.toString());

  cy.dataCy('register-btn').click();

  return cy.wrap({ email, password, randomId: randomId.toString() });
});
