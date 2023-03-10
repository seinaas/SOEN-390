import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';


export const conversationsRouter = createTRPCRouter({
    getUserConversations: protectedProcedure.input(z.object({ userEmail: z.string() })).query(async ({ input, ctx }) => {
        const user = await ctx.prisma.user.findUnique({
            where: {
                email: input.userEmail,
            },
            include: {
                DirectMessagesTo: {
                    include: {
                        user1: true,
                        user2: true,
                        messages: true,
                    },
                },
                DirectMessagesFrom: {
                    include: {
                        user1: true,
                        user2: true,
                        messages: true,
                    },
                },
            },
        });

        if (user) {
            const conversations = [...user.DirectMessagesTo, ...user.DirectMessagesFrom];
            return conversations;
        }
        return [];
    }),

    getConversationMessages: protectedProcedure.input(z.object({
        id: z.string(),
    })).query(async ({ input, ctx }) => {
        const messages = await ctx.prisma.messages.findMany({
            where: {
                conversationId: input.id
            },
            orderBy: {
                sentAt: 'asc'
            },
            include: {
                sender: true,
                receiver: true,
            }
        });
        return messages;
    })
});
