import { type TRPCError } from '@trpc/server';
import { createUser, trpcRequest } from '../../utils';

describe('connections', () => {
  describe('getUserConnections', () => {
    it('should return empty array if user does not exist', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);

      const data = await request.caller.connections.getUserConnections({ userEmail: '' });
      expect(data).toEqual([]);
    });
    it('should return empty array if user has no connections', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      const userBase = createUser();

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        ...userBase,
        id: '1',
        connections: [],
        connectionOf: [],
      } as any);

      const data = await request.caller.connections.getUserConnections({ userEmail: '' });

      expect(data).toEqual([]);
    });
    it('should merge connections and connectionsOf fields and return a list of connections', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      const userBase = createUser();

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce({
        ...userBase,
        id: '1',
        jobs: [],
        education: [],
        connections: [
          {
            user1: { ...userBase, id: '2' },
            user2: { id: '1' },
            connectionStatus: 'Connected',
          },
          {
            user1: { id: '1' },
            user2: { ...userBase, id: '3' },
            connectionStatus: 'Connected',
          },
        ],
        connectionOf: [
          {
            user1: { ...userBase, id: '4' },
            user2: { id: '1' },
            connectionStatus: 'Connected',
          },
        ],
      } as any);

      const data = await request.caller.connections.getUserConnections({ userEmail: '' });

      const expectedUser = {
        jobs: userBase.jobs,
        education: userBase.education,
        headline: userBase.headline,
        firstName: userBase.firstName,
        lastName: userBase.lastName,
        image: userBase.image,
        email: userBase.email,
      };
      expect(data).toEqual([
        {
          id: '2',
          ...expectedUser,
        },
        {
          id: '3',
          ...expectedUser,
        },
        {
          id: '4',
          ...expectedUser,
        },
      ]);
    });
  });
  describe('getConnectionStatus', () => {
    it('should throw user not found if user does not exist', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);

      try {
        await request.caller.connections.getConnectionStatus({ userEmail: 'john@doe.com' });
      } catch (e) {
        expect((e as TRPCError).message).toEqual('User not found');
      }
    });
    it('should return status Sent if connection request was sent', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);
      request.ctx.prisma.connection.findUnique.mockResolvedValueOnce({
        user1Id: '1',
        user2Id: '2',
        connectionStatus: 'Pending_1_To_2',
      });

      const data = await request.caller.connections.getConnectionStatus({ userEmail: '' });
      expect(data).toEqual({ status: 'Sent' });
    });
    it('should return status Received if connection request was received', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);
      request.ctx.prisma.connection.findUnique.mockResolvedValueOnce({
        user1Id: '1',
        user2Id: '2',
        connectionStatus: 'Pending_2_To_1',
      });

      const data = await request.caller.connections.getConnectionStatus({ userEmail: '' });
      expect(data).toEqual({ status: 'Received' });
    });
    it('should return status Connected if connection request was accepted', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);
      request.ctx.prisma.connection.findUnique.mockResolvedValueOnce({
        user1Id: '1',
        user2Id: '2',
        connectionStatus: 'Connected',
      });

      const data = await request.caller.connections.getConnectionStatus({ userEmail: '' });
      expect(data).toEqual({ status: 'Connected' });
    });
    it('should return empty status if there is no connection', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);
      request.ctx.prisma.connection.findUnique.mockResolvedValueOnce(null);

      const data = await request.caller.connections.getConnectionStatus({ userEmail: '' });
      expect(data).toEqual({ status: '' });
    });
  });

  describe('sendConnectionRequest', () => {
    it('should set connection status to Pending_1_to_2 if requester id is less than recipient id', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      const create = jest.spyOn(request.ctx.prisma.connection, 'create').mockImplementation();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      await request.caller.connections.sendConnectionRequest({ userEmail: '' });

      expect(create).toHaveBeenCalledWith({
        data: {
          connectionStatus: 'Pending_1_To_2',
          user1Id: '1',
          user2Id: '2',
        },
      });
    });
    it('should set connection status to Pending_2_to_1 if requester id is greater than recipient id', async () => {
      const request = trpcRequest({ user: { id: '2' }, expires: '' });
      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '1',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      const create = jest.spyOn(request.ctx.prisma.connection, 'create').mockImplementation();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      await request.caller.connections.sendConnectionRequest({ userEmail: '' });

      expect(create).toHaveBeenCalledWith({
        data: {
          connectionStatus: 'Pending_2_To_1',
          user1Id: '1',
          user2Id: '2',
        },
      });
    });
  });
  describe('acceptConnection', () => {
    it('should set connection status to Connected', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      const update = jest.spyOn(request.ctx.prisma.connection, 'update').mockImplementation();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      await request.caller.connections.acceptConnection({ userEmail: '' });

      expect(update).toHaveBeenCalledWith({
        data: {
          connectionStatus: 'Connected',
        },
        where: {
          user1Id_user2Id: { user1Id: '1', user2Id: '2' },
        },
      });
    });
  });
  describe('removeConnection', () => {
    it('should set delete connection', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });
      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '2',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };

      const del = jest.spyOn(request.ctx.prisma.connection, 'delete').mockImplementation();
      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      await request.caller.connections.removeConnection({ userEmail: '' });

      expect(del).toHaveBeenCalledWith({
        where: {
          user1Id_user2Id: { user1Id: '1', user2Id: '2' },
        },
      });
    });
  });
});
