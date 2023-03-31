import Image from 'next/image';

type FilePreviewProps = { file: File | undefined };

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const imgPreview = file?.type.includes('image') ? URL.createObjectURL(file) : undefined;

  return (
    <div className={`${file ? 'flex' : 'hidden'} m-4`}>
      {(file?.type.includes('image') && (
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

export default FilePreview;
