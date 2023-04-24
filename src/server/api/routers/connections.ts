/*
*		Connections Router
*
*
*		This file implements several procedures related to connections in a TRPC router. It includes procedures for getting user connections, 
*		getting the connection status for a user, and sending a connection request. It uses Zod for input validation and the Prisma ORM for database operations. 
*		There are also some helper functions for triggering notifications.
*/
import { type PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { triggerNotification, triggerNotificationRefresh } from '../helpers';

// Retrieve the recipient of a connection request
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

// Return the smaller ID first
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
            user1: {
              include: {
                jobs: true,
                education: true,
              },
            },
            user2: {
              include: {
                jobs: true,
                education: true,
              },
            },
          },
        },
        connectionOf: {
          where: { connectionStatus: 'Connected' },
          include: {
            user1: {
              include: {
                jobs: true,
                education: true,
              },
            },
            user2: {
              include: {
                jobs: true,
                education: true,
              },
            },
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
            headline: otherUser.headline,
            jobs: otherUser.jobs,
            education: otherUser.education,
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
            headline: otherUser.headline,
            jobs: otherUser.jobs,
            education: otherUser.education,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            image: otherUser.image,
            email: otherUser.email,
          };
        });
      return [...connections, ...connectionsOf];
    }
    return [];
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

      const res = await ctx.prisma.connection.create({
        data: {
          user1Id: user1ID,
          user2Id: user2ID,
          connectionStatus: ctx.session.user.id == user1ID ? 'Pending_1_To_2' : 'Pending_2_To_1',
        },
      });

      await triggerNotification({
        type: 'ConnectionRequest',
        to: recipient.id,
        route: ctx.session.user.email && `/u/${ctx.session.user.email}`,
        ctx,
      });

      return res;
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

      const res = await ctx.prisma.connection.update({
        data: {
          connectionStatus: 'Connected',
        },
        where: {
          user1Id_user2Id: { user1Id: user1ID, user2Id: user2ID },
        },
      });

      await triggerNotification({
        type: 'ConnectionAccepted',
        to: recipient.id,
        route: ctx.session.user.email && `/u/${ctx.session.user.email}`,
        ctx,
      });

      return res;
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

      const res = await ctx.prisma.connection.delete({
        where: {
          user1Id_user2Id: { user1Id: user1ID, user2Id: user2ID },
        },
      });

      await ctx.prisma.notification.deleteMany({
        where: {
          type: 'ConnectionRequest',
          senderId: res.connectionStatus === 'Pending_1_To_2' ? user1ID : user2ID,
          userId: res.connectionStatus === 'Pending_1_To_2' ? user2ID : user1ID,
        },
      });

      await triggerNotificationRefresh({ ctx, to: recipient.id });

      return res;
    }),
});
