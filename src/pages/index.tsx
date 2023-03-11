import { type GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import { signOut, useSession } from 'next-auth/react';
import { api } from '../utils/api';
import Button from '../components/button';
import Link from 'next/link';
import { getServerAuthSession } from '../server/auth';
import { reloadSession } from '../utils/reloadSession';
import { useEffect } from 'react';
import TopMenuBar from '../components/topMenuBar';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ProSpects</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='flex min-h-screen min-w-fit flex-col items-center justify-center bg-primary-600'>
        <TopMenuBar></TopMenuBar>
        <LandingPageBody></LandingPageBody>
      </main>
    </>
  );
};

export default Home;

const LandingPageBody: React.FC = () => {
  const { data } = useSession();

  return (
    <>
      <div className='flex h-screen w-full flex-col bg-primary-600 md:h-auto md:flex-grow md:flex-row'>
        {/* Landing Page Picture */}
        <div className='relative h-72 md:h-auto md:w-6/12'>
          <Image
            alt='Landing Page Picture'
            src='/LandingPagePicture.png'
            fill
            className='rounded-b-2xl object-cover drop-shadow-lg md:rounded-none'
            data-cy='landingPage-picture'
          ></Image>
        </div>
        {/* Mobile Logo & User Icon */}
        <div className='my-2 flex w-full justify-between px-5 md:hidden'>
          <div className='relative  flex h-16 w-1/3'>
            <Image
              alt='Landing Page Picture'
              src='/Logo.png'
              fill
              className='object-contain'
              data-cy='landingPage-picture'
            ></Image>
          </div>
          {data && (
            <div className='relative h-10 w-10'>
              <Image
                alt='Profile Picture'
                loader={() => data?.user?.image || ''}
                src={data?.user?.image || ''}
                fill
                className='rounded-full object-contain '
                data-cy='topMenuBar-profile-picture'
              />
            </div>
          )}
        </div>
        {/* Landing Page Text */}
        <div className='flex flex-grow items-center justify-center text-white md:w-6/12'>
          <div
            className='flex w-10/12 flex-col justify-center space-y-10 text-left md:w-7/12'
            data-cy='landingPage-text-welcome'
          >
            <p className='text-2xl font-semibold uppercase leading-10 md:text-3xl md:leading-10'>
              We know you&apos;re a{' '}
              <span className='rounded-lg bg-white px-2 py-1 font-bold text-primary-500'>pro</span>
            </p>
            <p>
              Welcome to ProSpects! We make it easy to find your ideal job. Connect with people with similar interests
              and expand your network!
            </p>
            <p>Join us for unlimited opportunites!</p>
            <Link
              href='/auth/register'
              className=' hidden font-bold underline md:inline-block'
              data-cy='landingPage-link-becomeMember'
            >
              Become a member
            </Link>
          </div>
        </div>
        {/* Mobile buttons */}

        {data ? (
          <div className='my-10 flex justify-center space-x-24 whitespace-nowrap md:hidden'>
            <Button data-cy='signout-button' variant='secondary' reverse onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className='my-10 flex justify-center space-x-24 whitespace-nowrap md:hidden'>
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
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session && (!session.user?.firstName || !session.user?.lastName)) {
    return {
      redirect: {
        destination: '/auth/final',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
