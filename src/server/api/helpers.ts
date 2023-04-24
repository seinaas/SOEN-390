/*
*		Notifications Helper Functions
*
*
*		This file is a collection of helper functions to trigger notifications to specific users. It exports two functions: triggerNotification and triggerNotificationRefresh. 
*		The triggerNotification function takes in parameters such as the notification type, recipient, content, route, and context to create and send a notification to the 
*		recipient using Pusher. It checks if the user is muted or has a session before sending the notification. The triggerNotificationRefresh function sends a notification 
*		refresh to the specified recipient using Pusher.
*/
import { type createInnerTRPCContext } from './trpc';
import { type NotificationType } from '@prisma/client';

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
