import { z } from 'zod';
import { pusherServerClient } from '../../pusher';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string(), senderId: z.string(), receiverId: z.string(), conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { message, senderId, receiverId, conversationId } = input;
      // const { user } = ctx.session;

      await pusherServerClient.trigger('test', 'test-event', { message });
      const user1Id = senderId < receiverId ? senderId : receiverId;
      const user2Id = senderId < receiverId ? receiverId : senderId;
      await ctx.prisma.directMessages
        .upsert({
          where: {
            id: conversationId,
          },
          create: {
            user1Id: user1Id,
            user2Id: user2Id,
          },
          update: {},
        })
        .catch(() => {})
        .then(() => {});

      return ctx.prisma.messages.create({
        data: {
          senderId: senderId,
          receiverId: receiverId,
          sentAt: new Date().toLocaleString(),
          message: message,
          conversationId: conversationId,
        },
      });
      // TODO: Save chats to DB based on schema
      // const chat = await ctx.prisma.chat.create({
      //   data: {
      //     message,
      //     user: {
      //       connect: {
      //         id: user.id,
      //       },
      //     },
      //   },
      // });
      // return chat;
    }),
});
