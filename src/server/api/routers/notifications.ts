/*
 *		Notifications Router
 *
 *
 *		This file exports a notifications router containing procedures related to notifications. The procedures include getting the number of notifications, getting all notifications,
 *		updating a notification, marking all notifications as seen, clearing a notification, clearing all notifications, getting the current user's muted notification preferences, and
 *		updating the current user's muted notification preferences. These procedures are wrapped in a TRPC router and use a Prisma client to interact with the database. The router is
 *		protected and can only be accessed by authenticated users.
 */
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { NotificationType } from '@prisma/client';

export const notificationsRouter = createTRPCRouter({
  // Get the number of notifications for the current user
  getNotificationCount: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.prisma.notification.findMany({
      where: {
        userId: ctx.session.user.id,
        seen: false,
      },
    });
    return notifications.length;
  }),
  // Get all notifications for the current user
  getNotifications: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().nullish() }).nullish())
    .query(async ({ input, ctx }) => {
      const notifications = await ctx.prisma.notification.findMany({
        where: {
          userId: ctx.session.user.id,
          seen: input?.unreadOnly ? false : undefined,
        },
        include: {
          Sender: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
      return notifications;
    }),
  // Update a notification
  updateNotification: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.nativeEnum(NotificationType).nullish(),
        seen: z.boolean().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, type, seen } = input;
      const notification = await ctx.prisma.notification.update({
        where: {
          id,
        },
        data: {
          type: type as NotificationType,
          seen: !!seen,
        },
      });
      return notification;
    }),
  // Mark all notifications as seen
  markAllAsSeen: protectedProcedure.mutation(async ({ ctx }) => {
    const notifications = await ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        seen: false,
      },
      data: {
        seen: true,
      },
    });
    return notifications;
  }),
  clearNotification: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const notification = await ctx.prisma.notification.delete({
      where: {
        id: input.id,
      },
    });
    return notification;
  }),
  // Clear all notifications
  clearAll: protectedProcedure.mutation(async ({ ctx }) => {
    const notifications = await ctx.prisma.notification.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return notifications;
  }),
  // Get the current user's muted notification preferences
  getMutedNotificationTypes: protectedProcedure.query(async ({ ctx }) => {
    const mutedNotificationTypes = await ctx.prisma.mutedNotificationTypes.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return mutedNotificationTypes.map((notif) => notif.type);
  }),
  // Update the current user's muted notification preferences
  updateMutedNotificationTypes: protectedProcedure
    .input(z.array(z.nativeEnum(NotificationType)))
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.session.user;
      await ctx.prisma.mutedNotificationTypes.deleteMany({
        where: {
          userId: id,
        },
      });
      const newMutedNotificationTypes = await ctx.prisma.mutedNotificationTypes.createMany({
        data: input.map((mutedNotificationType) => ({
          userId: id,
          type: mutedNotificationType,
        })),
      });
      return newMutedNotificationTypes;
    }),
});
