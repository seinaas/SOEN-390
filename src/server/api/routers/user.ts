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
        skills: z.string().nullish(),
        languages: z.string().nullish(),
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
  updateJob: protectedProcedure
    .input(
      z.object({
        jobId: z.string().min(1),
        title: z.string().min(1).nullish(),
        company: z.string().min(1).nullish(),
        location: z.string().nullish(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
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
        data: updateInput,
      });

      return job;
    }),

  createJob: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).nullish(),
        company: z.string().min(1).nullish(),
        location: z.string().nullish(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(ctx.session.user);
      console.log(input);

      const job = await ctx.prisma.job.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      return job;
    }),

  updateEducation: protectedProcedure
    .input(
      z.object({
        educationId: z.string().min(1),
        school: z.string().min(1).nullish(),
        degree: z.string().min(1).nullish(),
        location: z.string().nullish(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
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
        data: updateInput,
      });

      return education;
    }),

  createEducation: protectedProcedure
    .input(
      z.object({
        degree: z.string().nullish(),
        school: z.string().nullish(),
        location: z.string().nullish(),
        startDate: z.string().nullish(),
        endDate: z.string().nullish(),
        description: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      const education = await ctx.prisma.education.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });

      return education;
    }),
});
