import { type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { type NextPageWithLayout } from '../_app';
import AuthLayout from './layout';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getServerAuthSession } from '../../server/auth';
import { type GetServerSidePropsContext } from 'next';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormInputs = z.infer<typeof formSchema>;

export const SignIn: NextPageWithLayout = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });
  const onSubmit = (data: FormInputs) => console.log(data);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.2,
      }}
      className='flex w-full flex-col gap-4'
      onSubmit={() => handleSubmit(onSubmit)}
    >
      <input
        type='email'
        placeholder='Email'
        autoComplete='email'
        disabled
        className='text-md block w-full rounded-lg border-rose-50 bg-rose-50 p-3 text-indigo-800 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('email')}
      />
      <input
        type='password'
        placeholder='Password'
        autoComplete='new-password'
        disabled
        className='text-md block w-full rounded-lg border-rose-50 bg-rose-50 p-3 text-indigo-800 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('password')}
      />
      {/* <Button fullWidth text='Sign In' reverse disabled /> */}
    </motion.form>
  );
};

SignIn.getLayout = (page: ReactElement) => <AuthLayout type='signIn'>{page}</AuthLayout>;

export default SignIn;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
