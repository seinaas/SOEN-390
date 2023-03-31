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
  it('should show chat input if the user is in a channel', () => {
    // TODO: Update this test once chat channels are implemented
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          id: '1',
          name: 'John Doe',
          DirectMessages: [
            {
              id: '1',
              users: [
                {
                  id: '1',
                },
                {
                  id: '2',
                },
              ],
            },
          ],
        },
      },
    });
    cy.visit('/chat');

    cy.dataCy('no-convos').should('exist');
  });

  //   const request = trpcRequest({ user: { email: 'test@hotmail.com', image: '', name: 'Test' }, expires: '' });

  //   request.ctx.prisma.user.findUnique.mockResolvedValueOnce();
  //   cy.visit('/chat');

  //   cy.dataCy('join-channel-btn').click();
  //   cy.dataCy('chat-input').should('exist');
  // });
  // it('should automatically join the last channel a user was in', () => {
  //   // TODO: Update this test once chat channels are implemented
  //   cy.intercept('GET', '/api/auth/session', {
  //     body: {
  //       user: {
  //         id: '1',
  //         name: 'John Doe',
  //       },
  //     },
  //   });
  //   localStorage.setItem('lastChannel', 'test-channel');

  //   cy.visit('/chat');

  //   cy.dataCy('channel-name').should('have.text', 'Current Channel: test-channel');
  // });
});
