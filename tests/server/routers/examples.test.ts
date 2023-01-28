import { trpcRequest } from '../../utils';

describe('examples', () => {
  describe('hello', () => {
    it('should return greeting', async () => {
      const data = await trpcRequest().example.hello({ text: 'world' });
      expect(data).toEqual({ greeting: 'Hello world' });
    });
  });

  describe('getAll', () => {
    it('should return all examples', async () => {
      const data = await trpcRequest().example.getAll();
      expect(data).toEqual([]);
    });
  });

  describe('getSecretMessage', () => {
    it('should return secret message if user is authenticated', async () => {
      const data = await trpcRequest({ user: { id: '' }, expires: '' }).example.getSecretMessage();
      expect(data).toEqual('you can now see this secret message!');
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(trpcRequest().example.getSecretMessage()).rejects.toThrowError('UNAUTHORIZED');
    });
  });
});
