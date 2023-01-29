import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../components/button';

type AuthPageProps = {
  type: 'signIn' | 'register';
  children: React.ReactNode;
};

const AuthLayout: React.FC<AuthPageProps> = ({ type, children }) => {
  return (
    <>
      <Head>
        <title>ProSpects Auth</title>
      </Head>
      <main className='relative z-0 flex h-screen overflow-hidden bg-primary-600'>
        <div
          className='flex grow items-center justify-center p-12'
          // * CARD ROTATION
          // style={{ perspective: 1000 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex min-w-[400px] flex-col items-center gap-4 rounded-lg bg-white px-12 pt-12 pb-20 text-black backdrop-blur-sm'
          >
            {children}

            <motion.div layout className='flex items-center justify-center gap-4'>
              <div className='h-0.5 min-w-full grow bg-primary-500' />
              <span className='text-primary-500'>or</span>
              <div className='h-0.5 min-w-full grow bg-primary-500' />
            </motion.div>

            {/* third party login buttons */}
            <motion.div layout className='flex w-full justify-center gap-8'>
              <button
                className='flex items-center justify-center rounded-lg border-2 border-primary-600 p-3'
                onClick={() => void signIn('google')}
              >
                <Image alt='Google Logo' src='/logos/google-icon.svg' width={22} height={22} />
              </button>
              <button
                className='flex items-center justify-center rounded-lg border-2 border-primary-600 p-3'
                onClick={() => void signIn('google')}
              >
                <Image alt='Google Logo' src='/logos/google-icon.svg' width={22} height={22} />
              </button>
              <button
                className='flex items-center justify-center rounded-lg border-2 border-primary-600 p-3'
                onClick={() => void signIn('google')}
              >
                <Image alt='Google Logo' src='/logos/google-icon.svg' width={22} height={22} />
              </button>
            </motion.div>

            <p className='absolute bottom-4 w-full text-center'>
              {type === 'register' ? 'Already Have an Account?' : 'No Account?'}
              <Link
                href={type === 'register' ? '/auth/signin' : '/auth/register'}
                className='ml-1 font-bold text-primary-500'
              >
                {type === 'register' ? 'Sign In' : 'Register'}
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default AuthLayout;
