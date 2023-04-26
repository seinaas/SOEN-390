/*
 *		Suggested Jobs List Component
 *
 *
 *		This is a React functional component that renders a list of suggested jobs. The component uses the useWindowSize hook from ../../utils/useWindowSize to get the current width of the
 *    window, and the useState hook to manage the current job id. It then uses the api object from ../../utils/api to fetch the suggested job postings via the getJobPostingPreviews method,
 *    and sets the current job id to the first job if the width of the window is at least 640 pixels. The JobsView component is then rendered with the fetched job previews, the current job
 *    id, and the function to set the current job id.
 */
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
