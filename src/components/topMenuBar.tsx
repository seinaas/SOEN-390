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
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const TopMenuBar: React.FC = () => {
  const { data } = useSession();
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className='flex h-20 w-full items-center justify-between bg-primary-600 pl-5 pr-10' data-cy='topMenuBar'>
      {/* Logo */}
      <Link href='/' className='relative hidden h-16 w-36 md:block' data-cy='topMenuBar-logo'>
        <Image priority alt='ProSpect Logo' src='/Logo.png' fill className='object-contain' />
      </Link>

      {/* Links */}
      <div className='flex items-center gap-8 '>
        <motion.div layout className=' flex w-full justify-end space-x-7 text-lg font-semibold text-white'>
          <Link href='/about' data-cy='topMenuBar-link-about'>
            {t('landing.header.about')}
          </Link>
          {!data && (
            <>
              <Link href='/contact' data-cy='topMenuBar-link-contact'>
                {t('landing.header.contact')}
              </Link>
            </>
          )}
          <Link href={router.asPath} locale={router.locale === 'fr' ? 'en' : 'fr'} data-cy='topMenuBar-link-language'>
            {router.locale === 'fr' ? 'EN' : 'FR'}
          </Link>
        </motion.div>

        {/* Buttons */}

        {data ? (
          <div className='hidden justify-center space-x-5 whitespace-nowrap md:flex'>
            <Button data-cy='signout-button' variant='secondary' reverse onClick={() => signOut()}>
              {t('auth.signout')}
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
          <motion.div layout className='hidden justify-center space-x-5 whitespace-nowrap md:flex'>
            <Link href='/auth/signin'>
              <Button data-cy='signin-button' variant='secondary' reverse>
                {t('auth.login')}
              </Button>
            </Link>
            <Link href='/auth/register'>
              <Button data-cy='register-button' reverse>
                {t('auth.signup')}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TopMenuBar;
