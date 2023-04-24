import { useEffect } from 'react';
import { useWindowSize } from '../../utils/useWindowSize';
import { type RouterOutputs, api } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { IoIosArrowBack, IoIosBriefcase } from 'react-icons/io';
import JobPost from './jobPost';
import { useTranslations } from 'next-intl';

type Props = {
  previews?: RouterOutputs['jobPosting']['getJobPostingPreviews'];
  currentJobId: string;
  setCurrentJobId: React.Dispatch<React.SetStateAction<string>>;
};

export const JobsView: React.FC<Props> = ({ previews, currentJobId, setCurrentJobId }) => {
  const { width } = useWindowSize();
  const t = useTranslations('jobs');

  const { data: currentJob } = api.jobPosting.getJobPosting.useQuery(
    { jobPostingId: currentJobId },
    {
      enabled: !!currentJobId,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (width >= 640 && !currentJobId && previews?.[0]) {
      setCurrentJobId(previews[0].jobPostingId);
    }
  }, [width]);

  return (
    <div className='flex h-full max-h-full max-w-full items-start gap-2 overflow-hidden'>
      <AnimatePresence initial={false} mode='popLayout'>
        {(width >= 640 || !currentJob) && (
          /* Left Side */
          <motion.div
            key='suggested-left-side'
            initial={{
              x: width >= 640 ? 0 : '-100%',
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: width >= 640 ? 0 : '-100%',
            }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 30,
            }}
            className='flex h-full max-h-full min-w-full flex-col gap-2 overflow-y-auto p-1 sm:min-w-[250px]'
          >
            {previews?.map((job, i) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  delay: i * 0.05,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={i}
                onClick={() => setCurrentJobId(job.jobPostingId)}
                className='flex gap-2 rounded-lg bg-white p-4 text-left'
              >
                <div className='relative flex aspect-square h-8 w-8 items-center justify-center rounded-full bg-primary-100/10 text-primary-600'>
                  {/* TODO: Update Placeholder Image */}
                  <IoIosBriefcase size={20} />
                  {/* <Image alt={''} src={'/concordia.jpeg'} fill /> */}
                </div>
                <div className='flex-1 flex-col whitespace-nowrap bg-white'>
                  <h1 className='text-base font-semibold'>{job.jobTitle}</h1>
                  <h2 className='text-xs leading-snug'>{job.company}</h2>
                  <p className='text-xs font-semibold leading-tight text-primary-100'>{job.location}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
        {currentJobId && (
          /* Right Side */
          <motion.div
            key='suggested-right-side'
            initial={{
              x: width >= 640 ? 0 : '100%',
            }}
            animate={{
              x: 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 30,
            }}
            className='flex h-full w-full min-w-full flex-col items-start gap-2 overflow-y-auto rounded-xl bg-primary-100/10 p-3 sm:min-w-0'
          >
            <button
              onClick={() => setCurrentJobId('')}
              className='flex items-center justify-start gap-1 rounded-md bg-primary-100 py-1 pl-1 pr-3 font-semibold text-white sm:hidden'
            >
              <IoIosArrowBack size={20} />
              {t('job-view.back')}
            </button>
            <AnimatePresence>{currentJob && <JobPost jobData={currentJob} />}</AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
