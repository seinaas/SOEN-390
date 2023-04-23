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
    <div
      className=' hidden h-20 w-full items-center justify-between bg-primary-600 pl-5 pr-10 md:flex'
      data-cy='topMenuBar'
    >
      {/* Logo */}
      <Link href='/' className='relative h-16 w-36' data-cy='topMenuBar-logo'>
        <Image priority alt='ProSpect Logo' src='/Logo.png' fill className='object-contain' />
      </Link>

      {/* Links */}
      <div className='flex items-center gap-8 '>
        <motion.div layout className=' flex w-full justify-end space-x-7 text-lg font-semibold text-white'>
          <Link href='/' data-cy='topMenuBar-link-about'>
            {t('landing.header.about')}
          </Link>
          {!data && (
            <>
              <Link href='/' data-cy='topMenuBar-link-jobs'>
                {t('landing.header.jobs')}
              </Link>
              <Link href='/' data-cy='topMenuBar-link-contact'>
                {t('landing.header.contact')}
              </Link>
            </>
          )}
          <Link href='/' locale={router.locale === 'fr' ? 'en' : 'fr'} data-cy='topMenuBar-link-language'>
            {router.locale === 'fr' ? 'EN' : 'FR'}
          </Link>
        </motion.div>

        {/* Buttons */}

        {data ? (
          <div className='flex justify-center space-x-5 whitespace-nowrap'>
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
          <motion.div layout className='flex justify-center space-x-5 whitespace-nowrap'>
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
