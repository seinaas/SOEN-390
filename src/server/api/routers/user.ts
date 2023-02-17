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
});
