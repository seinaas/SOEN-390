/*
 *		Top Menu Bar React Layout
 *
 *
 *		This is a React template for the menu bar at the top of each webpage, which allows for navigation between different webpages within the wesite. It contains links needed for navigation, as well as buttons
 *		for sign-in and sign-out if needed. It also does some styling and animation handling.
 */
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Button from '../components/button';

const TopMenuBar: React.FC = () => {
  const { data } = useSession();

  return (
    <div
      className=' hidden h-20 w-full items-center justify-between bg-primary-600 pl-5 pr-10 md:flex'
      data-cy='topMenuBar'
    >
      {/* Logo */}
      <Link href='/' className='relative h-16 w-36' data-cy='topMenuBar-logo'>
        <Image alt='ProSpect Logo' src='/Logo.png' fill className='object-contain' />
      </Link>

      {/* Links */}
      <div className='flex items-center space-x-10 '>
        <div className=' flex w-full justify-end space-x-7 text-lg font-semibold text-white'>
          <Link href='/' data-cy='topMenuBar-link-about'>
            ABOUT
          </Link>
          {!data && (
            <>
              <Link href='/' data-cy='topMenuBar-link-jobs'>
                JOBS
              </Link>
              <Link href='/' data-cy='topMenuBar-link-people'>
                PEOPLE
              </Link>
            </>
          )}
          <Link href='/' data-cy='topMenuBar-link-language'>
            FR
          </Link>
        </div>

        {/* Buttons */}

        {data ? (
          <div className='flex justify-center space-x-5 whitespace-nowrap'>
            <Button data-cy='signout-button' variant='secondary' reverse onClick={() => signOut()}>
              Sign Out
            </Button>
            <div className='relative h-10 w-10'>
              <Image
                alt='Profile Picture'
                loader={() => data?.user?.image || ''}
                src={data.user?.image || ''}
                fill
                className='rounded-full object-contain '
                data-cy='topMenuBar-profile-picture'
              />
            </div>
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
