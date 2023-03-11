import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosChatbubbles, IoMdHome, IoMdLogOut, IoMdPeople, IoMdClose } from 'react-icons/io';
import { FiMenu } from 'react-icons/fi';
import { useState } from 'react';

const Header: React.FC = () => {
  const { data } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sliding Mobile Menu */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? '' : 'invisible'} fixed z-10 float-left min-h-screen w-full justify-end  md:hidden`}
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
            className={`z-20 block h-8 w-8 cursor-pointer rounded-lg hover:text-primary-100  md:hidden`}
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
      <div
        className='flex h-20 w-full items-center justify-between border-b-2 border-primary-100 py-4 px-8'
        data-cy='header'
      >
        <Link href='/feed' className='relative h-20 w-32'>
          <Image alt='ProSpects Logo' src='/LogoAlt.png' fill className='object-contain' data-cy='header-logo' />
        </Link>
        <div className='flex items-center gap-6 md:gap-8'>
          <div className='hidden items-center gap-8 md:flex'>
            <Link href='/feed' className=' text-primary-500 hover:text-primary-600 md:inline-block'>
              <IoMdHome size={28} />
            </Link>
            <Link href='/' className=' text-primary-500 hover:text-primary-600 md:inline-block'>
              <IoMdPeople size={28} />
            </Link>
            <Link href='/' className=' text-primary-500 hover:text-primary-600 md:inline-block'>
              <IoIosChatbubbles size={28} />
            </Link>
            <button onClick={() => signOut()} className=' text-primary-500 hover:text-primary-600 md:inline-block'>
              <IoMdLogOut size={28} />
            </button>
          </div>
          {data?.user && (
            <Link href={`/u/${data.user.email || ''}`} className='text-primary-500 hover:text-primary-600'>
              <Image
                alt='User Avatar'
                loader={() => data?.user?.image || ''}
                src={data.user.image || ''}
                width={32}
                height={32}
                className='rounded-full'
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
