import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * This is the post router.
 * It contains all the procedures related to posts.
 * This includes getting all posts, creating a post, updating a post, and deleting a post.
 */
export const postRouter = createTRPCRouter({
  // Get all posts made by a user
  getUserPosts: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          comments: true,
          likes: true,
        },
      });
      return posts;
    }),

  // Get all posts made by a user's connections
  getPosts: protectedProcedure.query(async ({ ctx }) => {
    console.log('\n Get post api \n ');
    const user = await ctx.prisma.user.findUnique({
      select: {
        connections: true,
      },
      where: {
        id: ctx.session.user.id,
      },
    });

    // Search for posts where the poster's userId is in the list of connections
    const posts = await ctx.prisma.post.findMany({
      where: {
        userId: {
          in: [
            ctx.session.user.id,
            ...(user?.connections.map((c) => (c.user1Id === ctx.session.user.id ? c.user2Id : c.user1Id)) || []),
          ] || [ctx.session.user.id],
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

    return posts;
  }),

  // Create a post for a user
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(ctx.session.user);
      console.log(input);

      const post = await ctx.prisma.post.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      return post;
    }),

  // Update a post for a user
  editPost: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'postId'> & Partial<Pick<typeof input, 'postId'>> = {
        ...input,
      };
      delete updateInput.postId;

      const post = await ctx.prisma.post.update({
        select: {
          id: true,
          userId: true,
          content: true,
          createdAt: true,
          comments: true,
        },
        where: {
          id: input.postId,
        },
        data: updateInput,
      });

      return post;
    }),

  // Delete a post for a user
  deletePost: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });

      return post;
    }),

  // Create a comment on a post
  createComment: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await ctx.prisma.comments.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      return comment;
    }),

  // Get all comments for a post
  getCommentsPerPost: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const comments = await ctx.prisma.comments.findMany({
        where: {
          postId: input.postId,
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
      return comments;
    }),

  // Edit a comment on a post
  editComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string().min(1),
        postId: z.string().min(1),
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'commentId'> & Partial<Pick<typeof input, 'commentId'>> = {
        ...input,
      };
      delete updateInput.commentId;

      const comment = await ctx.prisma.comments.update({
        where: {
          commentId: input.commentId,
        },
        data: updateInput,
      });

      return comment;
    }),

  // Delete a comment on a post
  deleteComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await ctx.prisma.comments.delete({
        where: {
          commentId: input.commentId,
        },
      });

      return comment;
    }),

  // Like a post
  createLike: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        userId: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const like = await ctx.prisma.likes.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          postId: input.postId,
        },
      });
      return like;
    }),

  // Unlike a post
  removeLike: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        likeId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const like = await ctx.prisma.likes.delete({
        where: {
          likeId: input.likeId,
        },
      });
      return like;
    }),

  // Get all likes for a post
  getLikesPerPost: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const likes = await ctx.prisma.likes.findMany({
        where: {
          postId: input.postId,
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
      return likes;
    }),
});
