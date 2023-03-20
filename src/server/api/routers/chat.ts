import type { User } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        senderId: z.string(),
        conversationId: z.string(),
        sender: z.object({ firstName: z.string(), lastName: z.string() }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { message, senderId, conversationId, sender } = input;
      // const { user } = ctx.session;
      // We could allow the user to send a message before having to create a convo
      // await ctx.prisma.directMessages
      //   .upsert({
      //     where: {
      //       id: conversationId,
      //     },
      //     create: {
      //       users: {
      //         connect: [ctx.session.user].map((participant) => ({ id: participant.id })),
      //       },
      //       id: conversationId,
      //     },
      //     update: {},
      //   })
      //   .catch((e) => {
      //     console.log(e);
      //   })
      //   .then((res) => {
      //     console.log(res);
      //   });

      const messageToSend = await ctx.prisma.messages.create({
        data: {
          senderId: senderId,
          message: message,
          conversationId: conversationId,
        },
      });
      await ctx.pusher.trigger(conversationId, 'message-sent', {
        ...messageToSend,
        sender: { firstName: sender.firstName, lastName: sender.lastName },
      });
      return messageToSend;
    }),
});
