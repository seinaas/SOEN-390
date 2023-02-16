import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { IoIosChatbubbles, IoMdHome, IoMdLogOut, IoMdPeople } from 'react-icons/io';

const Header: React.FC = () => {
  const { data } = useSession();

  return (
    <div className='flex h-20 w-full items-center justify-between border-b-2 border-primary-100 py-4 px-12'>
      <Link href='/feed' className='relative h-20 w-32'>
        <Image alt='ProSpects Logo' src='/LogoAlt.png' fill className='object-contain' />
      </Link>
      <div className='flex items-center gap-8'>
        <Link href='/feed' className='text-primary-500 hover:text-primary-600'>
          <IoMdHome size={28} />
        </Link>
        <Link href='/' className='text-primary-500 hover:text-primary-600'>
          <IoMdPeople size={28} />
        </Link>
        <Link href='/' className='text-primary-500 hover:text-primary-600'>
          <IoIosChatbubbles size={28} />
        </Link>
        <button onClick={() => signOut()} className='text-primary-500 hover:text-primary-600'>
          <IoMdLogOut size={28} />
        </button>
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
      </div>
    </div>
  );
};

export default Header;
