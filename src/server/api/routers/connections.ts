import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

const getRecipient = async ({ prisma, email }: { prisma: PrismaClient; email: string }) => {
  const recipient = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!recipient) {
    throw new Error('User not found');
  }

  return recipient;
};

const getCorrectUserOrder = (user1ID: string, user2ID: string) => {
  return user1ID < user2ID ? { user1ID, user2ID } : { user1ID: user2ID, user2ID: user1ID };
};

export const connectionsRouter = createTRPCRouter({
  getUserConnections: protectedProcedure.input(z.object({ userEmail: z.string() })).query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: input.userEmail,
      },
      include: {
        connections: {
          where: { connectionStatus: 'Connected' },
          include: {
            user1: true,
            user2: true,
          },
        },
        connectionOf: {
          where: { connectionStatus: 'Connected' },
          include: {
            user1: true,
            user2: true,
          },
        },
      },
    });

    if (user) {
      const connections = user.connections
        .filter((connection) => connection.connectionStatus === 'Connected')
        .map((connection) => {
          const otherUser = connection.user1.id === user.id ? connection.user2 : connection.user1;
          return {
            id: otherUser.id,
            job: otherUser.job,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            image: otherUser.image,
            email: otherUser.email,
          };
        });
      const connectionsOf = user.connectionOf
        .filter((connection) => connection.connectionStatus === 'Connected')
        .map((connection) => {
          const otherUser = connection.user1.id === user.id ? connection.user2 : connection.user1;
          return {
            id: otherUser.id,
            job: otherUser.job,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            image: otherUser.image,
            email: otherUser.email,
          };
        });
      return [...connections, ...connectionsOf];
    }
  }),
  getConnectionStatus: protectedProcedure
    .input(
      z.object({
        userEmail: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const recipient = await getRecipient({ prisma: ctx.prisma, email: input.userEmail });

      const { user1ID, user2ID } = getCorrectUserOrder(ctx.session.user.id, recipient.id);

      const connection = await ctx.prisma.connection.findUnique({
        where: {
          user1Id_user2Id: { user1Id: user1ID, user2Id: user2ID },
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
      const recipient = await getRecipient({ prisma: ctx.prisma, email: input.userEmail });

      const { user1ID, user2ID } = getCorrectUserOrder(ctx.session.user.id, recipient.id);

      return await ctx.prisma.connection.create({
        data: {
          user1Id: user1ID,
          user2Id: user2ID,
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
      const recipient = await getRecipient({ prisma: ctx.prisma, email: input.userEmail });

      const { user1ID, user2ID } = getCorrectUserOrder(ctx.session.user.id, recipient.id);

      return await ctx.prisma.connection.update({
        data: {
          connectionStatus: 'Connected',
        },
        where: {
          user1Id_user2Id: { user1Id: user1ID, user2Id: user2ID },
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
      const recipient = await getRecipient({ prisma: ctx.prisma, email: input.userEmail });

      const { user1ID, user2ID } = getCorrectUserOrder(ctx.session.user.id, recipient.id);

      return await ctx.prisma.connection.delete({
        where: {
          user1Id_user2Id: { user1Id: user1ID, user2Id: user2ID },
        },
      });
    }),
});
