import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string(), conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { message, conversationId } = input;
      // const { user } = ctx.session;

      const conversation = await ctx.prisma.directMessages.findUnique({
        where: {
          id: conversationId,
        },
      });

      if (!conversation) {
        return null;
      }

      const senderId = ctx.session.user.id;
      const receiverId = senderId === conversation.user1Id ? conversation.user2Id : conversation.user1Id;

      await ctx.prisma.messages.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          sentAt: new Date().toLocaleString(),
          message: message,
          conversationId: conversationId,
        },
      });

      await ctx.pusher.trigger(conversationId, 'message-sent', {});
    }),
  submit: protectedProcedure
    .input(z.object({ message: z.string(), senderId: z.string(), receiverId: z.string(), conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { message } = input;
      // const { user } = ctx.session;

      await ctx.pusher.trigger('test', 'test-event', { message });
    }),
});
