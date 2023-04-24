/*
*		Notidications Content Component
*
*
*		The code defines a Next.js page component called Notifications. It contains functionality for filtering and displaying notifications. Notifications can be filtered by type, 
*		such as unread, likes, comments, or connections. The component also allows users to clear all notifications, mark them as seen, and update connection requests. It uses various 
*		API functions and packages, including Next.js, date-fns, and framer-motion.
*/
import { type GetServerSidePropsContext } from 'next';
import MainLayout from '../components/mainLayout';
import { getServerAuthSession } from '../server/auth';
import { type NextPageWithLayout } from './_app';
import locale from 'date-fns/locale/en-US';
import { api } from '../utils/api';
import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { customFormatDistance } from '../utils/customFormat';
import { useRouter } from 'next/router';
import { useSubscribeToUserEvent } from '../utils/pusher';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { IoIosClose } from 'react-icons/io';
import EditButton from '../components/profile/editButton';
import NotificationSettingsModal from '../components/notifications/settingsModal';

const FILTERS = ['all', 'unread', 'likes', 'comments', 'connections'] as const;
type Filter = (typeof FILTERS)[number];

const Notifications: NextPageWithLayout = () => {
  const [currentFilter, setCurrentFilter] = useState<Filter>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const router = useRouter();
  const utils = api.useContext();
  const { data: notifications } = api.notifications.getNotifications.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const updateNotifications = api.notifications.updateNotification.useMutation();
  const acceptConnectionMutation = api.connections.acceptConnection.useMutation();
  const declineConnectionMutation = api.connections.removeConnection.useMutation();
  const markAllAsSeen = api.notifications.markAllAsSeen.useMutation();
  const clearAll = api.notifications.clearAll.useMutation();
  const clearNotification = api.notifications.clearNotification.useMutation();

  // Subscribe to pusher notifications
  useSubscribeToUserEvent('notification', () => {
    void utils.notifications.getNotifications.refetch();
  });

  const syncNotifs = async () => {
    await utils.notifications.getNotifications.refetch();
    await utils.notifications.getNotificationCount.refetch();
  };

  // Update connection notification type
  const update = async (notificationId: string) => {
    await updateNotifications.mutateAsync({
      id: notificationId,
      type: 'ConnectionResponse',
      seen: true,
    });
    await syncNotifs();
  };

  useEffect(() => {
    const onPageExit = () => {
      markAllAsSeen.mutate(undefined, {
        onSuccess: () => {
          void utils.notifications.getNotificationCount.refetch();
        },
      });
    };

    // Mark all notifications as seen when the user closes the page
    router.events.on('routeChangeStart', onPageExit);
    return () => {
      router.events.off('routeChangeStart', onPageExit);
    };
  }, [markAllAsSeen, router.events, utils.notifications.getNotificationCount]);

  return (
    <div className='flex h-full max-h-full w-full flex-col justify-start gap-6 overflow-hidden p-2 sm:flex-row sm:p-6'>
      {/* Filters section */}
      <div className='flex w-full items-start sm:max-w-sm'>
        <div className='flex flex-1 flex-col gap-2 rounded-lg bg-primary-100/20 p-3'>
          <h2 className='text-2xl font-bold text-primary-300'>Filters</h2>
          <div className='flex flex-wrap gap-2'>
            {FILTERS.map((filter) => (
              <button
                key={filter}
                className={`rounded-full px-4 py-1 font-semibold capitalize transition-colors duration-200 ${
                  filter == currentFilter
                    ? 'bg-primary-500 text-white'
                    : 'bg-primary-100/20 text-primary-600 hover:bg-primary-100/30 active:bg-primary-100/50'
                }`}
                onClick={() => {
                  setCurrentFilter(filter);
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Notifications section */}
      <div className='flex w-full max-w-xl flex-grow flex-col gap-2'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <h2 className='text-2xl font-bold text-primary-600'>Notifications</h2>
            <EditButton name='notifications' data-cy='notif-settings' onClick={() => setShowSettingsModal(true)} />
          </div>
          <div className='flex items-center gap-2'>
            <button
              className='rounded-full bg-primary-100/20 px-4 py-1 text-sm font-semibold capitalize text-primary-600 transition-colors duration-200 hover:bg-primary-100/30 active:bg-primary-100/50'
              onClick={() => {
                // Clear all notifications
                clearAll.mutate(undefined, {
                  onSuccess: () => {
                    void syncNotifs();
                  },
                });
              }}
            >
              Clear all
            </button>
          </div>
        </div>
        {/* Notifications */}
        <div className='flex max-h-full flex-col gap-2 overflow-scroll'>
          <AnimatePresence mode='wait' initial={false}>
            {notifications?.length ? (
              notifications
                .filter((notification) => {
                  switch (currentFilter) {
                    case 'all':
                      return true;
                    case 'unread':
                      return !notification.seen;
                    case 'likes':
                      return notification.type === 'Like';
                    case 'comments':
                      return notification.type === 'Comment';
                    case 'connections':
                      return (
                        notification.type === 'ConnectionRequest' ||
                        notification.type === 'ConnectionResponse' ||
                        notification.type === 'ConnectionAccepted'
                      );
                  }
                })
                .map((notification, index) => (
                  <motion.a
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{
                      type: 'tween',
                      duration: 0.2,
                      ease: 'easeInOut',
                      delay: index * 0.05,
                    }}
                    href='#'
                    key={notification.id}
                    className={`relative flex gap-4 rounded-lg ${
                      notification.seen ? 'bg-gray-200/30' : 'bg-primary-100/20'
                    } ${
                      notification.route ? 'hover:bg-primary-100/30 active:bg-primary-100/50' : ''
                    } p-4 transition-colors duration-200`}
                    onClick={() => !!notification.route && router.push(notification.route)}
                  >
                    {!notification.seen && (
                      <div className='absolute top-1 left-1 z-10 h-2 w-2 rounded-full bg-primary-500' />
                    )}
                    {/* Clear notification */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearNotification.mutate(
                          { id: notification.id },
                          {
                            onSuccess: () => {
                              void syncNotifs();
                            },
                          },
                        );
                      }}
                      className='absolute top-3 right-3 flex rounded-full text-primary-200 transition-colors duration-200 hover:bg-primary-200 hover:text-white'
                    >
                      <IoIosClose size={24} />
                    </button>
                    <div className='relative h-[48px] min-h-[48px] w-[48px] min-w-[48px] overflow-hidden rounded-full'>
                      <Image
                        alt='User Avatar'
                        loader={() => notification.Sender.image || '/placeholder.jpeg'}
                        src={notification.Sender.image || '/placeholder.jpeg'}
                        fill
                        className='object-cover'
                        referrerPolicy='no-referrer'
                      />
                    </div>
                    <div className='flex flex-1 flex-col'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-primary-600'>
                          {notification.Sender.firstName} {notification.Sender.lastName}
                        </span>
                        <span className='text-xs text-primary-400'>
                          {formatDistanceToNowStrict(notification.createdAt, {
                            locale: { ...locale, formatDistance: customFormatDistance },
                          })}
                        </span>
                      </div>
                      <span className='text-left text-primary-400'>{notification.content}</span>
                      {/* Show 'Approve'/'Ignore' buttons if notification is a connection request */}
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
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                declineConnectionMutation.mutate(
                                  { userEmail: notification.Sender.email },
                                  {
                                    onSuccess: () => {
                                      void syncNotifs();
                                    },
                                  },
                                );
                              }}
                              className='flex-1 rounded-md bg-primary-100/20 px-2 py-1 text-primary-100 hover:bg-primary-100/30 active:bg-primary-100/50'
                            >
                              Decline
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.a>
                ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-1 items-center justify-center'
              >
                <span className='text-primary-400'>No notifications yet</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {showSettingsModal && <NotificationSettingsModal onCancel={() => setShowSettingsModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

Notifications.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Notifications;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
