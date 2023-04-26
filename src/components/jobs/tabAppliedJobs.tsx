/*
 *		Applied Jobs List Component
 *
 *
 *		This is a React functional component that displays a list of applied job postings. It uses the useTranslations hook from the next-intl library to handle translations.
 *    The useWindowSize hook is used to get the width of the window. It fetches job posting previews from an API using the useQuery hook from the react-query library. If there
 *    are no job posting previews, it displays a message, otherwise, it renders a JobsView component with the previews.
 */
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
