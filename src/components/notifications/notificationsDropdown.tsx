/*
 *		Notification Dropdown Component
 *
 *
 *		This is a React component that renders a dropdown for notifications. The dropdown shows a list of unread notifications, with options to mark them as seen and navigate to their associated routes.
 *		The component also includes functionality to accept or decline connection requests. Finally, it uses a Pusher subscription to receive real-time updates for new notifications.
 */
import { api } from '../../utils/api';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNowStrict } from 'date-fns';
import locale from 'date-fns/locale/en-US';
import { customFormatDistance } from '../../utils/customFormat';
import { useSubscribeToUserEvent } from '../../utils/pusher';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type Props = {
  setShowDropdown: (show: boolean) => void;
};

export const NotificationsDropdown: React.FC<Props> = ({ setShowDropdown }) => {
  const t = useTranslations('notifications');
  const router = useRouter();
  const utils = api.useContext();
  const updateNotifications = api.notifications.updateNotification.useMutation();
  const acceptConnectionMutation = api.connections.acceptConnection.useMutation();
  const declineConnectionMutation = api.connections.removeConnection.useMutation();

  const { data: notifications } = api.notifications.getNotifications.useQuery(
    { unreadOnly: true },
    {
      refetchOnWindowFocus: false,
    },
  );

  const markAsSeen = api.notifications.updateNotification.useMutation({
    onSuccess: () => {
      void utils.notifications.getNotifications.refetch();
      void utils.notifications.getNotificationCount.refetch();
    },
  });

  useSubscribeToUserEvent('notification', () => {
    void utils.notifications.getNotifications.refetch();
  });

  const update = async (notificationId: string) => {
    await updateNotifications.mutateAsync({
      id: notificationId,
      type: 'ConnectionResponse',
      seen: true,
    });
    await utils.notifications.getNotifications.refetch();
    await utils.notifications.getNotificationCount.refetch();
  };

  return (
    <motion.div
      initial={{ height: 0, width: 0 }}
      animate={{ height: 400, width: 380 }}
      exit={{
        height: 0,
        width: 0,
        transition: {
          type: 'tween',
          duration: 0.1,
        },
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className='absolute top-12 -right-2 flex h-96 w-[380px] flex-col gap-2 overflow-y-auto rounded-lg bg-white px-4 py-2 shadow-xl'
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className='flex items-center justify-between'
      >
        <span className='text-lg font-bold text-primary-300'>Notifications</span>
        <Link
          href='/notifications'
          onClick={() => setShowDropdown(false)}
          className='rounded-md px-2 py-1 text-primary-100 transition-colors duration-200 hover:bg-primary-100/10 active:bg-primary-100/30'
        >
          {t('see-all')}
        </Link>
      </motion.div>
      {notifications?.length ? (
        notifications.map((notification, index) => (
          <motion.a
            href='#'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 + 0.2 } }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            key={notification.id}
            onClick={() => {
              void markAsSeen.mutate({ id: notification.id, seen: true });
              if (!!notification.route) {
                void router.push(notification.route);
              }
            }}
            className={`flex items-center gap-2 rounded-lg p-2 pr-4 transition-colors duration-200 ${
              notification.seen ? 'bg-gray-200/30' : 'bg-primary-100/20'
            } ${notification.route ? 'hover:bg-primary-100/30 active:bg-primary-100/50' : ''}`}
          >
            <Image
              alt='User Avatar'
              loader={() => notification.Sender?.image || '/placeholder.jpeg'}
              src={notification.Sender?.image || '/placeholder.jpeg'}
              width={52}
              height={52}
              className='rounded-full'
              referrerPolicy='no-referrer'
            />
            <div className='flex flex-1 flex-col'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-primary-300'>
                  {notification.Sender.firstName} {notification.Sender.lastName}
                </span>
                <span className='text-xs text-primary-300'>
                  {formatDistanceToNowStrict(notification.createdAt, {
                    locale: { ...locale, formatDistance: customFormatDistance },
                  })}
                </span>
              </div>
              <span className='text-left leading-[1.2] text-primary-100'>
                {t(`content.${notification.type}`, {
                  name: `${notification.Sender.firstName || ''} ${notification.Sender.lastName || ''}`,
                  content: notification.content,
                })}
              </span>
              <AnimatePresence>
                {notification.type === 'ConnectionRequest' && (
                  <motion.div
                    className='mt-2 flex gap-2'
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptConnectionMutation.mutate(
                          { userEmail: notification.Sender.email },
                          {
                            onSuccess: () => {
                              void update(notification.id);
                            },
                          },
                        );
                      }}
                      className='flex-1 rounded-md bg-primary-400 px-2 py-1 text-white hover:bg-primary-500 active:bg-primary-600'
                    >
                      {t('accept')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        declineConnectionMutation.mutate(
                          { userEmail: notification.Sender.email },
                          {
                            onSuccess: () => {
                              void utils.notifications.getNotifications.refetch();
                              void utils.notifications.getNotificationCount.refetch();
                            },
                          },
                        );
                      }}
                      className='flex-1 rounded-md bg-primary-100/20 px-2 py-1 text-primary-100 hover:bg-primary-100/30 active:bg-primary-100/50'
                    >
                      {t('decline')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.a>
        ))
      ) : (
        <div className='pt-8 text-center text-primary-100/50'>{t('empty')}</div>
      )}
    </motion.div>
  );
};
