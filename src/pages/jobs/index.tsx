import React, { useState } from 'react';
import MainLayout from '../../components/mainLayout';
import Image from 'next/image';
import type { NextPageWithLayout } from '../_app';
import Button from '../../components/button';
import { AiFillDelete, AiOutlineDownload } from 'react-icons/ai';
import { IoDocumentAttachSharp } from 'react-icons/io5';
import Link from 'next/link';
import TabSuggestedJobs from '../../components/jobs/tabSuggestedJobs';
import TabSavedJobs from '../../components/jobs/tabSavedJobs';
import TabAppliedJobs from '../../components/jobs/tabAppliedJobs';

const TABS = [
  {
    title: 'Suggested Jobs',
    component: <TabSuggestedJobs />,
  },
  {
    title: 'Saved Jobs',
    component: <TabSavedJobs />,
  },
  {
    title: 'Applied Jobs',
    component: <TabAppliedJobs />,
  },
] as const;
type Title = (typeof TABS)[number]['title'];

const JobBoard: NextPageWithLayout = (props) => {
  const [selectedTab, setSelectedTab] = useState<Title>('Suggested Jobs');
  const iconStyles = { color: 'white', fontSize: '1.5em' };
  const hiddenFileInput = React.useRef(null);

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    props.handleFile(fileUploaded);
  };

  return (
    <main className='relative flex w-full flex-col justify-center gap-4 xs:py-4 xs:px-4 lg:px-8 xl:flex-row'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 md:max-w-xs md:flex-row xl:flex-col'>
        <div className='flex flex-col gap-4 rounded-xl bg-primary-100/20 px-6 pt-8 pb-4 xs:flex-row xl:flex-col'>
          <div>
            <div className='flex items-center justify-between'>
              <h1 className='mb-4 text-2xl font-semibold'>Application Profile</h1>
              <div className='relative h-20 w-20 rounded-full bg-primary-100 p-10'>
                <Image alt={''} src={'/application-profile.png'} fill className='object-contain' />
              </div>
            </div>
            <div className='rounded-xl py-4'>
              <p>Upload all necessary documents to share you skills and experiences with the recruiters.</p>
            </div>
          </div>
          <div>
            {/* TODO Replace array with real files */}
            {['Resume/CV', 'Cover Letter', 'Portfolio', 'Transcript'].map((file, i) => (
              <div
                className={`flex items-center justify-between py-4 text-primary-500 ${
                  i > 0 ? 'border-t-[1px] border-primary-500' : ''
                }`}
                key={file}
              >
                <p>{file}</p>
                <div className='flex justify-start gap-4'>
                  <IoDocumentAttachSharp size={24} onClick={handleClick} />
                  <input type='file' ref={hiddenFileInput} onChange={handleChange} style={{ display: 'none' }} />
                  <AiOutlineDownload size={24} />
                  <AiFillDelete size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col rounded-xl bg-primary-100/20 px-6 pt-8 pb-4'>
          <div className='flex items-center justify-between'>
            <h1 className='mb-4 text-2xl font-semibold'>Are you recruiting?</h1>
          </div>
          <div className='rounded-xl py-4'>
            <p>Create a job post to reach out to aspiring work profesionals</p>
          </div>
          <Link href='/jobs/createjobpost'>
            <Button className='p-2'>Create Job Post</Button>
          </Link>
          <div></div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex flex-1 flex-col gap-4 overflow-hidden rounded-xl bg-primary-100/10 p-4'>
        <div className='flex gap-2 border-b-4 border-primary-100/50'>
          {TABS.map((tab, index) => (
            <Button
              className={`rounded-b-none border-none p-3 hover:bg-primary-100 active:bg-primary-100 ${
                selectedTab === tab.title ? 'bg-primary-100' : 'bg-primary-100/50'
              }`}
              key={index}
              onClick={() => setSelectedTab(tab.title)}
            >
              {tab.title}
            </Button>
          ))}
        </div>
        <div className='flex-1 overflow-y-auto'>{TABS.find((tab) => tab.title === selectedTab)?.component}</div>
      </div>
    </main>
  );
};

JobBoard.getLayout = (page) => <MainLayout>{page}</MainLayout>;
export default JobBoard;
