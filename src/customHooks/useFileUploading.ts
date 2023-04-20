import { api } from '../utils/api';

export const useFileUploading = () => {
  const getPreSignedPUTUrl = api.cloudFlare.getPresignedPUTUrl.useMutation();
  return { getPreSignedPUTUrl };
};
