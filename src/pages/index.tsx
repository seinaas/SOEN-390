/*
 *		Landing Page Component
 *
 *
 *		This is a Next.js page component that renders a landing page. It contains a navigation bar, a landing page picture, landing page text, and mobile buttons.
 *		The landing page body component checks for user session data and renders different content based on its presence. The getServerSideProps function determines
 *		whether a user session exists and redirects the user to the appropriate page.
 */
import { type GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import { signOut, useSession } from 'next-auth/react';
import Button from '../components/button';
import Link from 'next/link';
import { getServerAuthSession } from '../server/auth';
import TopMenuBar from '../components/topMenuBar';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('landing');

  return (
    <main className='flex h-full w-full flex-grow flex-col bg-primary-600 py-8 px-4 md:h-auto md:flex-row md:gap-10 md:px-16'>
      {/* Landing Page Picture */}
      <div className='relative flex h-72 flex-1 justify-center md:h-auto'>
        <Image
          alt='Landing Page Picture'
          src='/prospects-landing.png'
          fill
          className='object-contain'
          data-cy='landingPage-picture'
          priority
        />
      </div>
      {/* Mobile Logo & User Icon */}
      <div className='my-2 flex w-full items-center justify-between px-5 md:hidden'>
        <div className='relative flex h-16 w-32'>
          <Image alt='ProSpects Logo' src='/Logo.png' fill className='object-contain' data-cy='logo' />
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
            {t('heading.1')}
            <span className='rounded-lg bg-white px-2 py-1 font-bold text-primary-500'>{t('heading.2')}</span>
          </p>
          <p>{t('welcome.1')}</p>
          <p>{t('welcome.2')}</p>
          <Link
            href='/auth/register'
            className='hidden font-bold underline md:inline-block'
            data-cy='landingPage-link-becomeMember'
          >
            {t('button')}
          </Link>
        </div>
      </div>
      {/* Mobile buttons */}
      {data ? (
        <div className='my-10 flex max-w-sm whitespace-nowrap px-4 md:hidden'>
          <Button fullWidth data-cy='signout-button-mobile' variant='secondary' reverse onClick={() => signOut()}>
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
    </main>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    if (!session.user?.firstName || !session.user?.lastName) {
      return {
        redirect: {
          destination: '/auth/final',
          permanent: false,
        },
      };
    }
    return {
      redirect: {
        destination: '/feed',
        permanent: false,
      },
    };
  }

  return {
    props: {
      messages: JSON.parse(
        JSON.stringify(await import(`../../public/locales/${ctx.locale || 'en'}.json`)),
      ) as IntlMessages,
    },
  };
};
