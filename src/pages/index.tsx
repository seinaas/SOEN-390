import { type GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import { signOut, useSession } from 'next-auth/react';
import { api } from '../utils/api';
import Button from '../components/button';
import Link from 'next/link';
import { getServerAuthSession } from '../server/auth';
import { reloadSession } from '../utils/reloadSession';
import { useEffect } from 'react';
import Header from '../components/header';
import TopMenuBar from '../components/topMenuBar';
import Image from 'next/image';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ProSpects</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='flex min-h-screen flex-col items-center justify-center bg-primary-600'>
        <TopMenuBar></TopMenuBar>
        <LandingPageBody></LandingPageBody>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  useEffect(() => {
    if (sessionData && !sessionData?.user?.firstName && !sessionData?.user?.lastName) reloadSession();
  }, [sessionData]);

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <div className='text-center text-2xl text-white'>
        {sessionData?.user?.firstName && sessionData.user.lastName && (
          <span>
            Logged in as {sessionData.user?.firstName} {sessionData.user?.lastName}
          </span>
        )}
        {secretMessage && <span> - {secretMessage} </span>}
      </div>
      {sessionData ? (
        <Button data-cy='signout-button' variant='secondary' reverse onClick={() => signOut()}>
          Sign Out
        </Button>
      ) : (
        <div className='flex items-center justify-center gap-4'>
          <Link href='/auth/signin'>
            <Button data-cy='signin-button' variant='secondary' reverse>
              Sign In
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
  );
};

const LandingPageBody: React.FC = () => {
  return (
    <>
      <div className='flex w-full flex-grow flex-row justify-between'>
        <div className='relative flex w-6/12 items-center justify-start bg-primary-600'>
          <Image
            alt='Landing Page Picture'
            src='/LandingPagePicture.png'
            fill
            className='object-cover
          '
          ></Image>
        </div>
        <div className=' flex w-6/12 items-center justify-center justify-center bg-primary-600 text-white'>
          <div className='flex w-7/12 flex-col items-center justify-center space-y-10 text-center'>
            <p className='text-2xl font-semibold uppercase'>Welcome to ProSpect</p>
            <p>
              We make it easy to find your ideal job. Connect with people with similar interests and expand your
              network!
            </p>
            <p>Join us for unlimited opportunites.</p>
            <Link href='/auth/signin' className='text-primary-200 underline'>
              Become a member
            </Link>
          </div>
        </div>
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
