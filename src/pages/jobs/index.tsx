import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/mainLayout';
import Image from 'next/image';
import type { NextPageWithLayout } from '../_app';
import Button from '../../components/button';
import { AiFillDelete, AiOutlineDownload } from 'react-icons/ai';
import { IoDocumentAttachSharp } from 'react-icons/io5';
import Link from 'next/link';
import TabSuggestedJobs from '../../components/jobs/tabSuggestedJobs';
import TabSavedJobs from '../../components/jobs/tabSavedJobs';
import TabAppliedJobs from '../../components/jobs/tabAppliedJobs';
import { Upload, uploadFile } from '../../components/upload';
import { useFileUploading } from '../../customHooks/useFileUploading';
import { useSession } from 'next-auth/react';
import { FileDownloadPreview, FileUploadPreview } from '../../components/filePreview';
import { useJobPostFiles } from '../../customHooks/useFiles';

const TABS = [
  {
    title: 'Suggested Jobs',
    component: <TabSuggestedJobs />,
  },
  {
    title: 'Saved Jobs',
    component: <TabSavedJobs />,
  },
  {
    title: 'Applied Jobs',
    component: <TabAppliedJobs />,
  },
] as const;
type Title = (typeof TABS)[number]['title'];

const JobBoard: NextPageWithLayout = (props) => {
  const [selectedTab, setSelectedTab] = useState<Title>('Suggested Jobs');
  const [fileList, setFileList] = useState<{ key: string; file: File }[]>([]);
  const { data: session } = useSession();
  const { getPreSignedPUTUrl } = useFileUploading();
  const userId = session?.user?.id;
  const [uploadedFileList] = useJobPostFiles(userId);

  const handleAddingNewFile = (newFile: File | undefined, newKey: string) => {
    newFile && //Updates
      setFileList([{ key: newKey, file: newFile }, ...fileList.filter((existingFile) => existingFile.key !== newKey)]);
  };

  const handleUploadFiles = async () => {
    for (const { file, key } of fileList) {
      const PUTPreSignedUrl = await getPreSignedPUTUrl.mutateAsync({
        fileName: file.name,
        pathPrefixes: [session?.user?.id as string, 'applicationProfile', key],
      });
      await uploadFile({ file: file, url: PUTPreSignedUrl });
    }
    setFileList([]);
  };

  return (
    <main className='relative flex w-full flex-col justify-center gap-4 xs:py-4 xs:px-4 sm:h-full lg:px-8 xl:flex-row'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 md:flex-row xl:max-w-sm xl:flex-col'>
        <div className='flex flex-col gap-4 rounded-xl bg-primary-100/20 px-6 pt-8 pb-4 xs:flex-row xl:flex-col'>
          <div>
            <div className='flex items-center justify-start gap-4'>
              <div className='relative h-20 w-20 rounded-full bg-primary-100 p-10'>
                <Image alt={''} src={'/application-profile.png'} fill className='object-contain' />
              </div>
              <h1 className='mb-4 text-2xl font-semibold'>Application Profile</h1>
            </div>
            <div className='rounded-xl py-4'>
              <p>Upload all necessary documents to share you skills and experiences with the recruiters.</p>
            </div>
          </div>
          <div>
            {/* TODO Replace array with real files */}
            {['Resume (CV)', 'Cover Letter', 'Portfolio', 'Transcript'].map((fileType, i) => (
              <div
                className={`flex items-center justify-between py-4 text-primary-500 ${
                  i > 0 ? 'border-t-[1px] border-primary-500' : ''
                }`}
                key={fileType}
              >
                <p>{fileType}</p>
                <div className='flex items-center justify-start gap-4'>
                  {(uploadedFileList?.some((uploadedFile) => uploadedFile.fileType === fileType) && (
                    <FileDownloadPreview
                      fileName={
                        uploadedFileList.find((uploadedFile) => uploadedFile.fileType === fileType)?.fileName as string
                      }
                      url={uploadedFileList.find((uploadedFile) => uploadedFile.fileType === fileType)?.url}
                    />
                  )) || (
                    <div className='flex items-center justify-start gap-4'>
                      {fileList.some((e) => e.key === fileType) && (
                        <FileUploadPreview file={fileList.find((e) => e.key == fileType)?.file} />
                      )}
                      <Upload setFile={(file: File | undefined) => handleAddingNewFile(file, fileType)} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* TODO: Change 'Upload File' to translated text */}
            {fileList.length > 0 && <Button onClick={() => void handleUploadFiles()}>Upload File(s)</Button>}
          </div>
        </div>

        <div className='flex flex-col rounded-xl bg-primary-100/20 px-6 pt-8 pb-4'>
          <div className='flex items-center justify-between'>
            <h1 className='mb-2 text-2xl font-semibold'>Are you recruiting?</h1>
          </div>
          <div className='rounded-xl py-4'>
            <p>Create a job post to reach out to aspiring work profesionals</p>
          </div>
          <Link href='/jobs/createJobPost'>
            <Button className='p-2'>Create Job Post</Button>
          </Link>
          <div></div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex flex-1 flex-col gap-4 overflow-hidden rounded-xl bg-primary-100/10 p-4'>
        <div className='flex gap-2 border-b-4 border-primary-100'>
          {TABS.map((tab, index) => (
            <Button
              className={`rounded-b-none border-none p-3 hover:bg-primary-100 active:bg-primary-100 ${
                selectedTab === tab.title ? 'bg-primary-100' : 'bg-primary-100/60'
              }`}
              key={index}
              onClick={() => setSelectedTab(tab.title)}
            >
              {tab.title}
            </Button>
          ))}
        </div>
        <div className='flex-1 overflow-y-auto'>{TABS.find((tab) => tab.title === selectedTab)?.component}</div>
      </div>
    </main>
  );
};

JobBoard.getLayout = (page) => <MainLayout>{page}</MainLayout>;
export default JobBoard;
