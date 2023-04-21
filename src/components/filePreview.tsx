import { type Post } from '@prisma/client';
import { usePostFiles } from '../customHooks/usePostFiles';
import { BsDownload } from 'react-icons/bs';
import { IoDocumentAttachOutline } from 'react-icons/io5';
import { IoMdClose } from 'react-icons/io';
import { useFileUploading } from '../customHooks/useFileUploading';
import { useEffect, useState } from 'react';

type FileUploadPreviewProps = { file?: File };
type FileDownloadPreviewProps = { fileName: string; pathPrefixes: string[]; className?: string };
type PostFileDownloadPreviewProps = { post: Post };

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ file }) => {
  //const imgPreview = file?.type.includes('image') ? URL.createObjectURL(file) : undefined;

  return (
    <div
      data-cy='file-upload-preview'
      className={`${
        file ? 'flex' : 'hidden'
      } w-fit items-center rounded-full bg-white/50 py-2 pr-4 pl-2 text-primary-600`}
    >
      <div className='flex items-center gap-x-2 '>
        <IoDocumentAttachOutline className='h-6 w-6' />
        <span>{file?.name}</span>
      </div>
    </div>
  );
};

//Only for previewing file in posts
export const PostFileDownloadPreview: React.FC<PostFileDownloadPreviewProps> = ({ post }) => {
  const [fileList] = usePostFiles(post);

  return (
    <div data-cy='file-download-preview'>
      {fileList &&
        fileList.map((file) => {
          return (
            <div
              className={`mt-4 flex items-center justify-between rounded-lg bg-white/50 py-2 pr-4 pl-2 text-primary-600`}
              key={file.url}
            >
              <div className='flex items-center gap-x-2 '>
                <IoDocumentAttachOutline className='h-6 w-6' />
                <span>{file.fileName}</span>
              </div>
              <a href={file.url}>
                <BsDownload className='h-5 w-5 hover:text-primary-300' />
              </a>
            </div>
          );
        })}
    </div>
  );
};

//Generalized file download preview for a single file
export const FileDownloadPreview: React.FC<FileDownloadPreviewProps> = ({ fileName, pathPrefixes, className = '' }) => {
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const { getPreSignedGETUrl } = useFileUploading();
  const loadFile = async () => {
    const url = await getPreSignedGETUrl.mutateAsync({ key: `${pathPrefixes.join('/')}/${fileName}` });
    setDownloadUrl(url);
  };

  useEffect(() => {
    void loadFile();
  }, []);

  return (
    <div data-cy='file-download-preview' className={`flex items-center justify-between gap-x-4  ${className} `}>
      <div className='flex gap-x-1 font-bold'>
        <IoDocumentAttachOutline className='h-6 w-6' />
        <span>{fileName}</span>
      </div>
      <a href={downloadUrl}>
        <BsDownload className='h-5 w-5 hover:opacity-50' />
      </a>
    </div>
  );
};
