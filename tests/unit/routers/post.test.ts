import { createUser, trpcRequest } from '../../utils';

describe('post', () => {
  const request = trpcRequest({ user: { id: '1' }, expires: '' });
  describe('getUserPosts', () => {
    it('should return posts by user id', async () => {
      const getPost = jest.spyOn(request.ctx.prisma.post, 'findMany').mockImplementation();

      await request.caller.post.getUserPosts({ userId: '1' });
      expect(getPost).toHaveBeenCalledWith({
        where: {
          userId: '1',
        },
        include: {
          comments: true,
          likes: true,
        },
      });
    });
  });
  describe('getPosts', () => {
    it('should get posts made by user connections', async () => {
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        connections: [
          {
            user1Id: '1',
            user2Id: '2',
          },
        ],
      } as any);
      const getPost = jest.spyOn(request.ctx.prisma.post, 'findMany').mockImplementation();

      await request.caller.post.getPosts();
      expect(getPost).toHaveBeenCalledWith({
        where: {
          userId: {
            in: ['1', '2'],
          },
        },
        include: {
          comments: true,
          likes: true,
          User: {
            select: {
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      });
    });
    it('should return posts made by user if no connections', async () => {
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        connections: [],
      } as any);
      const getPost = jest.spyOn(request.ctx.prisma.post, 'findMany').mockImplementation();

      await request.caller.post.getPosts();
      expect(getPost).toHaveBeenCalledWith({
        where: {
          userId: {
            in: ['1'],
          },
        },
        include: {
          comments: true,
          likes: true,
          User: {
            select: {
              firstName: true,
              lastName: true,
              image: true,
            },
          },
        },
      });
    });
    describe('createPost', () => {
      it('should create a post for a user', async () => {
        const createPost = jest.spyOn(request.ctx.prisma.post, 'create').mockImplementation();
        await request.caller.post.createPost({
          content: 'test',
        });
        expect(createPost).toHaveBeenCalledWith({
          data: {
            content: 'test',
            userId: '1',
          },
        });
      });
    });
    describe('editPost', () => {
      it('should update a post for a user', async () => {
        const updatePost = jest.spyOn(request.ctx.prisma.post, 'update').mockImplementation();
        await request.caller.post.editPost({
          postId: '1',
          content: 'test',
        });
        expect(updatePost).toHaveBeenCalledWith({
          where: {
            id: '1',
          },
          data: {
            content: 'test',
          },
        });
      });
    });
    describe('deletePost', () => {
      it('should delete a post for a user', async () => {
        const deletePost = jest.spyOn(request.ctx.prisma.post, 'delete').mockImplementation();
        await request.caller.post.deletePost({
          postId: '1',
        });
        expect(deletePost).toHaveBeenCalledWith({
          where: {
            id: '1',
          },
        });
      });
    });
    describe('createComment', () => {
      it('should create a comment for a post', async () => {
        const createComment = jest.spyOn(request.ctx.prisma.comments, 'create').mockImplementation();
        await request.caller.post.createComment({
          postId: '1',
          content: 'test',
        });
        expect(createComment).toHaveBeenCalledWith({
          data: {
            content: 'test',
            postId: '1',
            userId: '1',
          },
        });
      });
    });
    describe('editComment', () => {
      it('should update a comment for a post', async () => {
        const updateComment = jest.spyOn(request.ctx.prisma.comments, 'update').mockImplementation();
        await request.caller.post.editComment({
          commentId: '1',
          postId: '1',
          content: 'test',
        });
        expect(updateComment).toHaveBeenCalledWith({
          where: {
            commentId: '1',
          },
          data: {
            content: 'test',
            postId: '1',
          },
        });
      });
    });
    describe('deleteComment', () => {
      it('should delete a comment for a post', async () => {
        const deleteComment = jest.spyOn(request.ctx.prisma.comments, 'delete').mockImplementation();
        await request.caller.post.deleteComment({
          commentId: '1',
        });
        expect(deleteComment).toHaveBeenCalledWith({
          where: {
            commentId: '1',
          },
        });
      });
    });
    describe('createLike', () => {
      it('should create a like for a post', async () => {
        const createLike = jest.spyOn(request.ctx.prisma.likes, 'create').mockImplementation();
        await request.caller.post.createLike({
          postId: '1',
        });
        expect(createLike).toHaveBeenCalledWith({
          data: {
            postId: '1',
            userId: '1',
          },
        });
      });
    });
    describe('removeLike', () => {
      it('should remove a like for a post', async () => {
        const deleteLike = jest.spyOn(request.ctx.prisma.likes, 'delete').mockImplementation();
        await request.caller.post.removeLike({
          likeId: '1',
        });
        expect(deleteLike).toHaveBeenCalledWith({
          where: {
            likeId: '1',
          },
        });
      });
    });
    describe('getLikesPerPost', () => {
      it('should return likes for a post', async () => {
        const getLikes = jest.spyOn(request.ctx.prisma.likes, 'findMany').mockImplementation();
        await request.caller.post.getLikesPerPost({
          postId: '1',
        });
        expect(getLikes).toHaveBeenCalledWith({
          where: {
            postId: '1',
          },
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        });
      });
    });
  });
});
