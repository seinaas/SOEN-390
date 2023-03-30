describe('Header', () => {
  it('should successfully search for a user by part of first name', () => {
    cy.register().then(({ email }) => {
      cy.dataCy('search-user-input').type('Tes');
      cy.dataCy('search-user-dropdown').should('contain', email);
    });
  });
  it('should successfully search for a user by part of last name', () => {
    cy.register().then(({ email }) => {
      cy.dataCy('search-user-input').type('Use');
      cy.dataCy('search-user-dropdown').should('contain', email);
    });
  });
  it('should replace the header links by a hamburger menu on mobile devices', () => {
    cy.register().then(() => {
      cy.viewport('iphone-xr');
      cy.dataCy('header-hamburger-button').should('be.visible');
      cy.dataCy('header-desktop-links').should('not.be.visible');
    });
  });
  it('should display the sidebar menu when pressing on the hamburger menu button', () => {
    cy.register().then(() => {
      cy.viewport('iphone-xr');
      cy.dataCy('header-hamburger-button').click();
      cy.dataCy('header-sliding-mobile-menu').should('be.visible');
    });
  });
  it('should close the mobile sliding menu on pressing the x button or outside of the menu', () => {
    cy.register().then(() => {
      cy.viewport('iphone-xr');
      // Testing the 'X' button
      cy.dataCy('header-hamburger-button').click();
      cy.dataCy('header-mobile-sliding-menu-close-btn').click();
      cy.dataCy('header-sliding-mobile-menu').should('not.be.visible');

      //Testing pressing outside the mobile sliding menu
      cy.dataCy('header-hamburger-button').click();
      cy.dataCy('header-sliding-mobile-menu-grey-area').click();
      cy.dataCy('header-sliding-mobile-menu').should('not.be.visible');
    });
  });
});
