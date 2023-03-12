import { trpcRequest } from '../../utils';

describe('chat', () => {
  describe('submit', () => {
    it('should trigger a pusher event to the channel with the submitted message', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const trigger = jest.spyOn(request.ctx.pusher, 'trigger');

      await request.caller.chat.submit({ message: 'Hello World' });
      expect(trigger).toHaveBeenCalledWith('test', 'test-event', { message: 'Hello World' });
    });
  });
});
