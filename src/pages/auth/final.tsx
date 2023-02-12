import { type GetServerSidePropsContext } from 'next';
import { useState, type ReactElement } from 'react';
import { getServerAuthSession } from '../../server/auth';
import { type NextPageWithLayout } from '../_app';
import AuthLayout from '../../components/authLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../../components/button';
import { motion } from 'framer-motion';
import Input from '../../components/input';
import { api } from '../../utils/api';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

type FormInputs = z.infer<typeof formSchema>;

export const Register: NextPageWithLayout = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setName = api.user.update.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
  });

  const isError = error || errors.firstName?.message || errors.lastName?.message;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit((data) => {
      setName.mutate(data, {
        onSuccess: () => {
          router.replace('/');
        },
        onError: (err) => {
          setError(Array.isArray(err) ? (err[0] as typeof err).message : err.message);
        },
      });
    })(e);
  };

  return (
    <main className='relative z-0 flex h-screen justify-center overflow-hidden bg-primary-600'>
      <div className='flex w-full max-w-[1000px] flex-col items-start justify-center p-20'>
        <div className='mb-12 text-white'>
          <h1 className='text-9xl font-thin'>One last step</h1>
          <h2 className='text-4xl'>Let&apos;s finalize your profile! All we need is your name:</h2>
        </div>
        <div className='flex min-w-[400px] flex-col items-center gap-4 self-center rounded-lg bg-white px-12 pt-12 pb-14 text-black'>
          <motion.form layout className='flex w-full flex-col gap-4' onSubmit={onSubmit}>
            <Input type='text' placeholder='John' autoComplete='given-name' {...register('firstName')} />
            <Input type='text' placeholder='Doe' autoComplete='family-name' {...register('lastName')} />
            {isError && (
              <p className='text-center text-sm text-red-600'>
                {error || errors.firstName?.message || errors.lastName?.message}
              </p>
            )}

            <Button fullWidth>Get Started</Button>
          </motion.form>
        </div>
      </div>
    </main>
  );
};

export default Register;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  } else if (session?.user?.firstName && session.user.lastName) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
