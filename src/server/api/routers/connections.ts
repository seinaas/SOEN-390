import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const connectionsRouter = createTRPCRouter({
  getConnection: protectedProcedure
    .input(
      z.object({
        userEmail: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const recipient = await ctx.prisma.user.findUnique({
        where: {
          email: input.userEmail,
        },
      });
      if (!recipient) {
        throw new Error('User not found');
      }

      const user1ID = recipient.id < ctx.session.user.id ? recipient.id : ctx.session.user.id;
      const user2ID = recipient.id < ctx.session.user.id ? ctx.session.user.id : recipient.id;
      const connection = await ctx.prisma.connection.findUnique({
        where: {
          user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID },
        },
      });
      if (connection) {
        if (
          (ctx.session.user.id === user1ID && connection.connectionStatus === 'Pending_1_To_2') ||
          (ctx.session.user.id === user2ID && connection.connectionStatus === 'Pending_2_To_1')
        ) {
          return {
            status: 'Sent',
          };
        } else if (
          (ctx.session.user.id === user1ID && connection.connectionStatus === 'Pending_2_To_1') ||
          (ctx.session.user.id === user2ID && connection.connectionStatus === 'Pending_1_To_2')
        ) {
          return {
            status: 'Received',
          };
        }

        return {
          status: connection.connectionStatus,
        };
      }
      return { status: '' };
    }),
  sendConnectionRequest: protectedProcedure
    .input(
      z.object({
        userEmail: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recipient = await ctx.prisma.user.findUnique({
        where: {
          email: input.userEmail,
        },
      });
      if (!recipient) {
        throw new Error('User not found');
      }

      const user1ID = recipient.id < ctx.session.user.id ? recipient.id : ctx.session.user.id;
      const user2ID = recipient.id < ctx.session.user.id ? ctx.session.user.id : recipient.id;
      return await ctx.prisma.connection.create({
        data: {
          user_1_ID: user1ID,
          user_2_ID: user2ID,
          connectionStatus: ctx.session.user.id == user1ID ? 'Pending_1_To_2' : 'Pending_2_To_1',
        },
      });
    }),

  acceptConnection: protectedProcedure
    .input(
      z.object({
        userEmail: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recipient = await ctx.prisma.user.findUnique({
        where: {
          email: input.userEmail,
        },
      });
      if (!recipient) {
        throw new Error('User not found');
      }

      const user1ID = recipient.id < ctx.session.user.id ? recipient.id : ctx.session.user.id;
      const user2ID = recipient.id < ctx.session.user.id ? ctx.session.user.id : recipient.id;
      return await ctx.prisma.connection.update({
        data: {
          connectionStatus: 'Connected',
        },
        where: {
          user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID },
        },
      });
    }),

  removeConnection: protectedProcedure
    .input(
      z.object({
        userEmail: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const recipient = await ctx.prisma.user.findUnique({
        where: {
          email: input.userEmail,
        },
      });
      if (!recipient) {
        throw new Error('User not found');
      }

      const user1ID = recipient.id < ctx.session.user.id ? recipient.id : ctx.session.user.id;
      const user2ID = recipient.id < ctx.session.user.id ? ctx.session.user.id : recipient.id;
      return await ctx.prisma.connection.delete({
        where: {
          user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID },
        },
      });
    }),
});
