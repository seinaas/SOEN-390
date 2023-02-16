import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getByEmail: publicProcedure.input(z.object({ email: z.string() })).query(async ({ ctx, input }) => {
    return await ctx.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });
  }),
  sendConnectionRequest: protectedProcedure.input(z.object({
    user_1_ID: z.string(),
    user_2_ID: z.string(),
  })).query(async ({ ctx, input }) => {
    const user1ID = input.user_1_ID < input.user_2_ID ? input.user_1_ID : input.user_2_ID
    const user2ID = input.user_1_ID < input.user_2_ID ? input.user_2_ID : input.user_1_ID
    return await ctx.prisma.connection.create({
      data: {
        user_1_ID: user1ID,
        user_2_ID: user2ID,
        connection_Status: ctx.session.user.id == user1ID ? 'Pending_1_To_2' : 'Pending_2_To_1'
      }
    })
  }),

  addConnection: publicProcedure.input(z.object({
    user_1_ID: z.string(),
    user_2_ID: z.string(),
  })).query(async ({ ctx, input }) => {
    const user1ID = input.user_1_ID < input.user_2_ID ? input.user_1_ID : input.user_2_ID
    const user2ID = input.user_1_ID < input.user_2_ID ? input.user_2_ID : input.user_1_ID
    return await ctx.prisma.connection.upsert({
      create: {
        user_1_ID: input.user_1_ID,
        user_2_ID: input.user_2_ID,
        connection_Status: 'Connected'
      },
      update: {
        connection_Status: 'Connected'
      },
      where: {
        user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID }
      }
    })
  }),

  removeConnection: protectedProcedure.input(z.object({
    user_1_ID: z.string(),
    user_2_ID: z.string(),
  })).query(async ({ ctx, input }) => {
    const user1ID = input.user_1_ID < input.user_2_ID ? input.user_1_ID : input.user_2_ID
    const user2ID = input.user_1_ID < input.user_2_ID ? input.user_2_ID : input.user_1_ID
    return await ctx.prisma.connection.delete({
      where: {
        user_1_ID_user_2_ID: { user_1_ID: user1ID, user_2_ID: user2ID }
      }
    })
  }),
});
