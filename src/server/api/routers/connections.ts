import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const connectionsRouter = createTRPCRouter({
  getConnection: protectedProcedure
    .input(
      z.object({
        user_1_ID: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user1ID = input.user_1_ID < ctx.session.user.id ? input.user_1_ID : ctx.session.user.id;
      const user2ID = input.user_1_ID < ctx.session.user.id ? ctx.session.user.id : input.user_1_ID;
      const connection = await ctx.prisma.connection.findUnique({
        where: {
          user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID },
        },
      });
      if (connection) {
        return {
          status: connection.connection_Status.includes('Pending') ? 'Pending' : connection.connection_Status,
        };
      }
      return { status: '' };
    }),
  sendConnectionRequest: protectedProcedure
    .input(
      z.object({
        user_1_ID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user1ID = input.user_1_ID < ctx.session.user.id ? input.user_1_ID : ctx.session.user.id;
      const user2ID = input.user_1_ID < ctx.session.user.id ? ctx.session.user.id : input.user_1_ID;
      return await ctx.prisma.connection.create({
        data: {
          user_1_ID: user1ID,
          user_2_ID: user2ID,
          connection_Status: ctx.session.user.id == user1ID ? 'Pending_1_To_2' : 'Pending_2_To_1',
        },
      });
    }),

  addConnection: protectedProcedure
    .input(
      z.object({
        user_1_ID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user1ID = input.user_1_ID < ctx.session.user.id ? input.user_1_ID : ctx.session.user.id;
      const user2ID = input.user_1_ID < ctx.session.user.id ? ctx.session.user.id : input.user_1_ID;
      return await ctx.prisma.connection.upsert({
        create: {
          user_1_ID: user1ID,
          user_2_ID: user2ID,
          connection_Status: 'Connected',
        },
        update: {
          connection_Status: 'Connected',
        },
        where: {
          user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID },
        },
      });
    }),

  removeConnection: protectedProcedure
    .input(
      z.object({
        user_1_ID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user1ID = input.user_1_ID < ctx.session.user.id ? input.user_1_ID : ctx.session.user.id;
      const user2ID = input.user_1_ID < ctx.session.user.id ? ctx.session.user.id : input.user_1_ID;
      return await ctx.prisma.connection.delete({
        where: {
          user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID },
        },
      });
    }),
});
