describe('Feed Page', () => {
  describe('Posts', () => {
    it('should create a post', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
      });
    });
    it('should delete a post', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('delete-post-btn').click();
        cy.dataCy('post').should('not.exist');
      });
    });
    it('should edit a post', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('edit-post-btn').click();
        cy.dataCy('edit-post-input').type('This is an edited post');
        cy.dataCy('edit-post-form').submit();
        cy.dataCy('post').should('contain', 'This is an edited post');
      });
    });
  });

  describe('Comments', () => {
    it('should comment on a post', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('comment-btn').click();
        cy.dataCy('comment-input').type('This is a test comment');
        cy.dataCy('comment-form').submit();
        cy.dataCy('comment').should('contain', 'This is a test comment');
      });
    });
    it('should delete a comment', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('comment-btn').click();
        cy.dataCy('comment-input').type('This is a test comment');
        cy.dataCy('comment-form').submit();
        cy.dataCy('comment').should('contain', 'This is a test comment');
        cy.dataCy('delete-comment-btn').click();
        cy.dataCy('comment').should('not.exist');
      });
    });
    it('should edit a comment', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('comment-btn').click();
        cy.dataCy('comment-input').type('This is a test comment');
        cy.dataCy('comment-form').submit();
        cy.dataCy('comment').should('contain', 'This is a test comment');
        cy.dataCy('edit-comment-btn').click();
        cy.dataCy('edit-comment-input').type('This is an edited comment');
        cy.dataCy('edit-comment-form').submit();
        cy.dataCy('comment').should('contain', 'This is an edited comment');
      });
    });
  });

  describe('Likes', () => {
    it('should like a post', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('like-btn').click();
        cy.dataCy('like-btn').should('contain', 'Liked');
      });
    });
    it('should unlike a post', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a test post');
        cy.dataCy('post-form').submit();
        cy.dataCy('post').should('contain', 'This is a test post');
        cy.dataCy('like-btn').click();
        cy.dataCy('like-btn').should('contain', 'Liked');
        cy.dataCy('like-btn').click();
        cy.dataCy('like-btn').should('contain', 'Like');
      });
    });
  });
});
