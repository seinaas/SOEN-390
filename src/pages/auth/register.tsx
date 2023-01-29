import { type GetServerSidePropsContext } from 'next';
import { type ReactElement } from 'react';
import { getServerAuthSession } from '../../server/auth';
import { type NextPageWithLayout } from '../_app';
import AuthLayout from './layout';

export const Register: NextPageWithLayout = () => {
  return <></>;
};

Register.getLayout = (page: ReactElement) => <AuthLayout type='register'>{page}</AuthLayout>;

export default Register;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: '/app/home',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
