describe('Profile', () => {
  describe('Bio', () => {
    it('should successfully add bio', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('new-bio-btn').click();

        cy.dataCy('bio-input').type('This is my bio');
        cy.dataCy('modal-submit').click();

        cy.dataCy('bio').should('contain', 'This is my bio');
      });
    });
    it('should successfully edit bio', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('new-bio-btn').click();

        cy.dataCy('bio-input').type('This is my bio');
        cy.dataCy('modal-submit').click();

        cy.dataCy('bio').should('contain', 'This is my bio');

        cy.dataCy('edit-bio-btn').click();

        cy.dataCy('bio-input').clear().type('This is my new bio');
        cy.dataCy('modal-submit').click();

        cy.dataCy('bio').should('contain', 'This is my new bio');
      });
    });
  });

  describe('Languages', () => {
    it('should successfully add language', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('edit-langs-btn').click();

        cy.dataCy('lang-input').type('English');
        cy.dataCy('lang-submit').click();
        cy.dataCy('modal-submit').click();

        cy.dataCy('languages').should('contain', 'English');
      });
    });
  });

  describe('Skills', () => {
    it('should successfully add skill', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('edit-skills-btn').click();

        cy.dataCy('skill-input').type('Python');
        cy.dataCy('skill-submit').click();
        cy.dataCy('modal-submit').click();

        cy.dataCy('skills').should('contain', 'Python');
      });
    });
  });

  describe('Work Experience', () => {
    it('should successfully add work experience', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('new-job-btn').click();

        cy.dataCy('job-title-input').type('Software Engineer');
        cy.dataCy('company-input').type('Google');
        cy.dataCy('start-date-input').type('2020-01-01');
        cy.dataCy('end-date-input').type('2020-12-31');
        cy.dataCy('description-input').type('I worked at Google');
        cy.dataCy('modal-submit').click();

        cy.dataCy('work-experience').should('contain', 'Software Engineer');
      });
    });

    it('should successfully edit work experience', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('new-job-btn').click();

        cy.dataCy('job-title-input').type('Software Engineer');
        cy.dataCy('company-input').type('Google');
        cy.dataCy('start-date-input').type('2020-01-01');
        cy.dataCy('end-date-input').type('2020-12-31');
        cy.dataCy('description-input').type('I worked at Google');
        cy.dataCy('modal-submit').click();

        cy.dataCy('edit-job-btn').click();
        cy.dataCy('job-title-input').clear().type('Software Developer');
        cy.dataCy('modal-submit').click();

        cy.dataCy('work-experience').should('contain', 'Software Developer');
      });
    });
  });

  describe('Education', () => {
    it('should successfully add education', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('new-edu-btn').click();

        cy.dataCy('degree-input').type('Computer Science');
        cy.dataCy('school-input').type('Concordia University');
        cy.dataCy('start-date-input').type('2020-01-01');
        cy.dataCy('end-date-input').type('2020-12-31');
        cy.dataCy('description-input').type('Studied Computer Science');
        cy.dataCy('location-input').type('Montreal');

        cy.dataCy('modal-submit').click();

        cy.dataCy('education').should('contain', 'Concordia University');
      });
    });

    it('should successfully edit education', () => {
      cy.register().then(({ email }) => {
        cy.visit(`/u/${email}`);

        cy.dataCy('new-edu-btn').click();

        cy.dataCy('degree-input').type('Computer Science');
        cy.dataCy('school-input').type('Concordia University');
        cy.dataCy('start-date-input').type('2020-01-01');
        cy.dataCy('end-date-input').type('2020-12-31');
        cy.dataCy('description-input').type('Studied Computer Science');
        cy.dataCy('location-input').type('Montreal');

        cy.dataCy('modal-submit').click();

        cy.dataCy('edit-edu-btn').click();
        cy.dataCy('school-input').clear().type('McGill University');

        cy.dataCy('modal-submit').click();

        cy.dataCy('education').should('contain', 'McGill University');
      });
    });
  });
});
