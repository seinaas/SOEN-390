import react from 'react';
import Image from 'next/image';
import JobPost from './jobPost';

const TabSuggestedJobs: React.FC = () => {
  return (
    <div className='flex h-full max-h-full items-start gap-4 md:max-w-full'>
      {/* Left Side */}
      <div className='flex max-h-full min-w-full flex-col gap-2 overflow-y-auto pr-1 sm:min-w-[250px]'>
        {[...Array(10)].map((_, i) => (
          <div key={i} className='flex gap-2 rounded-lg bg-white p-4'>
            <div className='relative aspect-square h-8 w-8'>
              {/* TODO: Update Placeholder Image */}
              <Image alt={''} src={'/concordia.jpeg'} fill />
            </div>
            <div className='flex-1 flex-col whitespace-nowrap bg-white'>
              <h1 className='text-base font-semibold'>Doctoral Student</h1>
              <h2 className='text-xs leading-snug'>Concordia University</h2>
              <p className='text-xs font-semibold leading-tight text-primary-100'>Montreal, QC</p>
            </div>
          </div>
        ))}
      </div>
      {/* Right Side */}
      <div className='flex h-full w-full min-w-full flex-col rounded-xl bg-primary-100/10 p-3 sm:min-w-0'>
        <JobPost />
      </div>
    </div>
  );
};
export default TabSuggestedJobs;
