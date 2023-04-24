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
  it('should show the chat input if the user is in a channel', () => {
    cy.createChat().then(() => {
      cy.dataCy('new-message-input').should('exist');
    });
  });
  it('should successfully send a message', () => {
    cy.createChat().then(() => {
      cy.dataCy('new-message-input').type('This is a test message');
      cy.dataCy('new-message-form').submit();
      cy.dataCy('messages-box').should('contain', 'This is a test message');
    });
  });
  it('should add connection to an existing chat', () => {
    cy.intercept('**/feed.json').as('feed');
    cy.intercept('**/u/*').as('profile');
    cy.intercept('POST', '/api/auth/signout').as('signout');
    cy.register().then(({ email, password, randomId }) => {
      cy.wait('@feed');
      cy.dataCy('signout-button').click();
      cy.wait('@signout');
      cy.register().then(({ email: email2, randomId: randomId2 }) => {
        cy.wait('@feed');
        cy.visit(`/u/${email}`);
        cy.wait('@profile');
        cy.dataCy('connect-button').click();

        cy.dataCy('signout-button').click();
        cy.wait('@signout');
        cy.register().then(({ email: email3, randomId: randomId3 }) => {
          cy.wait('@feed');
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

          cy.visit(`/u/${email3}`);
          cy.dataCy('accept-button').click();

          cy.visit('/chat');
          cy.dataCy('add-chat-btn').click();
          cy.dataCy(`add-user-${randomId2}`).should('exist');
          cy.dataCy(`add-user-${randomId2}`).click();
          cy.dataCy('modal-submit').click();

          cy.dataCy('addUsers-chat-btn').click();
          cy.dataCy(`add-user-${randomId3}`).should('exist');
          cy.dataCy(`add-user-${randomId3}`).click();
          cy.dataCy('modal-submit').click();
        });
      });
    });
  });
});

describe('File Upload/Download', () => {
  it('should show the upload preview when selecting a file to upload', () => {
    cy.createChat().then(() => {
      cy.dataCy('new-message-input').type('This is a post to test file uploading preview');
      cy.dataCy('upload-inner-input').selectFile('tests/cypress/fixtures/testUploadPreview.txt', { force: true });
      cy.dataCy('file-upload-preview').should('exist');
    });
  });
  // skipping for now because it isn't working in the CI
  it.skip('should show the download file preview when a message containing a file is shown', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/trpc/conversation.getUserConversations,conversation.getConversationMessages?*',
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
