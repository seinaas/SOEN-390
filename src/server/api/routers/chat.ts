import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const messageToSend = await ctx.prisma.messages.create({
        data: {
          senderId: ctx.session.user.id,
          message: input.message,
          conversationId: input.conversationId,
        },
      });
      await ctx.pusher.trigger(input.conversationId, 'message-sent', {
        ...messageToSend,
        sender: { firstName: ctx.session.user.firstName, lastName: ctx.session.user.lastName },
      });
      return messageToSend;
    }),
});
