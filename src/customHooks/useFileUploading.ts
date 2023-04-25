/*
 *		Custom File Uploading Web Hooks
 *
 *
 *		This file exports a function called "useFileUploading". The function returns an object containing two properties: "getPreSignedPUTUrl" and "getPreSignedGETUrl". These properties are both
 *    functions that are imported from the "api" module in the "utils" folder. The purpose of this code is to provide functions for getting pre-signed URLs for file uploads and downloads.
 */
import { api } from '../utils/api';

export const useFileUploading = () => {
  const getPreSignedPUTUrl = api.cloudFlare.getPresignedPUTUrl.useMutation();
  const getPreSignedGETUrl = api.cloudFlare.getPresignedGETUrl.useMutation();
  return { getPreSignedPUTUrl, getPreSignedGETUrl };
};
