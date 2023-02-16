import React, { useRef, useState } from 'react';
import { Button } from '../../components/button';
import { type NextPageWithLayout } from '../_app';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';

const formSchema2 = z.object({
  school: z.string().nullish(),
  degree: z.string().nullish(),
  location: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  description: z.string().nullish(),
});

type FormInputs = z.infer<typeof formSchema>;

export const updateEducation: NextPageWithLayout = () => {
  const profileMutation = api.user.updateEducation.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema2),
    mode: 'onChange',
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit((data) => {
      console.log(data);
      const res = profileMutation.mutate({
        ...data,
        educationId: 'cle7m9tlc0005wacbegsoqot1',
      });
    })(e);
  };

  return (
    <form className='flex w-full flex-col gap-10' onSubmit={onSubmit}>
      <input
        type='School'
        placeholder='School'
        autoComplete='School'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('school')}
      />

      <input
        type='Degree'
        placeholder='Degree'
        autoComplete='Degree'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('degree')}
      />

      <input
        type='location'
        placeholder='Location'
        autoComplete='ocation'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('location')}
      />

      <input
        type='Description'
        placeholder='Description'
        autoComplete='Description'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('description')}
      />
      <input
        type='date'
        placeholder='Starting Date'
        autoComplete='Starting Date'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('startDate')}
      />
      <input
        type='date'
        placeholder='Ending Date'
        autoComplete='Ending Date'
        className='text-md w block rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('endDate')}
      />

      <Button fullWidth> Update </Button>
    </form>
  );
};
export default updateEducation;
