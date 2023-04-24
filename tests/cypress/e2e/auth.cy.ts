describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should see sign in and register buttons if not signed in', () => {
    cy.dataCy('signin-button').should('be.visible');
    cy.dataCy('register-button').should('be.visible');
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
    cy.dataCy('signout-button').should('be.visible');
  });

  it('should redirect to register page when clicking on become member link', () => {
    cy.get('[data-cy=landingPage-link-becomeMember]').click();
    cy.url().should('include', '/auth/register');
  });

  it('should navigate to sign in page when clicking sign in button', () => {
    cy.dataCy('signin-button').click();
    cy.url().should('include', '/auth/signin');
  });

  it('should navigate to register page when clicking register button', () => {
    cy.dataCy('register-button').click();
    cy.url().should('include', '/auth/register');
  });

  it('should render the Top Menu Bar', () => {
    cy.get('[data-cy=topMenuBar]').should('be.visible');
  });

  it('should render the links in the Top Menu Bar', () => {
    cy.get('[data-cy=topMenuBar-link-about]').should('be.visible');
    cy.get('[data-cy=topMenuBar-link-contact]').should('be.visible');
    cy.get('[data-cy=topMenuBar-link-language]').should('be.visible');
  });

  it('should render the logo of the Top Menu Bar', () => {
    cy.get('[data-cy=topMenuBar-logo]').should('be.visible');
  });

  it('should not render the contact links when user is logged in', () => {
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          id: '1',
          name: 'John Doe',
        },
      },
    });

    cy.visit('/');
    cy.get('[data-cy=topMenuBar-link-contact]').should('not.be.visible');
  });

  it('should render the user profile picture if logged in', () => {
    cy.intercept('GET', '/api/auth/session', {
      body: {
        user: {
          id: '1',
          name: 'John Doe',
        },
      },
    });

    cy.visit('/');
    cy.get('[data-cy=topMenuBar-profile-picture]').should('be.visible');
  });

  it('should display landing page picture and text', () => {
    cy.get('[data-cy=landingPage-picture]').should('be.visible');
    cy.get('[data-cy=landingPage-text-welcome]').should('be.visible');
  });

  it('should redirect to register page when clicking on become member link', () => {
    cy.get('[data-cy=landingPage-link-becomeMember]').click();
    cy.url().should('include', '/auth/register');
  });
});
describe('Register Page', () => {
  it('should successfully register with email and password', () => {
    cy.intercept('POST', '/api/auth/callback/credentials*').as('credentials');

    cy.register();

    cy.wait('@credentials').its('response.statusCode').should('eq', 200);
  });
  it('should fail to register with invalid email', () => {
    cy.intercept('POST', '/api/auth/callback/credentials*', cy.spy().as('credentials'));

    cy.visit('/auth/register');
    cy.dataCy('email-input').type(`testuser-${Cypress._.random(0, 1e6)}`);
    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword');

    cy.dataCy('register-btn').click();

    cy.get('@credentials').should('not.have.been.called');
  });
  it('should fail to register if a user with the same email exists', () => {
    cy.intercept('POST', '/api/trpc/auth.register*').as('register');
    cy.intercept('**/feed*').as('feed');
    // Create the first account
    cy.register().then(({ email }) => {
      // Try to create the second account
      cy.wait('@feed');
      cy.dataCy('signout-button').click();
      cy.dataCy('signin-button').should('be.visible');
      cy.visit('/auth/register');

      cy.dataCy('email-input').type(email);

      cy.dataCy('password-input').type('testpassword');
      cy.dataCy('confirm-password-input').type('testpassword');

      cy.dataCy('register-btn').click();

      cy.wait('@register');
      cy.wait('@register').its('response.statusCode').should('eq', 500);
    });
  });
  it('should fail to register if passwords do not match', () => {
    cy.intercept('POST', '/api/trpc/auth.register*').as('register');
    cy.visit('/auth/register');
    cy.dataCy('email-input').type(`testuser-${Cypress._.random(0, 1e6)}@test.com`);
    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword1');

    cy.dataCy('register-btn').click();

    cy.wait('@register').its('response.statusCode').should('eq', 500);
  });
});

describe('Sign In Page', () => {
  it('should successfully sign in with email and password', () => {
    cy.intercept('POST', '/api/auth/callback/credentials*').as('credentials');

    cy.register().then(({ email, password }) => {
      cy.dataCy('signout-button').click();
      cy.dataCy('signin-button').should('be.visible');

      cy.visit('/auth/signin');

      cy.dataCy('email-input').type(email);
      cy.dataCy('password-input').type(password);

      cy.dataCy('signin-btn').click();

      cy.wait('@credentials');
      cy.wait('@credentials').its('response.statusCode').should('eq', 200);
    });
  });
  it('should fail to sign in if user does not exist', () => {
    cy.intercept('POST', '/api/auth/callback/credentials*').as('credentials');

    cy.visit('/auth/signin');
    cy.dataCy('email-input').type(`testuser-${Cypress._.random(0, 1e6)}@test.com`);
    cy.dataCy('password-input').type('testpassword');

    cy.dataCy('signin-btn').click();

    cy.wait('@credentials').its('response.statusCode').should('eq', 401);
  });
});

describe('Providers', () => {
  it('should redirect to Google OAuth provider', () => {
    cy.visit('/auth/signin');
    cy.dataCy('google-btn').click();

    cy.url().should('include', 'accounts.google.com');
  });

  it('should redirect to Facebook OAuth provider', () => {
    cy.visit('/auth/signin');
    cy.dataCy('facebook-btn').click();

    cy.url().should('include', 'facebook.com');
  });

  // This causes an endless loop for some reason
  it.skip('should redirect to Microsoft OAuth provider', () => {
    cy.visit('/auth/signin');
    cy.dataCy('microsoft-btn').click();

    cy.url().should('include', 'login.microsoftonline.com');
  });
});
