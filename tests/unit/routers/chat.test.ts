import { trpcRequest } from '../../utils';

describe('chat', () => {
  describe('submit', () => {
    it('should trigger a pusher event to the channel with the submitted message', async () => {
      const request = trpcRequest({ user: { id: '1', firstName: 'Unknown', lastName: 'User' }, expires: '' });

      const trigger = jest.spyOn(request.ctx.pusher, 'trigger');

      await request.caller.chat.sendMessage({
        message: 'Hello World',
        conversationId: 'test',
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
