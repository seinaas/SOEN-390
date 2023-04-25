/*
 *		Job Post Component
 *
 *
 *		This file defines a React component called JobPost. It imports various modules, including Next.js, React, and framer-motion. The component 
 *    renders job details and buttons for saving, applying, and deleting a job posting. It also checks whether the user has uploaded all required documents for the job. Finally, 
 *    the component uses the useContext and useTranslations hooks from Next.js for state management and internationalization.
 */
import react from 'react';
import Image from 'next/image';
import Button from '../button';
import {
  IoLocationSharp,
  IoHomeSharp,
  IoBriefcaseSharp,
  IoBarbellSharp,
  IoDocumentAttachSharp,
  IoPencilSharp,
  IoCheckmarkSharp,
  IoOpenSharp,
} from 'react-icons/io5';
import { AiFillDelete } from 'react-icons/ai';
import { api, type RouterOutputs } from '../../utils/api';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { IoIosBookmark } from 'react-icons/io';
import { useTranslations } from 'next-intl';
import { useJobPostFiles } from '../../customHooks/useFiles';

type Props = {
  jobData: RouterOutputs['jobPosting']['getJobPosting'];
};

const JobPost: React.FC<Props> = ({ jobData }) => {
  const { data: session } = useSession();
  const utils = api.useContext();
  const t = useTranslations('jobs');
  const uploadedFileList = useJobPostFiles(session?.user?.id);

  const canApply = jobData.requiredDocuments.every((requiredDocument) =>
    uploadedFileList?.some((uploadedFile) => uploadedFile.fileType === requiredDocument),
  );

  const saveJobToggle = api.jobPosting.toggleSavedJobPosting.useMutation({
    onSuccess: () => {
      void utils.jobPosting.getJobPosting.refetch();
      void utils.jobPosting.getSavedJobPostingPreviews.refetch();
    },
  });

  const applyJobToggle = api.jobPosting.toggleAppliedJobPosting.useMutation({
    onSuccess: () => {
      void utils.jobPosting.getJobPosting.refetch();
      void utils.jobPosting.getAppliedJobPostingPreviews.refetch();
    },
  });

  const deleteJob = api.jobPosting.deleteJobPosting.useMutation({
    onSuccess: () => {
      void utils.jobPosting.getJobPostingPreviews.refetch();
      void utils.jobPosting.getSavedJobPostingPreviews.refetch();
      void utils.jobPosting.getAppliedJobPostingPreviews.refetch();
    },
  });

  return (
    <motion.div
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
      }}
      className='flex h-full max-h-full w-full max-w-full flex-col gap-2'
    >
      <div className='rounded-lg bg-white p-4'>
        <h1 className='flex-1 flex-col text-2xl font-bold'>{jobData.jobTitle}</h1>
        <div className='flex-1 flex-col text-lg font-semibold'>{jobData.company}</div>
        <div className='mt-1 mb-4 flex flex-row flex-wrap justify-start gap-2 font-semibold text-primary-500'>
          {/* Job Location */}
          <div className='flex items-center gap-2 rounded-full bg-primary-600 py-1 pl-2 pr-4 text-sm text-white'>
            <IoLocationSharp />
            <div>{jobData.location}</div>
          </div>
          {/* Job Type */}
          {jobData.jobType && (
            <div className='flex items-center gap-2 rounded-full bg-primary-600 py-1 pl-3 pr-4 text-sm text-white'>
              <IoBriefcaseSharp />
              <div>{t(`job-types.${jobData.jobType}`)}</div>
            </div>
          )}
          {/* Workplace Type */}
          {jobData.workplaceType && (
            <div className='flex items-center gap-2 rounded-full bg-primary-600 py-1 pl-3 pr-4 text-sm text-white'>
              <IoHomeSharp />
              <div>{t(`workplace-types.${jobData.workplaceType}`)}</div>
            </div>
          )}
        </div>

        <div className='flex flex-col gap-1'>
          {/* Job Skills */}
          {!!jobData.jobSkills?.length && (
            <div>
              <div className='flex items-center gap-2 text-primary-500'>
                <IoBarbellSharp />
                <div>{t('job-view.skills')}</div>
              </div>
              <div className='flex flex-wrap space-y-2 text-primary-100'>
                <div className='flex flex-row flex-wrap gap-1'>
                  {jobData.jobSkills?.map((skill, i) => (
                    <div key={i} className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Required Documents */}
          {!!jobData.requiredDocuments.length && (
            <div>
              <div className='flex items-center gap-2 text-primary-500'>
                <IoDocumentAttachSharp />
                <div>{t('job-view.documents')}</div>
              </div>
              <div className='flex flex-wrap space-y-2 text-primary-100'>
                <div className='flex flex-row flex-wrap gap-1'>
                  {jobData.requiredDocuments?.map((doc, i) => (
                    <div key={i} className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>
                      {t(`files.${doc}`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Apply Job Button.*/}
        <div className='mt-6 flex flex-wrap justify-start gap-3'>
          {/* Can see/use the delete job button only if it's a recruiter */}
          {jobData.recruiterId === session?.user?.id ? (
            <Button
              layout={false}
              onClick={() => deleteJob.mutate({ jobPostingId: jobData.jobPostingId || '' })}
              className='hover-red-600 flex border-red-600 bg-red-600 p-1 py-2 px-4 text-white hover:border-red-300 hover:bg-red-300'
              iconLeft={<AiFillDelete />}
            >
              {t('job-view.delete')}
            </Button>
          ) : (
            <>
              <Button
                layout={false}
                onClick={() => {
                  if (jobData.applicationLink) void window.open(jobData.applicationLink, '_blank');
                  else applyJobToggle.mutate({ jobPostingId: jobData.jobPostingId || '', applied: !jobData.isApplied });
                }}
                disabled={!canApply && !jobData.applicationLink}
                className='flex py-2 px-4'
                variant={jobData.isApplied ? 'secondary' : 'primary'}
                iconLeft={
                  jobData.isApplied ? (
                    <IoCheckmarkSharp />
                  ) : jobData.applicationLink ? (
                    <IoOpenSharp />
                  ) : (
                    <IoPencilSharp />
                  )
                }
              >
                {jobData.isApplied ? t('job-view.applied') : t('job-view.apply')}
              </Button>
              {/* Save Job Button */}
              <Button
                layout={false}
                className='flex py-2 px-4'
                variant={jobData.isSaved ? 'secondary' : 'primary'}
                onClick={() =>
                  saveJobToggle.mutate({ jobPostingId: jobData.jobPostingId || '', saved: !jobData.isSaved })
                }
                iconLeft={jobData.isSaved ? <IoCheckmarkSharp /> : <IoIosBookmark />}
              >
                {jobData.isSaved ? t('job-view.saved') : t('job-view.save')}
              </Button>
            </>
          )}
        </div>
        {!canApply && !jobData.applicationLink && jobData.recruiterId !== session?.user?.id && (
          <div className='mt-2 text-xs text-red-600'>{t('job-view.cannot-apply')}</div>
        )}
      </div>
      {/* Job Description */}
      <div className='flex flex-col gap-2 rounded-lg bg-white p-4'>
        <h2 className='text-xl font-bold'>{t('job-view.description')}</h2>
        <p>{jobData.description || t('job-view.no-description')}</p>
      </div>
    </motion.div>
  );
};
export default JobPost;
