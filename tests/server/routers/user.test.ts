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
  });
});
