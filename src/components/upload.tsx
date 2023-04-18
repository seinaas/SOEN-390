import { useRef } from 'react';
import { BsFileEarmarkPlus } from 'react-icons/bs';

type UploadProps = {
  file?: File;
  setFile: (file?: File) => void;
};

export const Upload: React.FC<UploadProps> = ({ setFile }) => {
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
        className={`h-6 w-6 cursor-pointer rounded-lg text-primary-600 hover:text-primary-300`}
      />
      <input data-cy = 'upload-inner-input' ref={inputRef} type='file' onChange={handleInputChange} className='hidden' />
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
  const upload = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'content-type': file.type,
      'content-length': `${file.size}`,
    },
  });
  return upload;
};
