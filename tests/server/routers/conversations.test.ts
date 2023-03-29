import { type TRPCError } from '@trpc/server';
import { createUser, trpcRequest } from '../../utils';

describe('conversations', () => {
  describe('getUserConversations', () => {
    it('should return empty array if user does not exist', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);

      const data = await request.caller.conversation.getUserConversations({ userEmail: '' });
      expect(data).toEqual([]);
    });
    it('should return empty array if user has no connections', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      const userBase = createUser();

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        ...userBase,
        id: '1',
        DirectMessages: [],
      } as any);

      const data = await request.caller.conversation.getUserConversations({ userEmail: '' });

      expect(data).toEqual([]);
    });
    it('should return a list of conversations', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      const userBase = createUser();

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        ...userBase,
        id: '1',
        jobs: [],
        education: [],
        DirectMessages: [
          {
            id: '1',
            users: [
              { id: '1', email: 'hello@hotmail.com' },
              { id: '2', email: 'hello2@hotmail.com' },
            ],
            messages: [{ id: '1', message: 'hello', senderId: '1', conversationId: '1' }],
          },
        ],
      } as any);

      const data = await request.caller.conversation.getUserConversations({ userEmail: '' });

      expect(data[0]).toEqual({
        id: '1',
        users: [{ email: 'hello@hotmail.com' }, { email: 'hello2@hotmail.com' }],
        messages: [{ id: '1', message: 'hello', senderId: '1', conversationId: '1' }],
      });
    });
    it('should return a list of messages', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      const messages = [
        {
          id: '1',
          message: 'hello',
          senderId: '1',
          conversationId: '1',
          sender: {
            firstName: 'test1',
            lastName: 'testLastName',
          },
        },
        {
          id: '2',
          message: 'hello back',
          senderId: '2',
          conversationId: '1',
          sender: {
            firstName: 'test2',
            lastName: 'test2LastName',
          },
        },
      ];

      request.ctx.prisma.messages.findMany.mockResolvedValueOnce(messages as any);

      const data = await request.caller.conversation.getConversationMessages({ id: '1' });

      expect(data[0]).toEqual({
        id: '1',
        message: 'hello',
        senderId: '1',
        conversationId: '1',
        sender: {
          firstName: 'test1',
          lastName: 'testLastName',
        },
      });
      expect(data?.length == messages.length);
    });
  });
  describe('editConversation', () => {
    it('should remove user from convo', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);

      try {
        await request.caller.connections.getConnectionStatus({ userEmail: 'john@doe.com' });
      } catch (e) {
        expect((e as TRPCError).message).toEqual('User not found');
      }
    });
    it('should remove user from convo', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      const userBase = createUser();
      const update = jest.spyOn(request.ctx.prisma.directMessages, 'update').mockImplementation();
      request.ctx.prisma.user.findFirst.mockResolvedValueOnce({
        ...userBase,
        id: '1',
        jobs: [],
        education: [],
        DirectMessages: [
          {
            id: '1',
            users: [
              { id: '1', email: 'hello@hotmail.com' },
              { id: '2', email: 'hello2@hotmail.com' },
              { id: '3', email: 'hello3@hotmail.com' },
            ],
            messages: [{ id: '1', message: 'hello', senderId: '1', conversationId: '1' }],
          },
        ],
      } as any);

      await request.caller.conversation.removeFromConversation({ userId: '1', conversationId: '1' });

      expect(update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          users: {
            disconnect: { id: '1' },
          },
        },
        include: {
          users: true,
        },
      });
    });
    it('should add a user to a convo', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const update = jest.spyOn(request.ctx.prisma.directMessages, 'update').mockImplementation();

      await request.caller.conversation.addToConversation({ usersEmail: ['email'], conversationId: '1' });
      expect(update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          users: {
            connect: [{ email: 'email' }],
          },
        },
        include: {
          users: true,
        },
      });
    });
    it('should delete convo when only 1 user left in it', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const update = jest.spyOn(request.ctx.prisma.directMessages, 'update').mockImplementation();
      const del = jest.spyOn(request.ctx.prisma.directMessages, 'delete').mockImplementation();
      request.ctx.prisma.directMessages.findFirst.mockResolvedValueOnce({
        id: '1',
        users: [
          { id: '1', email: 'hello@hotmail.com' },
          { id: '2', email: 'hello2@hotmail.com' },
        ],
        messages: [{ id: '1', message: 'hello', senderId: '1', conversationId: '1' }],
      } as any);

      await request.caller.conversation.removeFromConversation({ userId: '1', conversationId: '1' });

      expect(update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          users: {
            disconnect: [{ id: '1' }, { id: '2' }],
          },
        },
        include: {
          users: true,
        },
      });
      expect(del).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });
    });
  });
  // it('should return status Connected if connection request was accepted', async () => {
  //   const request = trpcRequest({ user: { id: '1' }, expires: '' });

  //   const userBase = createUser();
  //   const userInput = {
  //     ...userBase,
  //     id: '2',
  //     _count: {
  //       connections: 0,
  //       connectionOf: 0,
  //     },
  //   };

  //   request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);
  //   request.ctx.prisma.connection.findUnique.mockResolvedValueOnce({
  //     user1Id: '1',
  //     user2Id: '2',
  //     connectionStatus: 'Connected',
  //   });

  //   const data = await request.caller.connections.getConnectionStatus({ userEmail: '' });
  //   expect(data).toEqual({ status: 'Connected' });
  // });
  // it('should return empty status if there is no connection', async () => {
  //   const request = trpcRequest({ user: { id: '1' }, expires: '' });

  //   const userBase = createUser();
  //   const userInput = {
  //     ...userBase,
  //     id: '2',
  //     _count: {
  //       connections: 0,
  //       connectionOf: 0,
  //     },
  //   };

  //   request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);
  //   request.ctx.prisma.connection.findUnique.mockResolvedValueOnce(null);

  //   const data = await request.caller.connections.getConnectionStatus({ userEmail: '' });
  //   expect(data).toEqual({ status: '' });
  // });
});

