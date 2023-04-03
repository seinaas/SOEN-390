import { type createInnerTRPCContext } from './trpc';
import { type NotificationType } from '@prisma/client';

/**
 * This file contains helper functions used to trigger notifications
 * to particular users.
 */

type NotificationParams = {
  type: NotificationType;
  to: string;
  content: string;
  route?: string;
  ctx: ReturnType<typeof createInnerTRPCContext>;
};
export const triggerNotification = async ({ type, to, content, route, ctx }: NotificationParams) => {
  const muted = await ctx.prisma.mutedNotificationTypes.findUnique({
    where: {
      userId_type: {
        userId: to,
        type,
      },
    },
  });

  if (ctx.session?.user?.id && !muted && ctx.session.user.id !== to) {
    await ctx.prisma.notification.create({
      data: {
        type,
        senderId: ctx.session.user.id,
        userId: to,
        content,
        route,
      },
    });
    await ctx.pusher.sendToUser(to, 'notification', { content });
  }
};

type NotificationRefreshParams = {
  ctx: ReturnType<typeof createInnerTRPCContext>;
  to: string;
};
export const triggerNotificationRefresh = async ({ to, ctx }: NotificationRefreshParams) => {
  await ctx.pusher.sendToUser(to, 'notification-refresh', {});
};
