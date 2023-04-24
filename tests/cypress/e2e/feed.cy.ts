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

  describe('File Upload/Download', () => {
    it('should show the upload preview when selecting a file to upload', () => {
      cy.register().then(() => {
        cy.dataCy('post-input').type('This is a post to test file uploading preview');
        cy.dataCy('upload-inner-input').selectFile('tests/cypress/fixtures/testUploadPreview.txt', { force: true });
        cy.dataCy('file-upload-preview').should('exist');
      });
    }),
      it('should show the download file preview when a post with a file attached is shown', () => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/trpc/notifications.getNotificationCount,post.getPosts*',
          },
          { fixture: 'testGetPostsResponse.json' },
        ).as('getPosts');

        cy.intercept(
          'GET',
          'https://soen390-prospect-storage.fb208edad989edb49bc5da41e557c37b.r2.cloudflarestorage.com/*',
          { fixture: 'dummyListFilesResponse.xml' },
        ).as('getFilesInfo');

        cy.intercept('POST', '/api/trpc/cloudflare.getPresignedGETUrl.*', {
          fixture: 'testGetPresignedGETUrlResponse.json',
        }).as('getPresignedGETUrl');

        cy.intercept('POST', '/api/trpc/cloudflare.getPresignedLISTUrl.*', {
          fixture: 'testGetPresignedLISTUrlResponse.json',
        }).as('getPresignedLISTUrl');

        cy.register().then(() => {
          cy.wait(['@getPosts', '@getFilesInfo']);
          cy.dataCy('file-download-preview').should('be.visible');
        });
      });
  });
});
