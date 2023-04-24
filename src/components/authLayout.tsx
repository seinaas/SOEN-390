/*
 *		Authentication Layout Modal
 *
 *
 *		This is the HTML design of the box used to authenticate the user on login. It creates the buttons for third party authenticators, and attachs said third part functionalities to those buttons.
 *		It also contains some changing layouts depending whether the user is logging in or registering for the first time.
 */
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { LayoutGroup, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type AuthPageProps = {
  type: 'signIn' | 'register';
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthPageProps> = ({ type, children }) => {
  const t = useTranslations('auth');

  return (
    <>
      <Head>
        <title>ProSpects Auth</title>
      </Head>
      <main className='relative z-0 flex h-screen overflow-hidden bg-primary-600'>
        <div
          className='flex grow items-center justify-center p-0 xs:p-6 sm:p-12'
          // * CARD ROTATION
          // style={{ perspective: 1000 }}
        >
          <LayoutGroup>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              layout
              className='relative flex h-full w-full flex-col items-center justify-center gap-4 rounded-none bg-white px-6 pt-12 pb-20 text-black xs:h-auto xs:w-auto xs:min-w-[400px] xs:rounded-lg xs:px-12'
            >
              <motion.div layout className='relative mb-4 h-20 w-full'>
                <Link href='/'>
                  <Image priority alt='ProSpects Logo' src='/LogoAlt.png' fill className='object-contain' />
                </Link>
              </motion.div>
              {children}

              <motion.div layout className='flex items-center justify-center gap-4'>
                <div className='h-0.5 min-w-full grow bg-primary-500' />
                <span className='text-primary-500'>{t('or')}</span>
                <div className='h-0.5 min-w-full grow bg-primary-500' />
              </motion.div>

              {/* third party login buttons */}
              <motion.div layout className='flex w-full justify-center gap-8'>
                <button
                  data-cy='google-btn'
                  className='flex items-center justify-center rounded-lg border-2 border-primary-600 p-2 transition-colors duration-300 hover:bg-primary-600'
                  onClick={() => void signIn('google')}
                >
                  <Image alt='Google Logo' src='/logos/google.svg' width={32} height={32} />
                </button>
                <button
                  data-cy='facebook-btn'
                  className='flex items-center justify-center rounded-lg border-2 border-primary-600 p-2 transition-colors duration-300 hover:bg-primary-600'
                  onClick={() => void signIn('facebook')}
                >
                  <Image alt='Facebook Logo' src='/logos/facebook.svg' width={32} height={32} />
                </button>
                <button
                  data-cy='microsoft-btn'
                  className='flex items-center justify-center rounded-lg border-2 border-primary-600 p-2 transition-colors duration-300 hover:bg-primary-600'
                  onClick={() => void signIn('microsoft')}
                >
                  <Image alt='Microsoft Logo' src='/logos/microsoft.svg' width={32} height={32} />
                </button>
              </motion.div>

              <p className='absolute bottom-4 w-full text-center'>
                {type === 'register' ? t('have-account') : t('no-account')}
                <Link
                  href={type === 'register' ? '/auth/signin' : '/auth/register'}
                  className='ml-1 font-bold text-primary-500'
                >
                  {type === 'register' ? t('signin') : t('register')}
                </Link>
              </p>
            </motion.div>
          </LayoutGroup>
        </div>
      </main>
    </>
  );
};

export default AuthLayout;
