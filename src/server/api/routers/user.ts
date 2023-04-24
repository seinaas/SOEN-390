/*
*		User Router
*
*
*		This is a user router that contains procedures related to searching for users, getting users by email or ID, and updating user data. 
*		It uses the Prisma ORM and Zod for input validation. Some procedures are protected and require authentication, while others are public. 
*		The procedures return different information such as user profiles, jobs, education, and connection counts. The router also includes raw 
*		SQL queries for user searching.
*/
import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

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
  // Add education to a user
  addEducation: protectedProcedure
    .input(
      z.object({
        degree: z.string().min(1),
        school: z.string().min(1),
        location: z.string().nullish(),
        startDate: z.date(),
        endDate: z.date().nullish(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const education = await ctx.prisma.education.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      return education;
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
});
