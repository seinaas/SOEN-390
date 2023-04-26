/*
 *		About Us Page Component
 *
 *
 *		This file defines the Contact Us page, which includes a form for users to send a message to ProSpects. It imports the TopMenuBar component and the Button component, as well as the
 *    IoCallSharp icon from the react-icons library. The ContactUsPageBody component renders the form using translations from the 'contact' locale. The form includes input fields for name
 *    and email, as well as a textarea for the message subject. The getServerSideProps function is used to import translations based on the user's locale.
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
