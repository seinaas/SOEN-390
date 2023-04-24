import { type Post } from '@prisma/client';
import { FileDownloadInfo, PostFile, usePostFiles } from '../customHooks/useFiles';
import { BsDownload } from 'react-icons/bs';
import { IoDocumentAttachOutline } from 'react-icons/io5';
import { IoIosDownload, IoMdClose } from 'react-icons/io';
import { MdDeleteForever } from 'react-icons/md';
import { useFileUploading } from '../customHooks/useFileUploading';
import { useEffect, useState } from 'react';
import axios from 'axios';

type FileUploadPreviewProps = { file?: File };
type FileDownloadPreviewProps = {
  fileName: string;
  pathPrefixes?: string[];
  className?: string;
  url?: string;
  isOwner?: boolean;
  onDelete?: () => void;
  onDeleteAsync?: () => Promise<void>;
};
type PostFileDownloadPreviewProps = { post: Post; isOwner?: boolean };

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
export const PostFileDownloadPreview: React.FC<PostFileDownloadPreviewProps> = ({ post, isOwner = false }) => {
  const { fileList, removeFile } = usePostFiles(post);
  const { getPreSignedDELETEUrl } = useFileUploading();

  const handleDeleteFile = async (file: FileDownloadInfo) => {
    removeFile(file);
    const deleteUrl = await getPreSignedDELETEUrl.mutateAsync({
      fileName: file.fileName as string,
      pathPrefixes: [post.userId, 'posts', post.id],
    });
    const response = await axios.delete(deleteUrl);
    console.log(response);
  };
  return (
    <div data-cy='file-download-preview'>
      {fileList &&
        fileList.map((file) => {
          return (
            <div
              className={`mt-4 flex items-center justify-between rounded-lg bg-white/50 py-2 ${
                isOwner ? 'pr-2' : 'pr-4'
              }  pl-2 text-primary-600`}
              key={file.url}
            >
              <div className='flex items-center gap-x-2 '>
                <IoDocumentAttachOutline className='h-6 w-6' />
                <span>{file.fileName}</span>
              </div>
              <div className='flex items-center gap-3'>
                <a href={file.url}>
                  <BsDownload className='h-5 w-5 hover:opacity-70' />
                </a>
                {isOwner && (
                  <MdDeleteForever
                    className='h-6 w-6 hover:cursor-pointer hover:opacity-50'
                    onClick={() => {
                      void handleDeleteFile(file);
                    }}
                  />
                )}
              </div>
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
  isOwner = false,
  onDelete = () => {
    return;
  },
  onDeleteAsync = () => {
    return;
  },
}) => {
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const { getPreSignedGETUrl, getPreSignedDELETEUrl } = useFileUploading();
  const loadFile = async () => {
    const url = await getPreSignedGETUrl.mutateAsync({ key: `${pathPrefixes.join('/')}/${fileName}` });
    setDownloadUrl(url);
  };

  useEffect(() => {
    pathPrefixes.length > 0 && !url && void loadFile();
  }, []);

  const handleDeleteFile = async () => {
    onDelete();
    void onDeleteAsync();
    const deleteUrl: string = await getPreSignedDELETEUrl.mutateAsync({
      fileName: fileName,
      pathPrefixes: pathPrefixes,
    });
    const response = await axios.delete(deleteUrl);
    console.log(response);
  };

  return (
    <div data-cy='file-download-preview' className={`flex items-center justify-between gap-x-4  ${className} `}>
      <div className='flex max-w-xs items-center gap-x-1 overflow-hidden font-bold'>
        <IoDocumentAttachOutline size={20} />
        <span className='flex-1 truncate'>{fileName}</span>
      </div>
      <div className='flex items-center gap-x-1 '>
        <a
          href={url ? url : downloadUrl}
          className='text-white opacity-50 transition-opacity duration-100 hover:opacity-100'
        >
          <IoIosDownload size={20} />
        </a>
        {isOwner && (
          <MdDeleteForever
            className='h-6 w-6 opacity-50 hover:cursor-pointer hover:opacity-100'
            onClick={() => {
              void handleDeleteFile();
            }}
          />
        )}
      </div>
    </div>
  );
};
