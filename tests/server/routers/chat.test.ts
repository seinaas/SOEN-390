import { trpcRequest } from '../../utils';

describe('chat', () => {
  describe('submit', () => {
    it('should trigger a pusher event to the channel with the submitted message', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const trigger = jest.spyOn(request.ctx.pusher, 'trigger');

      await request.caller.chat.submit({
        message: 'Hello World',
        senderId: '1',
        receiverId: '2',
        conversationId: '1',
      });
      expect(trigger).toHaveBeenCalledWith('test', 'test-event', { message: 'Hello World' });
    });
  });
});
