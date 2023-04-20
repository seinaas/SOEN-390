import { api } from '../utils/api';

export const useFileUploading = () => {
  const getPreSignedPUTUrl = api.cloudFlare.getPresignedPUTUrl.useMutation();
  const getPreSignedGETUrl = api.cloudFlare.getPresignedGETUrl.useMutation();
  return { getPreSignedPUTUrl, getPreSignedGETUrl };
};
