import { trpcRequest } from '../../utils';

describe('chat', () => {
  describe('sendMessage', () => {
    it('should trigger a pusher event to the channel with the submitted message', async () => {
      const request = trpcRequest({ user: { id: '1', firstName: 'Unknown', lastName: 'User' }, expires: '' });
      request.ctx.prisma.messages.create.mockResolvedValue({} as any);
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
    it('should send a notification to all users in the conversation', async () => {
      const request = trpcRequest({ user: { id: '1', firstName: 'Unknown', lastName: 'User' }, expires: '' });
      request.ctx.prisma.messages.create.mockResolvedValue({} as any);
      request.ctx.prisma.directMessages.findUnique.mockResolvedValue({
        users: [
          {
            id: '1',
          },
          {
            id: '2',
          },
        ],
      } as any);
      const trigger = jest.spyOn(request.ctx.pusher, 'sendToUser');

      await request.caller.chat.sendMessage({
        message: 'Hello World',
        conversationId: 'test',
      });
      expect(trigger).toHaveBeenCalledWith('2', 'chat', {});
    });
  });
});
