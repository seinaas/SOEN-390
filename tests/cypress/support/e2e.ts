import './index';

import '@bahmutov/cypress-code-coverage/support';

Cypress.Commands.add('register', (em?: string, pass?: string, fn?: string, ln?: string) => {
  const randomId = Cypress._.random(0, 1e6);
  const email = em || `testuser-${randomId}@test.com`;
  const password = pass || 'testpassword';

  cy.visit('/auth/register');
  cy.dataCy('email-input').should('exist');
  cy.dataCy('email-input').type(email);

  cy.dataCy('password-input').type(password);
  cy.dataCy('confirm-password-input').type(password);

  cy.dataCy('register-btn').click();

  cy.dataCy('first-name-input').type(fn || 'Test');
  cy.dataCy('last-name-input').type(ln || randomId.toString());

  cy.dataCy('register-btn').click();

  return cy.wrap({ email, password, randomId: randomId.toString() });
});

Cypress.Commands.add('createChat', () => {
  cy.intercept('**/feed.json').as('feed');
  cy.intercept('**/u/*').as('profile');
  cy.intercept('POST', '/api/auth/signout').as('signout');
  cy.register().then(({ email, password, randomId }) => {
    cy.wait('@feed', { timeout: 10000 });
    cy.dataCy('signout-button').click();
    cy.wait('@signout');
    cy.register().then(({ email: email2, randomId: randomId2 }) => {
      cy.wait('@feed', { timeout: 10000 });
      cy.visit(`/u/${email}`);
      cy.wait('@profile');
      cy.dataCy('connect-button').click();

      cy.dataCy('signout-button').click();
      cy.wait('@signout');

      cy.visit('/auth/signin');
      cy.dataCy('email-input').type(email);
      cy.dataCy('password-input').type(password);
      cy.dataCy('signin-btn').click();
      cy.dataCy('signout-button').should('exist');

      cy.visit(`/u/${email2}`);
      cy.dataCy('accept-button').click();

      cy.visit('/chat');
      cy.dataCy('add-chat-btn').click();
      cy.dataCy(`add-user-${randomId2}`).should('exist');
      cy.dataCy(`add-user-${randomId2}`).click();
      cy.dataCy('modal-submit').click();
      return cy.wrap({ randomId, randomId2 });
    });
  });
});
