import { type ReactElement } from 'react';
import { type NextPageWithLayout } from '../_app';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getServerAuthSession } from '../../server/auth';
import { type GetServerSidePropsContext } from 'next';
import AuthLayout from '../../components/authLayout';
import { Button } from '../../components/button';

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
    <form className='flex w-full flex-col gap-4' onSubmit={() => handleSubmit(onSubmit)}>
      <input
        type='email'
        placeholder='Email'
        autoComplete='email'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('email')}
      />
      <input
        type='password'
        placeholder='Password'
        autoComplete='new-password'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('password')}
      />
      <Button fullWidth>Sign In</Button>
    </form>
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
