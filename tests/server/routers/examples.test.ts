import { trpcRequest } from '../../utils';

describe('examples', () => {
  describe('hello', () => {
    it('should return greeting', async () => {
      const data = await trpcRequest().caller.example.hello({ text: 'world' });
      expect(data).toEqual({ greeting: 'Hello world' });
    });
  });

  describe('getAll', () => {
    it('should return all examples', async () => {
      const request = trpcRequest();

      request.ctx.prisma.example.findMany.mockResolvedValueOnce([]);

      const data = await request.caller.example.getAll();
      expect(data).toEqual([]);
    });
  });

  describe('getSecretMessage', () => {
    it('should return secret message if user is authenticated', async () => {
      const data = await trpcRequest({ user: { id: '' }, expires: '' }).caller.example.getSecretMessage();
      expect(data).toEqual('you can now see this secret message!');
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(trpcRequest().caller.example.getSecretMessage()).rejects.toThrowError('UNAUTHORIZED');
    });
  });
});
