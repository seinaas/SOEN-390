import React, { useRef, useState } from 'react';
import { Button } from '../../components/button';
import { type NextPageWithLayout } from '../_app';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';

const formSchema = z.object({
  title: z.string().nullish(),
  company: z.string().nullish(),
  location: z.string().nullish(),
  description: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

type FormInputs = z.infer<typeof formSchema>;

export const createJob: NextPageWithLayout = () => {
  const profileMutation = api.user.createJob.useMutation();

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
        type='Company Logo'
        placeholder='Company Logo'
        autoComplete='Company Logo'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        //{...register('')}
      />

      <input
        type='Job Title'
        placeholder='Job Title'
        autoComplete='Job Title'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('title')}
      />

      <input
        type='Company Name'
        placeholder='Company Name'
        autoComplete='Company Name'
        className='text-md block w-full rounded-lg border-2 border-primary-600 p-3 shadow-inner outline-0 ring-0 disabled:opacity-75'
        {...register('company')}
      />

      <input
        type='Job Description'
        placeholder='Job Description'
        autoComplete='Job Description'
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

      <Button fullWidth> Create </Button>
    </form>
  );
};
export default createJob;
