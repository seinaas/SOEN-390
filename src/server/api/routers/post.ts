/*
*		Posts Router
*
*
*		This file defines a TRPC router for handling various procedures related to posts. The procedures include getting all posts made 
*		by a user, creating a post, updating a post, deleting a post, and creating a comment on a post. The code interacts with a Prisma 
*		ORM to perform database operations, and includes functionality for sending notifications using a triggerNotification helper function.
*/
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { triggerNotification, triggerNotificationRefresh } from '../helpers';

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
  getPost: protectedProcedure.input(z.object({ postId: z.string().min(1) })).query(async ({ input, ctx }) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.postId,
      },
      include: {
        comments: {
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
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
    return post;
  }),
  // Get all posts made by a user's connections
  getPosts: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      include: {
        connections: true,
        connectionOf: true,
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
            ...(user?.connectionOf.map((c) => (c.user1Id === ctx.session.user.id ? c.user2Id : c.user1Id)) || []),
          ] || [ctx.session.user.id],
        },
      },
      include: {
        comments: {
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
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
        hasFiles: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
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
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await ctx.prisma.comment.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      // Get the post that the comment was made on
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      // Send a notification to the user that made the post
      if (post?.userId) {
        await triggerNotification({
          type: 'Comment',
          to: post.userId,
          content: input.content,
          ctx,
        });
      }
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
      const comments = await ctx.prisma.comment.findMany({
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
        content: z.string().min(1).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'commentId'> & Partial<Pick<typeof input, 'commentId'>> = {
        ...input,
      };
      delete updateInput.commentId;

      const comment = await ctx.prisma.comment.update({
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
      const comment = await ctx.prisma.comment.delete({
        where: {
          commentId: input.commentId,
        },
      });

      return comment;
    }),

  toggleLike: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const like = await ctx.prisma.like.findMany({
        where: {
          postId: input.postId,
          userId: ctx.session.user.id,
        },
      });

      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
        select: {
          userId: true,
        },
      });

      if (like.length > 0) {
        await ctx.prisma.like.deleteMany({
          where: {
            postId: input.postId,
            userId: ctx.session.user.id,
          },
        });

        // Find related notification and delete it
        // TODO: This is a bit of a hack, we should be able to delete the notification
        // using the postId and userId
        if (post?.userId) {
          const notif = await ctx.prisma.notification.findFirst({
            where: {
              type: 'Like',
              senderId: ctx.session.user.id,
              userId: post?.userId,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (notif) {
            await ctx.prisma.notification.delete({
              where: {
                id: notif.id,
              },
            });
            await triggerNotificationRefresh({ ctx, to: post.userId });
          }
        }

        return false;
      } else {
        await ctx.prisma.like.create({
          data: {
            postId: input.postId,
            userId: ctx.session.user.id,
          },
        });

        if (post?.userId) {
          await triggerNotification({
            type: 'Like',
            to: post.userId,
            ctx,
          });
        }

        return true;
      }
    }),

  // Get all likes for a post
  getLikesPerPost: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const likes = await ctx.prisma.like.findMany({
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
