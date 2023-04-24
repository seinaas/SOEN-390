import { useState } from 'react';
import { api } from '../../utils/api';
import { useWindowSize } from '../../utils/useWindowSize';
import { JobsView } from './jobsView';

const TabSuggestedJobs: React.FC = () => {
  const { width } = useWindowSize();

  const [currentJobId, setCurrentJobId] = useState('');

  const { data: previews } = api.jobPosting.getJobPostingPreviews.useQuery(undefined, {
    onSuccess: (data) => {
      if (data?.[0] && width >= 640) {
        setCurrentJobId(data[0].jobPostingId);
      }
    },
    refetchOnWindowFocus: false,
  });

  return <JobsView previews={previews} currentJobId={currentJobId} setCurrentJobId={setCurrentJobId} />;
};
export default TabSuggestedJobs;
