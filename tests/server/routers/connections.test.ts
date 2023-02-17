import { TRPCError } from '@trpc/server';
import { createUser, trpcRequest } from '../../utils';

describe('connections', () => {
  describe('getConnection', () => {
    it('should throw user not found if user does not exist', async () => {
      const request = trpcRequest({ user: { id: '' }, expires: '' });

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(null);

      try {
        await request.caller.connections.getConnection({ userEmail: 'john@doe.com' });
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

      const data = await request.caller.connections.getConnection({ userEmail: '' });
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

      const data = await request.caller.connections.getConnection({ userEmail: '' });
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

      const data = await request.caller.connections.getConnection({ userEmail: '' });
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

      const data = await request.caller.connections.getConnection({ userEmail: '' });
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
