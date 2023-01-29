import { type NextPage } from 'next';
import Head from 'next/head';
import { signIn, signOut, useSession } from 'next-auth/react';

import { api } from '../utils/api';
import { Button } from '../components/button';

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: 'from tRPC' });

  return (
    <>
      <Head>
        <title>ProSpects</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]'>
        <div className='container flex flex-col items-center justify-center gap-12 px-4 py-16 '>
          <div className='flex flex-col items-center gap-2'>
            <p className='text-2xl text-white'>{hello.data ? hello.data.greeting : 'Loading tRPC query...'}</p>
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

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className='flex flex-col items-center justify-center gap-4'>
      <p className='text-center text-2xl text-white'>
        {sessionData && (
          <span>
            Logged in as {sessionData.user?.firstName} {sessionData.user?.lastName}
          </span>
        )}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <Button
        data-cy='auth-button'
        variant='secondary'
        reverse
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? 'Sign out' : 'Sign in'}
      </Button>
    </div>
  );
};
