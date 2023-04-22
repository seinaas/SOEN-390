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
} from 'react-icons/io5';
import { AiFillDelete } from 'react-icons/ai';
import { api, type RouterOutputs } from '../../utils/api';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { IoIosBookmark } from 'react-icons/io';

type Props = {
  jobData: RouterOutputs['jobPosting']['getJobPosting'];
};

const JobPost: React.FC<Props> = ({ jobData }) => {
  const { data: session } = useSession();
  const utils = api.useContext();

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
          <div className='flex items-center gap-2 rounded-full bg-primary-600 py-1 pl-3 pr-4 text-sm text-white'>
            <IoBriefcaseSharp />
            <div>{jobData.jobType}</div>
          </div>
          {/* Workplace Type */}
          <div className='flex items-center gap-2 rounded-full bg-primary-600 py-1 pl-3 pr-4 text-sm text-white'>
            <IoHomeSharp />
            <div>{jobData.workplaceType}</div>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          {/* Job Skills */}
          {jobData.jobSkills?.length && (
            <div>
              <div className='flex items-center gap-2 text-primary-500'>
                <IoBarbellSharp />
                <div>Job Skills</div>
              </div>
              <div className='flex flex-wrap space-y-2 text-primary-100'>
                <div className='flex flex-row gap-1'>
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
          {jobData.requiredDocuments.length && (
            <div>
              <div className='flex items-center gap-2 text-primary-500'>
                <IoDocumentAttachSharp />
                <div>Required Documents</div>
              </div>
              <div className='flex flex-wrap space-y-2 text-primary-100'>
                <div className='flex flex-row gap-1'>
                  {jobData.requiredDocuments?.map((doc, i) => (
                    <div key={i} className='rounded-md bg-primary-100/20 px-2 py-1 text-xs font-semibold'>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Apply Job Button.*/}
        <div className='mt-6 flex justify-start gap-3'>
          {/* Can see/use the delete job button only if it's a recruiter */}
          {jobData.recruiterId === session?.user?.id ? (
            <Button className='hover-red-600 flex border-red-600 bg-red-600 p-1 py-2 px-4 text-white hover:border-red-300 hover:bg-red-300'>
              <AiFillDelete />
              Delete
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  if (jobData.applicationLink) void window.open(jobData.applicationLink, '_blank');
                  else applyJobToggle.mutate({ jobPostingId: jobData.jobPostingId || '', applied: !jobData.isApplied });
                }}
                className='flex py-2 px-4'
                variant={jobData.isApplied ? 'secondary' : 'primary'}
              >
                {jobData.isApplied ? (
                  <>
                    <IoCheckmarkSharp />
                    Applied
                  </>
                ) : (
                  <>
                    <IoPencilSharp />
                    Apply
                  </>
                )}
              </Button>
              {/* Save Job Button */}
              <Button
                className='flex py-2 px-4'
                variant={jobData.isSaved ? 'secondary' : 'primary'}
                onClick={() =>
                  saveJobToggle.mutate({ jobPostingId: jobData.jobPostingId || '', saved: !jobData.isSaved })
                }
              >
                {jobData.isSaved ? (
                  <>
                    <IoCheckmarkSharp />
                    Saved
                  </>
                ) : (
                  <>
                    <IoIosBookmark />
                    Save
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Job Description */}
      <div className='flex flex-col gap-2 rounded-lg bg-white p-4'>
        <h2 className='text-xl font-bold'>Job Description</h2>
        <p>{jobData.description || 'A description was not provided for this job posting!'}</p>
      </div>
    </motion.div>
  );
};
export default JobPost;
