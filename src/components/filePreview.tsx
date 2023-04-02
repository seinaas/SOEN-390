import Image from 'next/image';
import { api } from '../utils/api';
import { useEffect, useState } from 'react';
import * as AWS from '@aws-sdk/client-s3';
import { env } from '../env/server.mjs';
import axios from 'axios';
import { usePostFiles, postFile } from '../customHooks/usePostFiles';

type FileUploadPreviewProps = { file: File | undefined };
type FileDownloadPreviewProps = { post: object };

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ file }) => {
  const imgPreview = file?.type.includes('image') ? URL.createObjectURL(file) : undefined;

  return (
    <div className={`${file ? 'flex' : 'hidden'} m-4`}>
      {(imgPreview && (
        <Image
          alt='image'
          src={imgPreview || ''}
          width={128}
          height={32}
          className='object-contain'
          referrerPolicy='no-referrer'
        />
      )) ||
        (file && <span>{file?.name}</span>)}
    </div>
  );
};

export const FileDownloadPreview: React.FC<FileDownloadPreviewProps> = ({ post }) => {
  const [fileList] = usePostFiles(post);

  return (
    fileList &&
    fileList.map((file) => {
      return (
        <a href={file.url} key={file.url} download className={`relative m-4 flex`}>
          <span>{file.fileName}</span>
        </a>
      );
    })
  );
};
