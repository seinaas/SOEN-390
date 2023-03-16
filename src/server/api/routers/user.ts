import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

/**
 * This is the user router.
 * It contains all the procedures related to users.
 * This includes searching for users, getting a user by ID, and getting a user by email.
 */
export const userRouter = createTRPCRouter({
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
});
