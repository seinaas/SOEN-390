import { api } from '../utils/api';

export const useFileUploading = () => {
  const getPreSignedPUTUrl = api.cloudFlare.getPresignedPUTUrl.useMutation();
  const getPreSignedGETUrl = api.cloudFlare.getPresignedGETUrl.useMutation();
  const getPreSignedDELETEUrl = api.cloudFlare.getPresignedDELETEUrl.useMutation();
  return { getPreSignedPUTUrl, getPreSignedGETUrl, getPreSignedDELETEUrl };
};
