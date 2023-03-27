import { useSession } from 'next-auth/react';
import { useState } from 'react';

const Upload: React.FC = () => {
  const { data } = useSession();
  const [file, setFile] = useState<File>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //Loads the file as a state
    if (e.target.files?.[0]) {
      setFile(e.target.files?.[0]);
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
      setFile(undefined);
    } else {
      console.error('Upload failed.');
    }
  };

  return (
    <div>
      <p>Upload a file</p>
      <input type='file' onChange={handleInputChange} />
      <button onClick={uploadFile}> Upload </button>
    </div>
  );
};

export default Upload;
