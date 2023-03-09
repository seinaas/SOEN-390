import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Button from '../components/button';

const TopMenuBar: React.FC = () => {
  const { data } = useSession();

  return (
    <div className='flex w-full items-center justify-between bg-primary-600  pl-5 pr-10'>
      {/* Logo */}
      <Link href='/' className='relative h-16 w-32'>
        <Image alt='ProSpect Logo' src='/Logo.png' fill className='object-contain' />
      </Link>

      {/* Links */}
      <div className='flex items-center space-x-10'>
        <div className=' flex w-full justify-end space-x-5 text-primary-200'>
          <Link href='/'>ABOUT</Link>
          {!data && (
            <>
              <Link href='/'>JOBS</Link>
              <Link href='/'>PEOPLE</Link>
            </>
          )}
          <Link href='/'>FR</Link>
        </div>

        {/* Buttons */}

        {data ? (
          <div className='flex justify-center space-x-5 whitespace-nowrap'>
            <Button data-cy='signout-button' variant='secondary' reverse onClick={() => signOut()}>
              Sign Out
            </Button>
            <Image
              alt='Profile Picture'
              loader={() => data?.user?.image || ''}
              src={data.user?.image || ''}
              width={48}
              height={48}
              className='rounded-full'
            />
          </div>
        ) : (
          <div className='flex justify-center space-x-5 whitespace-nowrap'>
            <Link href='/auth/signin'>
              <Button data-cy='signin-button' variant='secondary' reverse>
                Login
              </Button>
            </Link>
            <Link href='/auth/register'>
              <Button data-cy='register-button' reverse>
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMenuBar;
