import type { User } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const conversationsRouter = createTRPCRouter({
  createConversation: protectedProcedure.input(z.array(z.custom<User>())).mutation(async ({ ctx, input }) => {
    const conversation = await ctx.prisma.directMessages.create({
      data: {
        users: {
          connect: input.map((user) => ({ id: user.id })),
        },
      },
    });
    return conversation;
  }),

  createConversationFromEmails: protectedProcedure.input(z.array(z.string())).mutation(async ({ ctx, input }) => {
    let exists = false;
    const conversations = await ctx.prisma.directMessages.findMany({
      where: {
        users: {
          every: {
            email: {
              in: input,
            },
          },
        },
      },
      include: {
        users: true,
      },
    });
    conversations.forEach((conversation) => {
      if (JSON.stringify(conversation.users.map((user) => user.email).sort()) === JSON.stringify(input.sort())) {
        exists = true;
      }
    });
    if (!exists) {
      const conversation = await ctx.prisma.directMessages.create({
        data: {
          users: {
            connect: input.map((email) => ({ email: email })),
          },
        },
      });
      return conversation;
    }
    return 'Already exists';
  }),
  getUserConversations: protectedProcedure.input(z.object({ userEmail: z.string() })).query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: input.userEmail,
      },
      include: {
        DirectMessages: {
          include: {
            users: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (user) {
      return user.DirectMessages.map((convo) => ({
        ...convo,
        users: convo.users
          .filter((user) => user.id !== ctx.session.user.id)
          .map((user) => {
            const { id, ...userWithoutId } = user;
            return userWithoutId;
          }),
      }));
    }
    return [];
  }),

  addToConversation: protectedProcedure
    .input(z.object({ usersEmail: z.array(z.string()), conversationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.directMessages.update({
        where: {
          id: input.conversationId,
        },
        data: {
          users: {
            connect: input.usersEmail.map((userEmail) => {
              return { email: userEmail };
            }),
          },
        },
        include: {
          users: true,
        },
      });
    }),

  removeFromConversation: protectedProcedure
    .input(z.object({ userId: z.string(), conversationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const convo = await ctx.prisma.directMessages.findFirst({
        where: {
          id: input.conversationId,
        },
        include: {
          users: true,
        },
      });
      const newConvoUsers = convo?.users.filter((user) => user.id !== input.userId);
      if (newConvoUsers?.length && newConvoUsers.length <= 1) {
        await ctx.prisma.directMessages.update({
          where: {
            id: input.conversationId,
          },
          data: {
            users: {
              disconnect: [{ id: input.userId }, { id: newConvoUsers[0]?.id }],
            },
          },
          include: {
            users: true,
          },
        });
        await ctx.prisma.directMessages.delete({
          where: {
            id: input.conversationId,
          },
        });
      } else {
        await ctx.prisma.directMessages.update({
          where: {
            id: input.conversationId,
          },
          data: {
            users: {
              disconnect: { id: input.userId },
            },
          },
          include: {
            users: true,
          },
        });
      }
    }),

  getConversationMessages: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const messages = await ctx.prisma.messages.findMany({
        where: {
          conversationId: input.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return messages;
    }),
});
