import { AnimatePresence, motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IoIosChatbubbles, IoMdHome, IoMdLogOut, IoMdPeople, IoMdClose } from 'react-icons/io';
import { api } from '../utils/api';
import { FiMenu } from 'react-icons/fi';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const { data } = useSession();
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Sliding Mobile Menu */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? '' : 'invisible'} fixed z-50 float-left min-h-screen w-full justify-end  md:hidden`}
        data-cy='header-sliding-mobile-menu'
      >
        <div
          className={`${
            isOpen ? 'opacity-50' : 'opacity-0'
          }  min-h-screen bg-gray-900  transition-all duration-300 ease-out`}
        ></div>
        <div
          className={`${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          } absolute right-0 top-0 flex min-h-screen w-24 flex-col items-center justify-start gap-8 bg-primary-600 pt-6 text-white transition-all duration-300 ease-out`}
        >
          <IoMdClose
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`block h-8 w-8 cursor-pointer rounded-lg hover:text-primary-100  md:hidden`}
          ></IoMdClose>
          <Link href='/feed' className=' hover:text-primary-100'>
            <IoMdHome size={28} />
          </Link>
          <Link href='/' className='  hover:text-primary-100 '>
            <IoMdPeople size={28} />
          </Link>
          <Link href='/' className='  hover:text-primary-100 '>
            <IoIosChatbubbles size={28} />
          </Link>
          <button onClick={() => signOut()} className='  hover:text-primary-100 '>
            <IoMdLogOut size={28} />
          </button>
        </div>
      </div>
      {/* Heading Menu */}
      <div className='z-40 flex h-20 w-full items-center justify-center gap-8 border-b-2 border-primary-100 px-8 py-4 md:px-12'>
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
          <div className='hidden items-center gap-8 md:flex'>
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
          <FiMenu
            onClick={() => setIsOpen(!isOpen)}
            className={`block h-8 w-8 cursor-pointer rounded-lg text-primary-500  md:hidden`}
            data-cy='header-hamburger-button'
          ></FiMenu>
        </div>
      </div>
    </>
  );
};

export default Header;
