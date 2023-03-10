import { z } from 'zod';
import { pusherServerClient } from '../../pusher';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const chatRouter = createTRPCRouter({
  submit: protectedProcedure.input(z.object({ message: z.string() })).mutation(async ({ ctx, input }) => {
    const { message } = input;
    // const { user } = ctx.session;

    await pusherServerClient.trigger('test', 'test-event', { message });
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
