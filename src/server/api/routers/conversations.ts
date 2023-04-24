import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const conversationsRouter = createTRPCRouter({
  createConversationFromEmails: protectedProcedure.input(z.array(z.string())).mutation(async ({ ctx, input }) => {
    let existingConversationId = null;
    input.push(ctx?.session?.user?.email || '');
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
    conversations?.forEach((conversation) => {
      if (JSON.stringify(conversation.users.map((user) => user.email).sort()) === JSON.stringify(input.sort())) {
        existingConversationId = conversation?.id;
      }
    });
    if (existingConversationId !== null) {
      return existingConversationId;
    }
    const conversation = await ctx.prisma.directMessages.create({
      data: {
        users: {
          connect: input.map((email) => ({ email: email })),
        },
      },
      include: {
        users: {
          select: {
            email: true,
          },
        },
      },
    });
    return conversation;
  }),
  getUserConversations: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        email: ctx?.session?.user?.email,
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
        users: convo.users.filter((user) => user.id !== ctx.session.user.id),
      }));
    }
    return [];
  }),

  addToConversation: protectedProcedure
    .input(z.object({ usersEmail: z.array(z.string()), conversationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.directMessages.update({
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
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const convo = await ctx.prisma.directMessages.findFirst({
        where: {
          id: input.conversationId,
        },
        include: {
          users: true,
        },
      });
      const newConvoUsers = convo?.users?.filter((user) => user.id !== ctx?.session?.user?.id);
      if (newConvoUsers?.length && newConvoUsers.length <= 1) {
        await ctx.prisma.directMessages.update({
          where: {
            id: input.conversationId,
          },
          data: {
            users: {
              disconnect: [{ id: ctx?.session?.user?.id }, { id: newConvoUsers[0]?.id }],
            },
          },
          include: {
            users: true,
          },
        });
        await ctx.prisma.messages.deleteMany({
          where: {
            conversationId: input.conversationId,
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
              disconnect: { id: ctx?.session?.user?.id },
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
          embeddedPost: {
            include: {
              _count: {
                select: {
                  comments: true,
                  likes: true,
                },
              },
              User: {
                select: {
                  firstName: true,
                  lastName: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      return messages;
    }),
});
