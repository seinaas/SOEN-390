import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import type { Post } from '@prisma/client';

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string(),
        post: z.custom<Post>().optional(),
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const messageToSend = await ctx.prisma.messages.create({
        data: {
          senderId: ctx.session.user.id,
          message: input.message,
          embeddedPostId: input.post?.id,
          conversationId: input.conversationId,
        },
        include: {
          embeddedPost: {
            include: {
              User: true,
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          },
        },
      });
      await ctx.pusher.trigger(input.conversationId, 'message-sent', {
        ...messageToSend,
        sender: { firstName: ctx.session.user.firstName, lastName: ctx.session.user.lastName },
      });
      return messageToSend;
    }),
});
