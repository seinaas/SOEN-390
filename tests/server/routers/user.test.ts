import { createUser, trpcRequest } from '../../utils';

describe('user', () => {
  describe('getByEmail', () => {
    it('should return user by email', async () => {
      const request = trpcRequest();

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '1',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };
      const expectedUser = {
        ...userBase,
        numConnections: 0,
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      const data = await request.caller.user.getByEmail({ email: 'john@doe.com' });
      expect(data).toEqual(expectedUser);
    });
    it('should return user by id', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const userBase = createUser();
      const userInput = {
        ...userBase,
        id: '1',
        _count: {
          connections: 0,
          connectionOf: 0,
        },
      };
      const expectedUser = {
        ...userBase,
        numConnections: 0,
      };

      request.ctx.prisma.user.findUnique.mockResolvedValueOnce(userInput);

      const data = await request.caller.user.getByID({ id: '1' });
      expect(data).toEqual(expectedUser);
    });
    it('should update a user', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const update = jest.spyOn(request.ctx.prisma.user, 'update');

      await request.caller.user.update({ firstName: 'Test' });
      expect(update).toHaveBeenCalledWith({
        data: {
          firstName: 'Test',
        },
        where: {
          id: '1',
        },
      });
    });
  });
});
