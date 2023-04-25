/*
 *		File Upload Component
 *
 *
 *		This file defines a React component for file uploads and a function for uploading files to a Cloudflare bucket. The Upload component allows users to select a file by clicking on an icon,
 *    which opens a file picker dialog. The selected file is then passed to a callback function. The uploadFile function takes a file and a URL and uploads the file to the specified URL using
 *    a PUT request. If no file is selected, the function logs a message to the console and returns. The function sets the content-type and content-length headers for the uploaded file.
 */
import { useRef } from 'react';
import { BsFileEarmarkPlus } from 'react-icons/bs';

type UploadProps = {
  file?: File;
  setFile: (file?: File) => void;
  className?: string;
};

export const Upload: React.FC<UploadProps> = ({ setFile, className: className = '' }) => {
  // TODO: add multi-upload capabilities
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Loads the file as a state
    if (e.target.files?.[0]) {
      setFile(e.target.files?.[0]);
    }
  };
  return (
    <div className='flex '>
      <BsFileEarmarkPlus
        onClick={() => {
          inputRef.current && inputRef.current.click();
        }}
        className={`h-6 w-6 cursor-pointer rounded-lg text-primary-600 hover:text-primary-300 ${className}`}
      />
      <input data-cy='upload-inner-input' ref={inputRef} type='file' onChange={handleInputChange} className='hidden' />
    </div>
  );
};

export const uploadFile = async ({ file, url }: { file?: File; url: string }) => {
  //If no files has been selected
  if (!file) {
    console.log('No file has been selected.');
    return;
  }

  //Uploads the file to the Cloudflare bucket
  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'content-type': file.type,
      'content-length': `${file.size}`,
    },
  });
};
