/*
 *		Custom File Use Web Hooks
 *
 *
 *		This file defines two custom hooks: usePostFiles and useJobPostFiles.  usePostFiles is used to load a list of files associated with a post by making API calls to Cloudflare to obtain 
 *    presigned URLs for listing and downloading the files. useJobPostFiles is used to load files associated with a job application by making API calls to Cloudflare to obtain presigned URLs 
 *    for listing and downloading the files. Both hooks use the useEffect hook to trigger the API calls when the component is mounted, and update the state with the file information. The 
 *    returned fileList object contains an array of FileDownloadInfo objects, each containing the file name, URL, and optionally the file type.
 */
import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import axios from 'axios';
import { type Post } from '@prisma/client';
import { useSession } from 'next-auth/react';

export type FileDownloadInfo = {
  fileName: string | undefined;
  url: string;
  fileType?: string;
};
export const usePostFiles = (post: Post) => {
  const [fileList, setFileList] = useState<FileDownloadInfo[]>();
  const getPreSignedLISTUrl = api.cloudFlare.getPresignedLISTUrl.useMutation();
  const getPreSignedGETUrl = api.cloudFlare.getPresignedGETUrl.useMutation();

  const loadFile = async () => {
    //Gets presigned url to list all files key of a post
    const listUrl = await getPreSignedLISTUrl.mutateAsync({
      userId: post.userId,
      containerType: 'posts',
      postId: post.id,
    });
    //Gets the list of keys of the files of a posts
    const listFileKeys = await axios({
      url: listUrl,
      method: 'GET',
    });

    const xmlDoc = new DOMParser().parseFromString(listFileKeys.data as string, 'text/xml');
    const keys = xmlDoc.querySelectorAll('Key');
    console.log(xmlDoc);
    console.log(keys);
    const fileUrlList: FileDownloadInfo[] = [];

    //For each file key, obtain the associated get url for that file and add it to the fileUrlList
    for (const key of keys) {
      const fileName = key?.innerHTML.split('/')[3];
      const getUrl = await getPreSignedGETUrl.mutateAsync({ key: key?.innerHTML });
      fileUrlList.push({ fileName: fileName, url: getUrl });
    }
    setFileList(fileUrlList);
  };

  useEffect(() => {
    void loadFile();
  }, []);

  return fileList;
};

// TODO: Add useJobPostFiles

export const useJobPostFiles = (userId: string | undefined) => {
  const [fileList, setFileList] = useState<FileDownloadInfo[]>();
  const { data: session } = useSession();
  const getPreSignedLISTUrl = api.cloudFlare.getPresignedLISTUrl.useMutation();
  const getPreSignedGETUrl = api.cloudFlare.getPresignedGETUrl.useMutation();

  const loadFile = async () => {
    //Gets presigned url to list all files key of a post
    const fileUrlList: FileDownloadInfo[] = [];
    for (const fileType of ['resume', 'cover-letter', 'portfolio', 'transcript'] as const) {
      const listUrl = await getPreSignedLISTUrl.mutateAsync({
        pathPrefixes: [session?.user?.id as string, 'applicationProfile', fileType],
      });

      //Gets the list of keys of the files of a posts
      const listFileKeys = await axios({
        url: listUrl,
        method: 'GET',
      });

      const xmlDoc = new DOMParser().parseFromString(listFileKeys.data as string, 'text/xml');
      const keys = xmlDoc.querySelectorAll('Key');
      if (keys.length === 0) {
        continue;
      }
      console.log(keys);

      //For each file key, obtain the associated get url for that file and add it to the fileUrlList
      const key = keys[0]?.innerHTML;
      const fileName = key?.split('/')[3] as string;
      const getUrl = await getPreSignedGETUrl.mutateAsync({ key: key as string });
      fileUrlList.push({ fileName: fileName, url: getUrl, fileType: fileType });
    }
    setFileList(fileUrlList);
  };

  useEffect(() => {
    session?.user?.id && void loadFile();
  }, [session?.user?.id]);

  return fileList;
};
