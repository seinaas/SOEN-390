import { trpcRequest } from '../../utils';

describe('chat', () => {
  describe('submit', () => {
    it('should trigger a pusher event to the channel with the submitted message', async () => {
      const request = trpcRequest({ user: { id: '1' }, expires: '' });

      const trigger = jest.spyOn(request.ctx.pusher, 'trigger');

      await request.caller.chat.sendMessage({
        message: 'Hello World',
        senderId: '1',
        conversationId: 'test',
        sender: {
          firstName: 'Unknown',
          lastName: 'User',
        },
      });
      expect(trigger).toHaveBeenCalledWith('test', 'message-sent', {
        sender: {
          firstName: 'Unknown',
          lastName: 'User',
        },
      });
    });
  });
});
