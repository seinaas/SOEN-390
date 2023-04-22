import React, { useState } from 'react';
import MainLayout from '../../components/mainLayout';
import Image from 'next/image';
import type { NextPageWithLayout } from '../_app';
import Button from '../../components/button';

const CreateJobPost: NextPageWithLayout = (props) => {
  return (
    <main className='relative flex w-full justify-center xs:p-10'>
      <div className='flex w-full flex-col gap-2 rounded-xl bg-primary-100/20 p-8 sm:w-2/3'>
        <div className='flex flex-row justify-center gap-10'>
          <h1 className='mb-4 items-center align-middle text-3xl font-semibold'>Create a Job Post</h1>
          <div className='relative h-20 w-20 rounded-full bg-primary-100 p-10'>
            <Image alt={''} src={'/job-posts.png'} fill className='object-contain' />
          </div>
        </div>
        <form className='flex flex-col gap-4'>
          <label htmlFor='jobtitle'>Job Title</label>
          <input
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            type='text'
            id='jobtitle'
            name='jobtitle'
            required
          />

          <label htmlFor='company'>Company</label>
          <input
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            type='text'
            id='company'
            name='company'
            required
          />

          <label htmlFor='joblocation'>Job Location</label>
          <input
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            type='text'
            id='joblocation'
            name='joblocation'
            required
          />

          <label htmlFor='jobtype'>Job Type</label>
          <select
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            id='jobtype'
            name='jobtype'
            required
          >
            {['', 'Full-time', 'Part-time', 'Contract', 'Temporary', 'Volunteer', 'Internship'].map((jobtype, i) => (
              <option
                className={`rounded-md ${i > 0 ? 'border-t-[1px] border-primary-500' : ''}`}
                key={jobtype}
                value={jobtype}
              >
                {jobtype}
              </option>
            ))}
          </select>

          <label htmlFor='workplacetype'>Workplace Type</label>
          <select
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            id='workplacetype'
            name='workplacetype'
            required
          >
            {['', 'Remote', 'Onsite', 'Hybrid'].map((workplacetype, i) => (
              <option
                className={`rounded-md ${i > 0 ? 'border-t-[1px] border-primary-500' : ''}`}
                key={workplacetype}
                value={workplacetype}
              >
                {workplacetype}
              </option>
            ))}
          </select>

          <label htmlFor='jobdescription'>Job Description</label>
          <textarea className='h-32 w-full flex-1 rounded-md py-2 px-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500' />

          <label htmlFor='requireddocuments'>Required Documents</label>
          <div className='flex flex-row gap-4'>
            {['Resume/CV', 'Cover Letter', 'Portfolio', 'Transcript'].map((requireddocuments) => (
              <label key={requireddocuments}>
                <input type='checkbox' />
                {requireddocuments}
              </label>
            ))}
          </div>

          <label htmlFor='jobskills'>Job Skills</label>
          <input
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            type='text'
            id='jobskills'
            name='jobskills'
          />

          <label htmlFor='externallink'>External Application Link</label>
          <input
            className='rounded-md focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            type='text'
            id='externallink'
            name='externallink'
          />
        </form>
        <div className='mt-6 flex justify-center'>
          <Button className='flex h-10 w-20 p-1' type='submit'>
            Post Job
          </Button>
        </div>
      </div>
    </main>
  );
};

CreateJobPost.getLayout = (page) => <MainLayout>{page}</MainLayout>;
export default CreateJobPost;
