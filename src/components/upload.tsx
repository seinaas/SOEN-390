import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useRef, SetStateAction, Dispatch } from 'react';
import { BsFileEarmarkPlus, BsSend } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { api } from '../utils/api';

type UploadProps = {
  file: File | undefined;
  setFile: (file: File | undefined) => void;
};

export const Upload: React.FC<UploadProps> = ({ file = undefined, setFile }) => {
  // TODO: add multi-upload capabilities
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Loads the file as a state
    if (e.target.files?.[0]) {
      setFile(e.target.files?.[0]);
    }
  };

  // const uploadFile = async () => {
  //   //If no files has been selected
  //   if (!file) {
  //     console.log('No file has been selected.');
  //     return;
  //   }
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
  //   const fileName = encodeURIComponent(file.name);

  //   // Getting the presigned url from CloudFlare to upload file
  //   const res = await fetch(`/api/getPreSignedPutUrl?file=${fileName}&userId=${data.user.id}`);

  //   const url = await res.json();

  //   // Uploads the file to the Cloudflare bucket
  //   const upload = await fetch(url as URL, {
  //     method: 'PUT',
  //     body: file,
  //     headers: {
  //       'content-type': file.type,
  //       'content-length': `${file.size}`,
  //     },
  //   });

  //   if (upload.ok) {
  //     console.log('Uploaded successfully!');
  //     //Clears the input, file and image preview
  //     setFile(undefined);
  //     inputRef.current.value = '';
  //   } else {
  //     console.error('Upload failed.');
  //   }
  // };

  return (
    <div className='flex '>
      <BsFileEarmarkPlus
        onClick={() => {
          inputRef.current && inputRef.current.click();
        }}
        className={`h-6 w-6 cursor-pointer rounded-lg text-primary-600 hover:text-primary-300`}
      />
      <input ref={inputRef} type='file' onChange={handleInputChange} className='hidden' />
      {/* <IoMdSend onClick={uploadFile} className={`h-6 w-6 cursor-pointer text-primary-600 hover:text-primary-300`} /> */}
    </div>
  );
};

export const uploadFile = async (file: File | undefined, url: string) => {
  //If no files has been selected
  if (!file) {
    console.log('No file has been selected.');
    return;
  }

  // Getting the presigned url from CloudFlare to upload file
  //const res = await fetch(`/api/getPreSignedPutUrl?file=${fileName}&userId=${data.user.id}`);
  console.log(url);

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
