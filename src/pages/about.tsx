/*
 *        About Us Section from the landing navigation bar
 *        This file contains the about us section in which the user can read about ProSpects.
 */
import TopMenuBar from '../components/topMenuBar';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';

const AboutUs: NextPage = () => {
  return (
    <>
      <div>
        <title>ProSpects</title>
        <link rel='icon' href='/favicon.ico' />
      </div>
      <main className='flex min-h-screen min-w-fit flex-col items-center justify-center bg-primary-600'>
        <TopMenuBar></TopMenuBar>
        <AboutUsPageBody></AboutUsPageBody>
      </main>
    </>
  );
};

export default AboutUs;

const AboutUsPageBody: React.FC = () => {
  const t = useTranslations('about');
  return (
    <main className='flex h-full w-full flex-col bg-primary-600 py-20 px-4 md:h-auto md:flex-grow md:flex-row md:gap-10 md:px-16'>
      {/* Landing Page Text */}
      <div className='flex flex-1 items-center justify-center text-white'>
        <div className='flex flex-col justify-center gap-10 px-6 text-left'>
          <p className='text-2xl font-semibold uppercase leading-10 md:text-3xl md:leading-10'>
            <span className='rounded-lg bg-white px-2 py-1 font-bold text-primary-500'>{t('title')}</span>
          </p>
          <p>{t('welcome.1')}</p>
          <p>{t('welcome.2')}</p>
          <p>{t('welcome.3')}</p>
          <p>{t('welcome.4')}</p>
          <p>{t('welcome.5')}</p>
        </div>
      </div>
    </main>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  return {
    props: {
      messages: JSON.parse(
        JSON.stringify(await import(`../../public/locales/${ctx.locale || 'en'}.json`)),
      ) as IntlMessages,
    },
  };
};
