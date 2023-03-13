describe('Header', () => {
  it('should successfully search for a user by part of first name', () => {
    const email = `testuser-${Cypress._.random(0, 1e6)}@test.com`;
    cy.visit('/auth/register');
    cy.dataCy('email-input').type(email);
    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword');

    cy.dataCy('register-btn').click();

    cy.dataCy('first-name-input').type('Test');
    cy.dataCy('last-name-input').type('User');

    cy.dataCy('register-btn').click();

    cy.visit(`/u/${email}`);

    cy.dataCy('search-user-input').type('Tes');
    cy.dataCy('search-user-dropdown').should('contain', email);
  });
  it('should successfully search for a user by part of last name', () => {
    const email = `testuser-${Cypress._.random(0, 1e6)}@test.com`;

    cy.visit('/auth/register');
    cy.dataCy('email-input').type(email);
    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword');

    cy.dataCy('register-btn').click();

    cy.dataCy('first-name-input').type('Test');
    cy.dataCy('last-name-input').type('User');

    cy.dataCy('register-btn').click();

    cy.visit(`/u/${email}`);

    cy.dataCy('search-user-input').type('Use');
    cy.dataCy('search-user-dropdown').should('contain', email);
  });
});