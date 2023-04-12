describe('Chat Page', () => {
  it('should hide chat input if the user is not in a channel', () => {
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          id: '1',
          name: 'John Doe',
        },
      },
    });

    cy.visit('/chat');

    cy.dataCy('chat-input').should('not.exist');
  });
  it('should create a chat with connection', () => {
    cy.register().then(({ email, password }) => {
      cy.dataCy('signout-button').click();
      cy.register().then(({ email: email2, randomId }) => {
        cy.visit(`/u/${email}`);
        cy.dataCy('connect-button').click();
        cy.dataCy('signout-button').click();

        cy.visit('/auth/signin');
        cy.dataCy('email-input').type(email);
        cy.dataCy('password-input').type(password);
        cy.dataCy('signin-btn').click();
        cy.dataCy('signout-button').should('exist');

        cy.visit(`/u/${email2}`);
        cy.dataCy('accept-button').click();

        cy.visit('/chat');
        cy.dataCy('add-chat-btn').click();
        cy.dataCy(`add-user-${randomId}`).should('exist');
      });
    });
  });
});
