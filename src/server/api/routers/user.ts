import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

/**
 * This is the user router.
 * It contains all the procedures related to users.
 * This includes searching for users, getting a user by ID, and getting a user by email.
 */
export const userRouter = createTRPCRouter({
  // Update user job data
  updateJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string().min(1),
        title: z.string().min(1).nullish(),
        company: z.string().min(1).nullish(),
        location: z.string().nullish(),
        startDate: z.date().nullish(),
        endDate: z.date().nullish(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'jobId'> & Partial<Pick<typeof input, 'jobId'>> = {
        ...input,
      };
      delete updateInput.jobId;

      const job = await ctx.prisma.job.update({
        where: {
          jobId: input.jobId,
        },
        data: {
          ...updateInput,
          title: updateInput.title ?? undefined,
          company: updateInput.company ?? undefined,
          startDate: updateInput.startDate ?? undefined,
        },
      });

      return job;
    }),
  // Add a job to a user
  addJob: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        company: z.string().min(1),
        location: z.string().nullish(),
        startDate: z.date(),
        endDate: z.date().nullish(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const job = await ctx.prisma.job.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      return job;
    }),
  // Update user education data
  updateEducation: protectedProcedure
    .input(
      z.object({
        educationId: z.string().min(1),
        school: z.string().min(1).nullish(),
        degree: z.string().min(1).nullish(),
        location: z.string().nullish(),
        startDate: z.date().nullish(),
        endDate: z.date().nullish(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updateInput: Omit<typeof input, 'educationId'> & Partial<Pick<typeof input, 'educationId'>> = {
        ...input,
      };
      delete updateInput.educationId;

      const education = await ctx.prisma.education.update({
        where: {
          educationId: input.educationId,
        },
        data: {
          ...updateInput,
          school: updateInput.school ?? undefined,
          degree: updateInput.degree ?? undefined,
          startDate: updateInput.startDate ?? undefined,
        },
      });

      return education;
    }),
  // Search for users by name
  search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
    if (input.query.length < 3) {
      return null;
    }
    // Split query into array of words
    const searchArray = input.query
      .toLowerCase()
      .trim()
      .split(' ')
      .map((s) => `%${s}%`);

    // Raw query to search for users
    const users = await ctx.prisma.$queryRaw`
      SELECT firstName, lastName, email, image, headline
      FROM User
      WHERE lower(concat(firstName, lastName))
      LIKE ${Prisma.join(searchArray, ' AND lower(concat(firstName, lastName)) LIKE ')}
    `;

    // Need to cast type because of raw query
    return users as {
      firstName: string;
      lastName: string;
      email: string;
      image: string;
      headline: string;
    }[];
  }),
  // Query a user by email
  getByEmail: publicProcedure.input(z.object({ email: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: input.email,
      },
      include: {
        jobs: true,
        education: true,
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
      const res = (({ id, _count, ...u }) => u)(user);
      return {
        ...res,
        languages: user.languages ? user.languages.split(',') : [],
        skills: user.skills ? user.skills.split(',') : [],
        numConnections: user._count.connections + user._count.connectionOf,
      };
    }
  }),
  // Query a user by ID
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
          jobs: true,
          education: true,
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
        const res = (({ id, _count, ...u }) => u)(user);
        return {
          ...res,
          languages: user.languages ? user.languages.split(',') : [],
          skills: user.skills ? user.skills.split(',') : [],
          numConnections: user._count.connections + user._count.connectionOf,
        };
      }
    }),
  // Update user data
  update: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).nullish(),
        lastName: z.string().min(1).nullish(),
        bio: z.string().nullish(),
        skills: z.array(z.string()).nullish(),
        languages: z.array(z.string()).nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          ...input,
          skills: input.skills?.join(','),
          languages: input.languages?.join(','),
        },
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
