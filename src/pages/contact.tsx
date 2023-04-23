/*
 *        Contact Us Section from the landing navigation bar
 *        This file contains the contact us section in which the user can send a message to the team of ProSpects.
 */
import TopMenuBar from '../components/topMenuBar';
import Button from '../components/button';
import { IoCallSharp } from 'react-icons/io5';
import { GetServerSidePropsContext, NextPage } from 'next';
import { useTranslations } from 'next-intl';

const ContactUs: NextPage = () => {
  return (
    <>
      <div>
        <title>ProSpects</title>
        <link rel='icon' href='/favicon.ico' />
      </div>
      <main className='flex min-h-screen min-w-fit flex-col items-center justify-center bg-primary-600'>
        <TopMenuBar></TopMenuBar>
        <ContactUsPageBody></ContactUsPageBody>
      </main>
    </>
  );
};

export default ContactUs;

const ContactUsPageBody: React.FC = () => {
  const t = useTranslations('contact');
  return (
    <main className='fsm:p-12" flex grow flex-col items-center justify-center gap-10 p-0 xs:p-6'>
      <form className='flex flex-col'>
        <div className='flex flex-1 flex-col gap-4 rounded-md bg-white p-10'>
          <div className='flex flex-row items-center gap-2 text-primary-500'>
            <h1 className=' text-xl font-bold uppercase'>{t('title')}</h1>
            <IoCallSharp />
          </div>
          <p className='text-md font-semibold'>{t('form.1')}</p>
          <input
            className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 text-black shadow-inner outline-0 ring-0 disabled:opacity-75'
            type='text'
            id='name'
            name='name'
            placeholder={t('form.2')}
          />
          <input
            className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 text-black shadow-inner outline-0 ring-0 disabled:opacity-75'
            type='text'
            id='email'
            name='email'
            placeholder={t('form.3')}
          />
          <textarea
            className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 text-black shadow-inner outline-0 ring-0 disabled:opacity-75'
            id='subject'
            name='subject'
            placeholder={t('form.4')}
            style={{ height: '200px' }}
          ></textarea>
          <Button type='submit' value='Submit'>
            {t('button')}
          </Button>
        </div>
      </form>
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
