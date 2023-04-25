/*
 *		File Preview Component
 *
 *
 *		This is a file that exports three components for handling file uploads, downloads, and previews. The FileUploadPreview component accepts a File object and displays a preview of it. 
 *    The FileDownloadPreview component displays the name of the file, a download icon, and a link to download the file. The PostFileDownloadPreview component is specific to posts and displays 
 *    a list of files uploaded to a post along with their download links. The module also imports custom hooks for file handling and uploading, and uses icons from the React-icons library.
 */
import { type Post } from '@prisma/client';
import { usePostFiles } from '../customHooks/useFiles';
import { BsDownload } from 'react-icons/bs';
import { IoDocumentAttachOutline } from 'react-icons/io5';
import { IoIosDownload, IoMdClose } from 'react-icons/io';
import { useFileUploading } from '../customHooks/useFileUploading';
import { useEffect, useState } from 'react';

type FileUploadPreviewProps = { file?: File };
type FileDownloadPreviewProps = { fileName: string; pathPrefixes?: string[]; className?: string; url?: string };
type PostFileDownloadPreviewProps = { post: Post };

export const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ file }) => {
  //const imgPreview = file?.type.includes('image') ? URL.createObjectURL(file) : undefined;

  return (
    <div
      data-cy='file-upload-preview'
      className={`${file ? 'flex' : 'hidden'} items-center rounded-full bg-white/50 py-2 pr-4 pl-2 text-primary-600`}
    >
      <div className='flex max-w-full items-center gap-x-2 overflow-hidden'>
        <IoDocumentAttachOutline className='h-6 w-6' />
        <span className='flex-1 truncate'>{file?.name}</span>
      </div>
    </div>
  );
};

//Only for previewing file in posts
export const PostFileDownloadPreview: React.FC<PostFileDownloadPreviewProps> = ({ post }) => {
  const fileList = usePostFiles(post);

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
export const FileDownloadPreview: React.FC<FileDownloadPreviewProps> = ({
  fileName,
  pathPrefixes = [],
  className = '',
  url = '',
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const { getPreSignedGETUrl } = useFileUploading();
  const loadFile = async () => {
    const url = await getPreSignedGETUrl.mutateAsync({ key: `${pathPrefixes.join('/')}/${fileName}` });
    setDownloadUrl(url);
  };

  useEffect(() => {
    pathPrefixes.length > 0 && void loadFile();
  }, []);

  return (
    <div data-cy='file-download-preview' className={`flex items-center justify-between gap-x-4  ${className} `}>
      <div className='flex max-w-xs items-center gap-x-1 overflow-hidden font-bold'>
        <IoDocumentAttachOutline size={20} />
        <span className='flex-1 truncate'>{fileName}</span>
      </div>
      <a
        href={url ? url : downloadUrl}
        className='text-white opacity-50 transition-opacity duration-100 hover:opacity-100'
      >
        <IoIosDownload size={20} />
      </a>
    </div>
  );
};
