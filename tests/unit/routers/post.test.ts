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
        connectionOf: [],
      } as any);
      const getPost = jest.spyOn(request.ctx.prisma.post, 'findMany').mockImplementation();

      await request.caller.post.getPosts();
      expect(getPost).toHaveBeenCalledWith({
        where: {
          userId: {
            in: ['1', '2'],
          },
        },
        include: expect.anything(),
      });
    });
    it('should return posts made by user if no connections', async () => {
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        connections: [],
        connectionOf: [],
      } as any);
      const getPost = jest.spyOn(request.ctx.prisma.post, 'findMany').mockImplementation();

      await request.caller.post.getPosts();
      expect(getPost).toHaveBeenCalledWith({
        where: {
          userId: {
            in: ['1'],
          },
        },
        include: expect.anything(),
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
          content: 'test',
        });
        expect(updateComment).toHaveBeenCalledWith({
          where: {
            commentId: '1',
          },
          data: {
            content: 'test',
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
    describe('getCommentsPerPost', () => {
      it('should get comments for a post', async () => {
        const getComments = jest.spyOn(request.ctx.prisma.comments, 'findMany').mockImplementation();
        await request.caller.post.getCommentsPerPost({
          postId: '1',
        });
        expect(getComments).toHaveBeenCalledWith({
          where: {
            postId: '1',
          },
          include: expect.anything(),
        });
      });
    });
    describe('toggleLike', () => {
      it('should like a post if not liked', async () => {
        const createLike = jest.spyOn(request.ctx.prisma.likes, 'create').mockImplementation();
        request.ctx.prisma.likes.findMany.mockResolvedValueOnce([] as any);
        request.ctx.prisma.post.findUnique.mockResolvedValueOnce(null as any);
        await request.caller.post.toggleLike({
          postId: '1',
        });
        expect(createLike).toHaveBeenCalledWith({
          data: {
            postId: '1',
            userId: '1',
          },
        });
      });
      it('should unlike a post if liked', async () => {
        const deleteLike = jest.spyOn(request.ctx.prisma.likes, 'deleteMany').mockImplementation();
        request.ctx.prisma.likes.findMany.mockResolvedValueOnce([
          {
            postId: '1',
            userId: '1',
          },
        ] as any);
        request.ctx.prisma.post.findUnique.mockResolvedValueOnce({
          likes: [
            {
              userId: '1',
            },
          ],
        } as any);
        await request.caller.post.toggleLike({
          postId: '1',
        });
        expect(deleteLike).toHaveBeenCalledWith({
          where: {
            postId: '1',
            userId: '1',
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
