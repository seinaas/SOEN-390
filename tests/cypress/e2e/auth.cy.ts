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

  it('should navigate to sign in page when clicking sign in button', () => {
    cy.dataCy('signin-button').click();
    cy.url().should('include', '/auth/signin');
  });
  it('should navigate to register page when clicking register button', () => {
    cy.dataCy('register-button').click();
    cy.url().should('include', '/auth/register');
  });
});
describe('Register Page', () => {
  it('should successfully register with email and password', () => {
    cy.intercept('POST', '/api/auth/callback/credentials*').as('credentials');

    cy.visit('/auth/register');
    cy.dataCy('email-input').type(`testuser-${Cypress._.random(0, 1e6)}@test.com`);
    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword');

    cy.dataCy('register-btn').click();

    cy.dataCy('first-name-input').type('Test');
    cy.dataCy('last-name-input').type('User');

    cy.dataCy('register-btn').click();

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

    const email = `testuser-${Cypress._.random(0, 1e6)}@test.com`;

    // Create the first account
    cy.visit('/auth/register');
    cy.dataCy('email-input').type(email);

    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword');

    cy.dataCy('register-btn').click();

    cy.dataCy('first-name-input').type('Test');
    cy.dataCy('last-name-input').type('User');

    cy.dataCy('register-btn').click();

    // Try to create the second account
    cy.dataCy('signout-button').click();
    cy.visit('/auth/register');

    cy.dataCy('email-input').type(email);

    cy.dataCy('password-input').type('testpassword');
    cy.dataCy('confirm-password-input').type('testpassword');

    cy.dataCy('register-btn').click();

    cy.wait('@register');
    cy.wait('@register').its('response.statusCode').should('eq', 500);
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

    cy.visit('/auth/register');

    const email = `testuser-${Cypress._.random(0, 1e6)}@test.com`;
    const password = 'testpassword';

    cy.dataCy('email-input').type(email);
    cy.dataCy('password-input').type(password);
    cy.dataCy('confirm-password-input').type(password);

    cy.dataCy('register-btn').click();

    cy.dataCy('first-name-input').type('Test');
    cy.dataCy('last-name-input').type('User');

    cy.dataCy('register-btn').click();

    cy.dataCy('signout-button').click();

    cy.visit('/auth/signin');

    cy.dataCy('email-input').type(email);
    cy.dataCy('password-input').type(password);

    cy.dataCy('signin-btn').click();

    cy.wait('@credentials');
    cy.wait('@credentials').its('response.statusCode').should('eq', 200);
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
