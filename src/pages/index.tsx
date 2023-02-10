import { GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import { signOut, useSession } from 'next-auth/react';

import { api } from '../utils/api';
import Button from '../components/button';
import Input from '../components/input';
import Link from 'next/link';
import { getServerAuthSession } from '../server/auth';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ProSpects</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='flex min-h-screen flex-col items-center justify-center bg-primary-600'>
        <div className='container flex flex-col items-center justify-center gap-12 px-4 py-16 '>
          <div className='flex flex-col items-center gap-2'>
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  console.log(sessionData);

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <div className='text-center text-2xl text-white'>
        {sessionData?.user?.firstName && sessionData.user.lastName && (
          <span>
            Logged in as {sessionData.user?.firstName} {sessionData.user?.lastName}
          </span>
        )}
        {secretMessage && <span> - {secretMessage}</span>}
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
