import React from 'react';
import { Button } from '../../components/button';
import { type NextPageWithLayout } from '../_app';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';

const formSchema = z.object({
  bio: z.string().nullish(),
  languages: z.string().nullish(),
  skills: z.string().nullish(),
});

type FormInputs = z.infer<typeof formSchema>;

export const UpdateProfile: NextPageWithLayout = () => {
  const profileMutation = api.user.update.useMutation();
  //const router = useRouter();
  //const { email } = router.query;
  // const { data } = api.user.getByEmail.useQuery({ email: email as string });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit((data) => {
      console.log(data);
      const res = profileMutation.mutate(data);
      console.log(res);
    })(e);
  };

  return (
    <form className='flex w-full flex-col gap-10' onSubmit={onSubmit}>
      <input
        type='About'
        placeholder='About'
        autoComplete='About'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('bio')}
      />
      <input
        type='languages'
        placeholder='Languages'
        autoComplete='Languages'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('languages')}
      />
      <input
        type='skills'
        placeholder='Skills'
        autoComplete='skills'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('skills')}
      />
      <Button fullWidth>Save Changes</Button>
    </form>
  );
};

export default UpdateProfile;
