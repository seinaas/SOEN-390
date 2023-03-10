import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getByEmail: publicProcedure.input(z.object({ email: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: input.email,
      },
      include: {
        _count: {
          select: {
            connections: {
              where: { connectionStatus: 'Connected' },
            },
            connectionOf: {
              where: { connectionStatus: 'Connected' },
            },
          },
        },
      },
    });

    if (user) {
      const res = (({ id: _id, _count: __count, ...u }) => u)(user);
      return {
        ...res,
        numConnections: user._count.connections + user._count.connectionOf,
      };
    }
  }),
  getByID: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              connections: {
                where: { connectionStatus: 'Connected' },
              },
              connectionOf: {
                where: { connectionStatus: 'Connected' },
              },
            },
          },
        },
      });

      if (user) {
        const res = (({ id: _id, _count: __count, ...u }) => u)(user);
        return {
          ...res,
          numConnections: user._count.connections + user._count.connectionOf,
        };
      }
    }),
  update: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).nullish(),
        lastName: z.string().min(1).nullish(),
        bio: z.string().nullish(),
        education: z.string().nullish(),
        job: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: input,
      });

      return user;
    }),

  /**
   * Routes Mohsen worked on for the feed feature. These API routes will achieve th following:
   * 1. Get all posts for a user
   * 2. Create a post for a user
   * 3. Update a post for a user
   * 4. Delete a post for a user
   * 5. Create a comment for a post
   * 6. Update a comment for a post
   * 7. Delete a comment for a post
   * 8. Get all comments for a post
   * 8. Like a post
   * 9. Unlike a post
   * 10. Get all likes for a post
   */

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

    const posts = await ctx.prisma.post.findMany({
      where: {
        userId: {
          in: user?.connections.map((c) => (c.user1Id === ctx.session.user.id ? c.user2Id : c.user1Id)) || [],
        },
      },
      include: {
        comments: true,
        likes: true,
      },
    });
    console.log(posts);
  }),

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
          userId: ctx.session.user.id,
        },
        data: updateInput,
      });

      return post;
    }),

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
          userId: ctx.session.user.id,
        },
      });

      return post;
    }),

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
          postId: input.postId,
          userId: ctx.session.user.id,
        },
        data: updateInput,
      });

      return comment;
    }),

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
          userId: ctx.session.user.id,
        },
      });

      return comment;
    }),

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

  removeLike: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        userId: z.string().min(1).nullish(),
        likeId: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const like = await ctx.prisma.likes.delete({
        where: {
          likeId: input.likeId,
          userId: ctx.session.user.id, //needs to be the user who likes the post
          postId: input.postId,
        },
      });
      return like;
    }),

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
