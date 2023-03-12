import { AnimatePresence, motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoIosChatbubbles, IoMdHome, IoMdLogOut, IoMdPeople } from 'react-icons/io';
import { api } from '../utils/api';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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

  return (
    <div className='z-50 flex h-20 w-full items-center justify-between border-b-2 border-primary-100 py-4 px-12'>
      <div className='h-full flex-grow basis-0'>
        <Link href='/feed' className='relative block h-full w-32'>
          <Image priority alt='ProSpects Logo' src='/LogoAlt.png' fill className='object-contain' />
        </Link>
      </div>
      {/* User Search Bar and Dropdown */}
      <div className='relative'>
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => e.relatedTarget === null && setIsFocused(false)}
          type='text'
          placeholder='Search'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='relative h-10 w-96 rounded-md bg-primary-100/20 px-4 placeholder-primary-100 outline-none transition-colors duration-200 focus:bg-primary-100 focus:text-white focus:placeholder-white/50'
        />
        <AnimatePresence>
          {searchRes && isFocused && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className='absolute top-4 left-0 -z-10 max-h-96 w-96 overflow-auto rounded-lg bg-white pt-6 shadow-lg'
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
                    <Image
                      alt='User Avatar'
                      loader={() => user.image || '/placeholder.jpeg'}
                      src={user.image || '/placeholder.jpeg'}
                      width={32}
                      height={32}
                      className='rounded-full'
                      referrerPolicy='no-referrer'
                    />
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
      <div className='flex flex-grow basis-0 items-center justify-end gap-8'>
        <Link href='/feed' className='text-primary-500 hover:text-primary-600'>
          <IoMdHome size={28} />
        </Link>
        <Link href='/' className='text-primary-500 hover:text-primary-600'>
          <IoMdPeople size={28} />
        </Link>
        <Link href='/chat' className='text-primary-500 hover:text-primary-600'>
          <IoIosChatbubbles size={28} />
        </Link>
        <button onClick={() => signOut()} className='text-primary-500 hover:text-primary-600'>
          <IoMdLogOut size={28} />
        </button>
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
            />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;
