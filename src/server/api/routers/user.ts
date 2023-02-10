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
      const user = await ctx.prisma.user.findFirst({
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
});
