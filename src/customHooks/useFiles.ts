import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import axios from 'axios';
import { type Post } from '@prisma/client';

export type PostFile = {
  fileName: string | undefined;
  url: string;
};
export const usePostFiles = (post: Post) => {
  const [fileList, setFileList] = useState<PostFile[]>();
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

    const fileUrlList: PostFile[] = [];

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

  return [fileList];
};

// TODO: Add useJobPostFiles
