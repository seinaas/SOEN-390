import { useState } from 'react';
import { useWindowSize } from '../../utils/useWindowSize';
import { api } from '../../utils/api';
import { JobsView } from './jobsView';
import { useTranslations } from 'next-intl';

const TabAppliedJobs: React.FC = () => {
  const t = useTranslations('jobs');
  const { width } = useWindowSize();

  const [currentJobId, setCurrentJobId] = useState('');

  const { data: previews } = api.jobPosting.getAppliedJobPostingPreviews.useQuery(undefined, {
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
        {t('job-view.no-applied')}
      </div>
    );
  return <JobsView previews={previews} currentJobId={currentJobId} setCurrentJobId={setCurrentJobId} />;
};
export default TabAppliedJobs;
