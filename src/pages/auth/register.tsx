/*
 *		Registration Form Component
 *
 *
 *		This is a Next.js page component for registering users. It defines a registration form schema using Zod, and handles form submissions with React Hook Form.
 *		It also integrates with Next.js authentication using next-auth and handles form errors and API request errors. The component uses Framer Motion for animations
 *		and a custom AuthLayout component. Additionally, it defines a server-side function that redirects authenticated users to the homepage or the final authentication
 *		page, depending on whether they have completed the signup process.
 */
import { type GetServerSidePropsContext } from 'next';
import { useState, type ReactElement } from 'react';
import { getServerAuthSession } from '../../server/auth';
import { type NextPageWithLayout } from '../_app';
import AuthLayout from '../../components/authLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/button';
import { api } from '../../utils/api';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Input from '../../components/input';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

type FormInputs = z.infer<typeof formSchema>;

export const Register: NextPageWithLayout = () => {
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const signUp = api.auth.register.useMutation();

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

    await handleSubmit((data) => {
      signUp.mutate(data, {
        onSuccess: () => {
          (async () => {
            const res = await signIn('credentials', {
              ...data,
              redirect: false,
            });

            if (res?.error) {
              setError(res.error);
            } else {
              await router.push(res?.url || '/');
            }
          })().catch(() => {
            // do nothing
          });
        },
        onError: (err) => {
          setError(err.message);
        },
      });
    })(e);
  };

  return (
    <motion.form layout className='flex w-full flex-col gap-4' onSubmit={onSubmit}>
      <Input data-cy='email-input' type='email' placeholder='Email' autoComplete='email' {...register('email')} />
      <Input
        data-cy='password-input'
        type='password'
        placeholder='Password'
        autoComplete='new-password'
        {...register('password')}
      />
      <Input
        data-cy='confirm-password-input'
        type='password'
        placeholder='Confirm Password'
        autoComplete='new-password'
        {...register('confirmPassword')}
      />
      {isError && (
        <p className='text-center text-sm text-red-600'>{error || errors.email?.message || errors.password?.message}</p>
      )}

      <Button layoutId='auth-btn' fullWidth data-cy='register-btn'>
        Register
      </Button>
    </motion.form>
  );
};

Register.getLayout = (page: ReactElement) => <AuthLayout type='register'>{page}</AuthLayout>;

export default Register;

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

  return { props: {} };
};
