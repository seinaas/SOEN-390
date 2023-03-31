import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useRef } from 'react';
import { api } from '../utils/api';
import Button from './button';
import { BsFileEarmarkPlus, BsSend } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';

const Upload: React.FC = () => {
  // TODO: add multi-upload capabilities
  const { data } = useSession();
  const [file, setFile] = useState<File>();
  const [imgPreview, setImgPreview] = useState<string>();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Loads the file as a state
    if (e.target.files?.[0]) {
      setFile(e.target.files?.[0]);
      e.target.files?.[0].type.includes('image')
        ? setImgPreview(URL.createObjectURL(e.target.files[0]))
        : setImgPreview(undefined);
    }
  };

  const uploadFile = async () => {
    //If no files has been selected
    if (!file) {
      console.log('No file has been selected.');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const fileName = encodeURIComponent(file.name);

    // Getting the presigned url from CloudFlare to upload file
    const res = await fetch(`/api/getPreSignedPutUrl?file=${fileName}&userId=1234`);

    const url = await res.json();

    // Uploads the file to the Cloudflare bucket
    const upload = await fetch(url as URL, {
      method: 'PUT',
      body: file,
      headers: {
        'content-type': file.type,
        'content-length': `${file.size}`,
      },
    });

    if (upload.ok) {
      console.log('Uploaded successfully!');
      //Clears the input, file and image preview
      setFile(undefined);
      setImgPreview(undefined);
      inputRef.current.value = '';
    } else {
      console.error('Upload failed.');
    }
  };

  return (
    <div className='flex w-fit flex-col space-y-4 border-2 border-black'>
      {(file?.type.includes('image') && (
        <Image
          alt='image'
          src={imgPreview || ''}
          width={128}
          height={32}
          className='object-contain'
          referrerPolicy='no-referrer'
        />
      )) || <span>{file?.name}</span>}
      <div className='flex '>
        <BsFileEarmarkPlus
          onClick={() => {
            inputRef.current && inputRef.current.click();
          }}
          className={`h-8 w-8 cursor-pointer rounded-lg text-primary-600 hover:text-primary-300`}
        />
        <input ref={inputRef} type='file' onChange={handleInputChange} className='hidden' />
        <IoMdSend onClick={uploadFile} className='h-8 w-8  cursor-pointer text-primary-600 hover:text-primary-300' />
      </div>
    </div>
  );
};

export default Upload;
