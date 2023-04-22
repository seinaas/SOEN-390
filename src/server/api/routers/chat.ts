import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { triggerChatNotification } from '../helpers';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string(),
        isFile: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const messageToSend = await ctx.prisma.messages.create({
        data: {
          senderId: ctx.session.user.id,
          message: input.message,
          conversationId: input.conversationId,
          isFile: input.isFile,
        },
      });
      await ctx.pusher.trigger(input.conversationId, 'message-sent', {
        ...messageToSend,
        sender: { firstName: ctx.session.user.firstName, lastName: ctx.session.user.lastName },
      });

      // Send notification to all users in the conversation
      const conversation = await ctx.prisma.directMessages.findUnique({
        where: {
          id: input.conversationId,
        },
        select: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });
      if (conversation) {
        await Promise.all(
          conversation.users.map(async (user) => {
            if (user.id !== ctx.session.user.id) {
              await triggerChatNotification({
                to: user.id,
                ctx,
              });
            }
          }),
        );
      }
      return messageToSend;
    }),
  editMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        message: z.string(),
        conversationId: z.string(),
        isFile: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const messageToEdit = await ctx.prisma.messages.update({
        where: {
          id: input.messageId,
        },
        data: {
          message: input.message,
          isFile: input.isFile,
        },
      });

      return messageToEdit;
    }),
});
