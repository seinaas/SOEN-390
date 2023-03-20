import type { User } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string(), conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { message, conversationId } = input;
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
