/*
 *		Saved Jobs List Component
 *
 *
 *		This file exports a React functional component named "TabSavedJobs". It imports several utility functions from other files in the project, including "useState" and "useWindowSize".
 *    It also imports the "JobsView" component from a local file. The component fetches job posting previews from an API using the "useQuery" hook from the "api" utility. If there are no
 *    job previews, it renders a message indicating so. Otherwise, it renders the "JobsView" component and passes in the job previews, as well as functions to set and update the current job ID.
 */
import { useState } from 'react';
import { useWindowSize } from '../../utils/useWindowSize';
import { api } from '../../utils/api';
import { JobsView } from './jobsView';
import { useTranslations } from 'next-intl';

const TabSavedJobs: React.FC = () => {
  const t = useTranslations('jobs');
  const { width } = useWindowSize();

  const [currentJobId, setCurrentJobId] = useState('');

  const { data: previews } = api.jobPosting.getSavedJobPostingPreviews.useQuery(undefined, {
    onSuccess: (data) => {
      if (data?.[0] && width >= 640) {
        setCurrentJobId(data[0].jobPostingId);
      } else {
        setCurrentJobId('');
      }
    },
    refetchOnWindowFocus: false,
  });

  if (!previews?.length)
    return (
      <div className='flex h-full flex-col items-center justify-center font-semibold text-primary-400'>
        {t('job-view.no-saved')}
      </div>
    );
  return <JobsView previews={previews} currentJobId={currentJobId} setCurrentJobId={setCurrentJobId} />;
};
export default TabSavedJobs;
