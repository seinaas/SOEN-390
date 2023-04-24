import React from 'react';
import MainLayout from '../../components/mainLayout';
import Image from 'next/image';
import type { NextPageWithLayout } from '../_app';
import Button from '../../components/button';
import { z } from 'zod';
import { jobType, workplaceType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../../server/auth';
import { api } from '../../utils/api';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';

const formSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  location: z.string().min(1).nullish(),
  jobType: z.nativeEnum(jobType),
  workplaceType: z.nativeEnum(workplaceType),
  description: z.string().min(1),
  requireResume: z.boolean().default(false),
  requireCoverLetter: z.boolean().default(false),
  requirePortfolio: z.boolean().default(false),
  requireTranscript: z.boolean().default(false),
  jobSkills: z.string().nullish(),
  applicationLink: z.string().nullish(),
});

type FormInputs = z.infer<typeof formSchema>;

const REQUIRED_DOCUMENTS = [
  {
    name: 'resume',
    value: 'Resume',
  },
  {
    name: 'cover-letter',
    value: 'CoverLetter',
  },
  {
    name: 'portfolio',
    value: 'Portfolio',
  },
  {
    name: 'transcript',
    value: 'Transcript',
  },
] as const;

const JOB_TYPES = ['FullTime', 'PartTime', 'Contract', 'Internship', 'Temporary', 'Volunteer'] as const;

const WORKPLACE_TYPES = ['Remote', 'Onsite', 'Hybrid'] as const;

const CreateJobPost: NextPageWithLayout = () => {
  const t = useTranslations('jobs');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
  });

  const createPosting = api.jobPosting.createJobPosting.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit((data) => {
      createPosting.mutate(data, {
        onSuccess: () => {
          void router.push('/jobs');
        },
      });
    })(e);
  };

  return (
    <main className='relative flex w-full justify-center xs:p-10'>
      <div className='flex w-full flex-col gap-2 rounded-xl bg-primary-100/20 p-8 sm:w-2/3'>
        <div className='flex flex-row items-center justify-center gap-6'>
          <div className='relative h-20 w-20 rounded-full bg-primary-100'>
            <Image alt={''} src={'/job-posts.png'} fill className='object-contain' />
          </div>
          <h1 className='items-center align-middle text-3xl font-semibold'>{t('create.title')}</h1>
        </div>
        <form className='flex flex-col gap-4 text-primary-600' onSubmit={onSubmit}>
          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='company'>
              {t('create.company')}
              <span className='ml-1 font-normal text-primary-300/50'>({t('create.required')})</span>
            </label>
            <input
              className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              type='text'
              id='company'
              placeholder='e.g. Google, Facebook, etc.'
              {...register('company')}
            />
            {errors.company && <span className='text-sm text-red-400'>{errors.company.message}</span>}
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='jobtitle'>
              {t('create.job-title')}
              <span className='ml-1 font-normal text-primary-300/50'>({t('create.required')})</span>
            </label>
            <input
              className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              type='text'
              id='jobtitle'
              placeholder={t('create.job-title-placeholder')}
              {...register('jobTitle')}
            />
            {errors.jobTitle && <span className='text-sm text-red-400'>{errors.jobTitle.message}</span>}
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='joblocation'>
              {t('create.location')}
              <span className='ml-1 font-normal text-primary-300/50'>({t('create.required')})</span>
            </label>
            <input
              className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              type='text'
              id='joblocation'
              placeholder='e.g. San Francisco, CA'
              {...register('location')}
            />
            {errors.location && <span className='text-sm text-red-400'>{errors.location.message}</span>}
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex flex-1 flex-col gap-1'>
              <label className='font-semibold text-primary-300' htmlFor='jobtype'>
                {t('create.job-type')}
                <span className='ml-1 font-normal text-primary-300/50'>({t('create.required')})</span>
              </label>
              <select
                className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
                id='jobtype'
                {...register('jobType')}
              >
                {JOB_TYPES.map((jobtype, i) => (
                  <option
                    className={`rounded-md ${i > 0 ? 'border-t-[1px] border-primary-500' : ''}`}
                    key={jobtype}
                    value={jobtype}
                  >
                    {t(`job-types.${jobtype}`)}
                  </option>
                ))}
              </select>
              {errors.jobType && <span className='text-sm text-red-400'>{errors.jobType.message}</span>}
            </div>

            <div className='flex flex-1 flex-col gap-1'>
              <label className='font-semibold text-primary-300' htmlFor='workplacetype'>
                {t('create.workplace-type')}
                <span className='ml-1 font-normal text-primary-300/50'>({t('create.required')})</span>
              </label>
              <select
                className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
                id='workplacetype'
                {...register('workplaceType')}
              >
                {WORKPLACE_TYPES.map((workplacetype, i) => (
                  <option
                    className={`rounded-md ${i > 0 ? 'border-t-[1px] border-primary-500' : ''}`}
                    key={workplacetype}
                    value={workplacetype}
                  >
                    {t(`workplace-types.${workplacetype}`)}
                  </option>
                ))}
              </select>
              {errors.workplaceType && <span className='text-sm text-red-400'>{errors.workplaceType.message}</span>}
            </div>
          </div>

          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='jobdescription'>
              {t('create.description')}
              <span className='ml-1 font-normal text-primary-300/50'>({t('create.required')})</span>
            </label>
            <textarea
              {...register('description')}
              placeholder={t('create.description-placeholder')}
              className='h-32 w-full flex-1 rounded-md py-2 px-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            />
            {errors.description && <span className='text-sm text-red-400'>{errors.description.message}</span>}
          </div>

          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='requireddocuments'>
              {t('create.documents')}
            </label>
            <div className='flex flex-row flex-wrap gap-4'>
              {REQUIRED_DOCUMENTS.map((doc) => (
                <label className='flex items-center gap-1 hover:cursor-pointer' key={doc.value}>
                  <input
                    className='h-4 w-4 appearance-none rounded-sm border-2 border-primary-300 transition-all duration-100 checked:bg-primary-300 hover:cursor-pointer'
                    type='checkbox'
                    {...register(`require${doc.value}`)}
                  />
                  <p className='select-none'>{t(`files.${doc.name}`)}</p>
                </label>
              ))}
            </div>
          </div>

          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='jobskills'>
              {t('create.skills')}
              <span className='ml-1 font-normal text-primary-300/50'>({t('create.comma')})</span>
            </label>
            <input
              className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              type='text'
              id='jobskills'
              placeholder='e.g. JavaScript, React, Node.js'
              {...register('jobSkills')}
            />
          </div>

          <div className='flex flex-1 flex-col gap-1'>
            <label className='font-semibold text-primary-300' htmlFor='externallink'>
              {t('create.link')}
            </label>
            <input
              className='rounded-md p-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              type='text'
              id='externallink'
              placeholder='e.g. https://google.com'
              {...register('applicationLink')}
            />
          </div>
          <div className='mt-6 flex w-48 justify-center self-center'>
            <Button fullWidth type='submit'>
              {t('create.post')}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
};

CreateJobPost.getLayout = (page) => <MainLayout>{page}</MainLayout>;
export default CreateJobPost;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      messages: JSON.parse(
        JSON.stringify(await import(`../../../public/locales/${ctx.locale || 'en'}.json`)),
      ) as IntlMessages,
    },
  };
};
