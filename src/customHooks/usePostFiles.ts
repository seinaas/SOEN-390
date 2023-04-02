import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import axios from 'axios';

export const usePostFiles = (post: object) => {
  const [fileList, setFileList] = useState<string[]>();
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

    const xmlDoc = new DOMParser().parseFromString(listFileKeys.data, 'text/xml');
    const keys = xmlDoc.querySelectorAll('Key');

    const fileUrlList: string[] = [];

    //For each file key, obtain the associated get url for that file and add it to the fileUrlList
    for (const key of keys) {
      const getUrl = await getPreSignedGETUrl.mutateAsync({ key: key?.firstChild?.data as string });
      fileUrlList.push(getUrl);
    }
    setFileList(fileUrlList);
  };
  useEffect(() => {
    void loadFile();
  }, []);

  return [fileList];
};
