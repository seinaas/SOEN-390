import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import axios from 'axios';
export type postFile = {
  fileName: string | undefined;
  url: string;
};

export const usePostFiles = (post: object) => {
  const [fileList, setFileList] = useState<postFile[]>();
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

    const fileUrlList: postFile[] = [];

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
