import { trpcRequest } from '../../utils';
import { type Notification } from '@prisma/client';

describe('notifications', () => {
  const request = trpcRequest({ user: { id: '' }, expires: '' });
  describe('getNotificationCount', () => {
    it('should return the correct number of notifications', async () => {
      request.ctx.prisma.notification.findMany.mockResolvedValueOnce([
        {
          id: '1',
          type: 'ConnectionRequest',
          seen: false,
          createdAt: new Date(),
          content: '',
          route: '',
          senderId: '1',
          userId: '1',
        },
      ]);

      const data = await request.caller.notifications.getNotificationCount();
      expect(data).toEqual(1);
    });
  });
  describe('getNotifications', () => {
    it('should return all notifications if unreadOnly is false', async () => {
      const expectedNotification = {
        id: '1',
        type: 'ConnectionRequest',
        seen: true,
        createdAt: new Date(),
        content: '',
        route: '',
        senderId: '1',
        userId: '1',
      } as Notification;

      request.ctx.prisma.notification.findMany.mockResolvedValueOnce([expectedNotification]);

      const data = await request.caller.notifications.getNotifications({ unreadOnly: false });
      expect(data).toEqual([expectedNotification]);
    });
    it('should return only unread notifications if unreadOnly is true', async () => {
      const getNotifs = jest.spyOn(request.ctx.prisma.notification, 'findMany').mockImplementation();

      await request.caller.notifications.getNotifications({ unreadOnly: true });
      expect(getNotifs).toHaveBeenCalledWith({
        where: {
          userId: '',
          seen: false,
        },
        include: {
          Sender: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });
    });
  });
  describe('updateNotification', () => {
    it('should update the notification', async () => {
      const update = jest.spyOn(request.ctx.prisma.notification, 'update').mockImplementation();

      request.ctx.prisma.notification.update.mockResolvedValueOnce({} as any);

      await request.caller.notifications.updateNotification({
        id: '1',
        type: 'ConnectionRequest',
        seen: true,
      });
      expect(update).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
        data: {
          type: 'ConnectionRequest',
          seen: true,
        },
      });
    });
  });
  describe('markAllAsSeen', () => {
    it('should mark all notifications as seen', async () => {
      const updateMany = jest.spyOn(request.ctx.prisma.notification, 'updateMany').mockImplementation();

      request.ctx.prisma.notification.updateMany.mockResolvedValueOnce({} as any);

      await request.caller.notifications.markAllAsSeen();
      expect(updateMany).toHaveBeenCalledWith({
        where: {
          userId: '',
          seen: false,
        },
        data: {
          seen: true,
        },
      });
    });
  });
  describe('clearNotification', () => {
    it('should clear the notification', async () => {
      const deleteOne = jest.spyOn(request.ctx.prisma.notification, 'delete').mockImplementation();

      request.ctx.prisma.notification.delete.mockResolvedValueOnce({} as any);

      await request.caller.notifications.clearNotification({ id: '1' });
      expect(deleteOne).toHaveBeenCalledWith({
        where: {
          id: '1',
        },
      });
    });
  });
  describe('clearAll', () => {
    it('should clear all notifications', async () => {
      const deleteMany = jest.spyOn(request.ctx.prisma.notification, 'deleteMany').mockImplementation();

      request.ctx.prisma.notification.deleteMany.mockResolvedValueOnce({} as any);

      await request.caller.notifications.clearAll();
      expect(deleteMany).toHaveBeenCalledWith({
        where: {
          userId: '',
        },
      });
    });
  });
  describe('getMutedNotificationTypes', () => {
    it('should return all muted notification types', async () => {
      request.ctx.prisma.mutedNotificationTypes.findMany.mockResolvedValueOnce([
        {
          type: 'ConnectionRequest',
          userId: '1',
        },
        {
          type: 'ConnectionAccepted',
          userId: '1',
        },
      ]);
      const data = await request.caller.notifications.getMutedNotificationTypes();

      expect(data).toEqual(['ConnectionRequest', 'ConnectionAccepted']);
    });
  });
  describe('updateMutedNotificationTypes', () => {
    it('should update the muted notification types', async () => {
      const create = jest.spyOn(request.ctx.prisma.mutedNotificationTypes, 'createMany').mockImplementation();
      request.ctx.prisma.mutedNotificationTypes.deleteMany.mockResolvedValueOnce({} as any);

      await request.caller.notifications.updateMutedNotificationTypes(['ConnectionRequest']);

      expect(create).toHaveBeenCalledWith({
        data: [
          {
            type: 'ConnectionRequest',
            userId: '',
          },
        ],
      });
    });
  });
});
