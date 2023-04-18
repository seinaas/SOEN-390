import React, { useState, type ReactElement } from 'react';
import { type NextPageWithLayout } from '../_app';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getServerAuthSession } from '../../server/auth';
import { type GetServerSidePropsContext } from 'next';
import AuthLayout from '../../components/authLayout';
import Button from '../../components/button';
import Input from '../../components/input';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormInputs = z.infer<typeof formSchema>;

export const SignIn: NextPageWithLayout = () => {
  const t = useTranslations('auth');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
  });

  const isError = error || errors.email?.message || errors.password?.message;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit(async (data) => {
      const res = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        await router.push(res?.url || '/');
      }
    })(e);
  };

  return (
    <motion.form className='flex w-full flex-col gap-4' onSubmit={onSubmit}>
      <Input data-cy='email-input' type='email' placeholder={t('email')} autoComplete='email' {...register('email')} />
      <Input
        data-cy='password-input'
        type='password'
        placeholder={t('password')}
        autoComplete='new-password'
        {...register('password')}
      />
      <Button data-cy='signin-btn' layoutId='auth-btn' fullWidth>
        {t('login')}
      </Button>
      {isError && (
        <p className='text-center text-sm text-red-600'>{error || errors.email?.message || errors.password?.message}</p>
      )}
    </motion.form>
  );
};

SignIn.getLayout = (page: ReactElement) => <AuthLayout type='signIn'>{page}</AuthLayout>;

export default SignIn;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    if (session.user?.firstName && session.user?.lastName) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    } else {
      return {
        redirect: {
          destination: '/auth/final',
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      messages: JSON.parse(
        JSON.stringify(await import(`../../../public/locales/${ctx.locale || 'en'}.json`)),
      ) as IntlMessages,
    },
  };
};