//   describe('sendConnectionRequest', () => {
//     it('should set connection status to Pending_1_to_2 if requester id is less than recipient id', async () => {
//       const request = trpcRequest({ user: { id: '1' }, expires: '' });
//       const userBase = createUser();
//       const userInput = {
//         ...userBase,
//         id: '2',
//         _count: {
//           connections: 0,
//           connectionOf: 0,
//         },
//       };

//       const create = jest.spyOn(request.ctx.prisma.connection, 'create').mockImplementation();
//       request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

//       await request.caller.connections.sendConnectionRequest({ userEmail: '' });

//       expect(create).toHaveBeenCalledWith({
//         data: {
//           connectionStatus: 'Pending_1_To_2',
//           user1Id: '1',
//           user2Id: '2',
//         },
//       });
//     });
//     it('should set connection status to Pending_2_to_1 if requester id is greater than recipient id', async () => {
//       const request = trpcRequest({ user: { id: '2' }, expires: '' });
//       const userBase = createUser();
//       const userInput = {
//         ...userBase,
//         id: '1',
//         _count: {
//           connections: 0,
//           connectionOf: 0,
//         },
//       };

//       const create = jest.spyOn(request.ctx.prisma.connection, 'create').mockImplementation();
//       request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

//       await request.caller.connections.sendConnectionRequest({ userEmail: '' });

//       expect(create).toHaveBeenCalledWith({
//         data: {
//           connectionStatus: 'Pending_2_To_1',
//           user1Id: '1',
//           user2Id: '2',
//         },
//       });
//     });
//   });
//   describe('acceptConnection', () => {
//     it('should set connection status to Connected', async () => {
//       const request = trpcRequest({ user: { id: '1' }, expires: '' });
//       const userBase = createUser();
//       const userInput = {
//         ...userBase,
//         id: '2',
//         _count: {
//           connections: 0,
//           connectionOf: 0,
//         },
//       };

//       const update = jest.spyOn(request.ctx.prisma.connection, 'update').mockImplementation();
//       request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

//       await request.caller.connections.acceptConnection({ userEmail: '' });

//       expect(update).toHaveBeenCalledWith({
//         data: {
//           connectionStatus: 'Connected',
//         },
//         where: {
//           user1Id_user2Id: { user1Id: '1', user2Id: '2' },
//         },
//       });
//     });
//   });
//   describe('removeConnection', () => {
//     it('should set delete connection', async () => {
//       const request = trpcRequest({ user: { id: '1' }, expires: '' });
//       const userBase = createUser();
//       const userInput = {
//         ...userBase,
//         id: '2',
//         _count: {
//           connections: 0,
//           connectionOf: 0,
//         },
//       };

//       const del = jest.spyOn(request.ctx.prisma.connection, 'delete').mockImplementation();
//       request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

//       await request.caller.connections.removeConnection({ userEmail: '' });

//       expect(del).toHaveBeenCalledWith({
//         where: {
//           user1Id_user2Id: { user1Id: '1', user2Id: '2' },
//         },
//       });
//     });
//   });
