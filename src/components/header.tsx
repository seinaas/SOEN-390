import { AnimatePresence, motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoIosChatbubbles, IoMdHome, IoMdLogOut, IoMdPeople, IoMdClose, IoIosNotifications } from 'react-icons/io';
import { api } from '../utils/api';
import { FiMenu } from 'react-icons/fi';
import { useSubscribeToUserEvent } from '../utils/pusher';
import { NotificationsDropdown } from './notifications/notificationsDropdown';
import { useRouter } from 'next/router';

const NotificationBubble = ({ count }: { count: number }) => {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.2 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className='absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 p-1'
        >
          <span className='text-xs font-bold text-white'>{count}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [notifCount, setNotifCount] = useState(0);
  const [chatNotifCount, setChatNotifCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const router = useRouter();
  const utils = api.useContext();
  api.notifications.getNotificationCount.useQuery(undefined, {
    onSuccess: (data) => {
      setNotifCount(data);
    },
    refetchOnWindowFocus: false,
  });

  useSubscribeToUserEvent('notification', () => {
    setNotifCount((prev) => prev + 1);
  });
  useSubscribeToUserEvent('notification-refresh', () => {
    void utils.notifications.getNotificationCount.refetch();
    void utils.notifications.getNotifications.refetch();
  });
  useSubscribeToUserEvent('chat', () => {
    if (router.pathname !== '/chat') setChatNotifCount((prev) => prev + 1);
  });

  const { data } = useSession();
  const { data: searchRes, refetch } = api.user.search.useQuery(
    { query: searchQuery },
    {
      enabled: false,
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    // Debounce search query to prevent spamming the API
    if (searchQuery.length >= 3 || (searchRes && !searchQuery)) {
      timeout = setTimeout(() => {
        void refetch();
      }, 500);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [searchQuery, refetch, searchRes]);

  // TODO: Remove this and replace with a better solution
  useEffect(() => {
    if (router.pathname === '/chat') setChatNotifCount(0);
  }, [router.pathname]);

  return (
    <>
      {/* Sliding Mobile Menu */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? '' : 'invisible'} fixed z-50 float-left min-h-screen w-full justify-end md:hidden`}
        data-cy='header-sliding-mobile-menu'
      >
        <div
          className={`${
            isOpen ? 'opacity-50' : 'opacity-0'
          }  min-h-screen bg-gray-900  transition-all duration-300 ease-out`}
          data-cy='header-sliding-mobile-menu-grey-area'
        />
        <div
          className={`${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } absolute right-0 top-0 flex min-h-screen w-24 flex-col items-center justify-start gap-8 bg-primary-600 pt-6 text-white transition-all duration-300 ease-out`}
        >
          <IoMdClose
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            data-cy='header-mobile-sliding-menu-close-btn'
            className={`block h-8 w-8 cursor-pointer rounded-lg hover:text-primary-100 md:hidden`}
          />
          <Link href='/feed' className='hover:text-primary-100'>
            <IoMdHome size={28} />
          </Link>
          <Link href='/' className='hover:text-primary-100'>
            <IoMdPeople size={28} />
          </Link>
          <Link href='/chat' className='relative hover:text-primary-100'>
            <NotificationBubble count={chatNotifCount} />
            <IoIosChatbubbles size={28} />
          </Link>
          <Link href='/notifications' className='relative hover:text-primary-100'>
            <NotificationBubble count={notifCount} />
            <IoIosNotifications size={28} />
          </Link>
          <button onClick={() => signOut()} className='hover:text-primary-100'>
            <IoMdLogOut size={28} />
          </button>
        </div>
      </div>
      {/* Heading Menu */}
      <div className='z-40 flex h-20 min-h-[5rem] w-full items-center justify-center gap-8 border-b-2 border-primary-100 px-6 py-4 md:px-12'>
        {/* User Search Bar, Dropdown and Logo */}
        <div className='flex h-full flex-grow items-center gap-8'>
          <Link href='/feed' className='relative block h-full w-32'>
            <Image priority alt='ProSpects Logo' src='/LogoAlt.png' fill className='object-contain' />
          </Link>
          {/* User Search Bar and Dropdown */}
          <div className='relative flex flex-grow lg:inline-block lg:flex-grow-0'>
            <input
              data-cy='search-user-input'
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => e.relatedTarget === null && setIsFocused(false)}
              type='text'
              placeholder='Search'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='relative h-10 w-full max-w-sm rounded-md bg-primary-100/20 px-4 placeholder-primary-100 outline-none transition-colors duration-200 focus:bg-primary-100 focus:text-white focus:placeholder-white/50 lg:w-96'
            />
            <AnimatePresence>
              {searchRes && isFocused && (
                <motion.div
                  data-cy='search-user-dropdown'
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='absolute top-4 left-0 right-0 -z-10 max-h-96 overflow-auto rounded-lg bg-white pt-6 shadow-lg'
                >
                  {searchRes.map((user) => (
                    <motion.div layout key={user.email}>
                      <Link
                        href={`/u/${user.email}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                          setIsFocused(false);
                        }}
                        className='flex items-center gap-4 px-4 py-2 hover:bg-primary-100/20'
                      >
                        <div className='relative h-8 w-8'>
                          <Image
                            alt='User Avatar'
                            loader={() => user.image || '/placeholder.jpeg'}
                            src={user.image || '/placeholder.jpeg'}
                            fill
                            className='rounded-full object-cover'
                            referrerPolicy='no-referrer'
                          />
                        </div>
                        <div className='flex flex-col'>
                          <span className='font-medium text-primary-100'>
                            {user.firstName} {user.lastName}
                          </span>
                          <span className='text-sm text-primary-100/50'>{user.email}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className='flex items-center justify-end gap-4 md:gap-8'>
          {/* Desktop header icons/links */}
          <div className='hidden items-center gap-8 md:flex' data-cy='header-desktop-links'>
            <Link href='/feed' className='text-primary-500 hover:text-primary-600'>
              <IoMdHome size={28} />
            </Link>
            <Link href='/' className='text-primary-500 hover:text-primary-600'>
              <IoMdPeople size={28} />
            </Link>
            <Link href='/chat' className='relative text-primary-500 hover:text-primary-600'>
              <NotificationBubble count={chatNotifCount} />
              <IoIosChatbubbles size={28} />
            </Link>
            <span className='relative flex items-center justify-center'>
              <button
                onClick={() => setShowNotifDropdown((prev) => !prev)}
                className='relative text-primary-500 hover:text-primary-600'
              >
                <NotificationBubble count={notifCount} />
                <IoIosNotifications size={28} />
              </button>
              <AnimatePresence>{showNotifDropdown && <NotificationsDropdown />}</AnimatePresence>
            </span>
            <button
              onClick={() => signOut()}
              className='text-primary-500 hover:text-primary-600'
              data-cy='signout-button'
            >
              <IoMdLogOut size={28} />
            </button>
          </div>
          {data?.user && (
            <Link
              href={`/u/${data.user.email || ''}`}
              className='min-h-[32px] min-w-[32px] text-primary-500 hover:text-primary-600'
            >
              <Image
                alt='User Avatar'
                loader={() => data?.user?.image || '/placeholder.jpeg'}
                src={data.user.image || '/placeholder.jpeg'}
                width={32}
                height={32}
                className='rounded-full'
                referrerPolicy='no-referrer'
              />
            </Link>
          )}
          {/* Hamburger Menu Button*/}
          <button data-cy='header-hamburger-button' onClick={() => setIsOpen(!isOpen)} className='relative md:hidden'>
            <NotificationBubble count={notifCount + chatNotifCount} />
            <FiMenu className={`block h-8 w-8 cursor-pointer rounded-lg text-primary-500`} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
