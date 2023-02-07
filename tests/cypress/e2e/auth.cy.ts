describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should see sign in and register buttons if not signed in', () => {
    cy.get('[data-cy=signin-button]').should('be.visible');
    cy.get('[data-cy=register-button]').should('be.visible');
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
    cy.get('[data-cy=signout-button]').should('be.visible');
  });

  it('should navigate to sign in page when clicking sign in button', () => {
    cy.get('[data-cy=signin-button]').click();
    cy.url().should('include', '/auth/signin');
  });
  it('should navigate to register page when clicking register button', () => {
    cy.get('[data-cy=register-button]').click();
    cy.url().should('include', '/auth/register');
  });

  // TODO: Find a way to mock getServerAuthSession
  // TODO: Find a way to test auth
});
