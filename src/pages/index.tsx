import { type GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import { signOut, useSession } from 'next-auth/react';
import Button from '../components/button';
import Link from 'next/link';
import { getServerAuthSession } from '../server/auth';
import TopMenuBar from '../components/topMenuBar';
import Image from 'next/image';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  return (
    <>
      <div className='flex h-screen w-full flex-col bg-primary-600 py-8 px-4 md:h-auto md:flex-grow md:flex-row md:gap-10 md:px-16'>
        {/* Landing Page Picture */}
        <div className='relative h-72 flex-1 md:h-auto'>
          <Image
            alt='Landing Page Picture'
            src='/prospects-landing.png'
            fill
            className='rounded-b-2xl object-contain drop-shadow-lg md:rounded-none'
            data-cy='landingPage-picture'
          ></Image>
        </div>
        {/* Mobile Logo & User Icon */}
        <div className='my-2 flex w-full items-center justify-between px-5 md:hidden'>
          <div className='relative flex h-16 w-32'>
            <Image alt='ProSpects Logo' src='/Logo.png' fill className='object-contain' data-cy='logo'></Image>
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
        <div className='flex flex-1 items-center justify-center text-white'>
          <div className='flex flex-col justify-center gap-10 px-6 text-left' data-cy='landingPage-text-welcome'>
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
              className='hidden font-bold underline md:inline-block'
              data-cy='landingPage-link-becomeMember'
            >
              Become a member
            </Link>
          </div>
        </div>
        {/* Mobile buttons */}
        {data ? (
          <div className='my-10 flex max-w-sm whitespace-nowrap px-4 md:hidden'>
            <Button fullWidth data-cy='signout-button' variant='secondary' reverse onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className='my-10 flex min-h-max justify-center gap-4 whitespace-nowrap px-4 md:hidden'>
            <Button
              onClick={() => router.push('/auth/signin')}
              fullWidth
              data-cy='mobile-signin-button'
              variant='secondary'
              reverse
            >
              Login
            </Button>
            <Button onClick={() => router.push('/auth/register')} fullWidth data-cy='mobile-register-button' reverse>
              Sign Up
            </Button>
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
