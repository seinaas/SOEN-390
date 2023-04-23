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
    cy.createChat();
  });
});

describe('File Upload/Download', () => {
  it('should show the upload preview when selecting a file to upload', () => {
    cy.createChat().then(() => {
      cy.dataCy('new-message-input').type('This is a post to test file uploading preview');
      cy.dataCy('upload-inner-input').selectFile('tests/cypress/fixtures/testUploadPreview.txt', { force: true });
      cy.dataCy('file-upload-preview').should('exist');
    });
  }),
    it('should show the download file preview when a mesage containing a file is shown', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/trpc/conversation.getConversationMessages?*',
        },
        { fixture: 'testGetConversationMessages.json' },
      ).as('getMessages');

      cy.intercept('POST', '/api/trpc/cloudflare.getPresignedGETUrl.*', {
        fixture: 'testGetPresignedGETUrlResponse.json',
      }).as('getPresignedGETUrl');

      cy.intercept('POST', '/api/trpc/cloudflare.getPresignedLISTUrl.*', {
        fixture: 'testGetPresignedLISTUrlResponse.json',
      }).as('getPresignedLISTUrl');

      cy.createChat().then(() => {
        cy.wait('@getMessages');
        cy.dataCy('file-download-preview').should('be.visible');
      });
    });
});
