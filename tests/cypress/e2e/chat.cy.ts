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
    //after chat creation, you are logged in as email
    cy.createChat().then(({ randomId, randomId2 }) => {});
  });
});
