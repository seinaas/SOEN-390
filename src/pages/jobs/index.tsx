import React, { useState } from 'react';
import MainLayout from '../../components/mainLayout';
import Image from 'next/image';
import type { NextPageWithLayout } from '../_app';
import Button from '../../components/button';
import Link from 'next/link';
import TabSuggestedJobs from '../../components/jobs/tabSuggestedJobs';
import TabSavedJobs from '../../components/jobs/tabSavedJobs';
import TabAppliedJobs from '../../components/jobs/tabAppliedJobs';
import { Upload, uploadFile } from '../../components/upload';
import { useFileUploading } from '../../customHooks/useFileUploading';
import { useSession } from 'next-auth/react';
import { FileDownloadPreview, FileUploadPreview } from '../../components/filePreview';
import { FileDownloadInfo, useJobPostFiles } from '../../customHooks/useFiles';
import { getServerAuthSession } from '../../server/auth';
import { type GetServerSidePropsContext } from 'next';
import { useTranslations } from 'next-intl';

const TABS = [
  {
    title: 'suggested',
    component: <TabSuggestedJobs />,
  },
  {
    title: 'saved',
    component: <TabSavedJobs />,
  },
  {
    title: 'applied',
    component: <TabAppliedJobs />,
  },
] as const;
type Title = (typeof TABS)[number]['title'];

const JobBoard: NextPageWithLayout = () => {
  const [selectedTab, setSelectedTab] = useState<Title>('suggested');
  const [fileList, setFileList] = useState<{ key: string; file: File }[]>([]);
  const { data: session } = useSession();
  const { getPreSignedPUTUrl } = useFileUploading();
  const userId = session?.user?.id;
  const { fileList: uploadedFileList, removeFile } = useJobPostFiles(userId);
  const t = useTranslations('jobs');

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
    <main className='relative flex w-full flex-col justify-center gap-4 xs:py-4 xs:px-4 sm:min-h-full lg:px-8 xl:flex-row'>
      {/* Left Side */}
      <div className='flex flex-col gap-4 md:flex-row xl:max-w-sm xl:flex-col'>
        <div className='flex flex-col gap-4 rounded-xl bg-primary-100/20 px-6 pt-8 pb-4 xs:flex-row xl:flex-col'>
          <div>
            <div className='flex items-center justify-start gap-4'>
              <div className='relative h-20 w-20 rounded-full bg-primary-100 p-10'>
                <Image alt={''} src={'/application-profile.png'} fill className='object-contain' />
              </div>
              <h1 className='mb-4 text-2xl font-semibold'>{t('profile.title')}</h1>
            </div>
            <div className='rounded-xl py-4'>
              <p>{t('profile.description')}</p>
            </div>
          </div>
          <div className='min-w-[10rem]'>
            {(['resume', 'cover-letter', 'portfolio', 'transcript'] as const).map((fileType, i) => (
              <div
                className={`flex flex-col gap-2 py-4 text-primary-500 ${
                  i > 0 ? 'border-t-[1px] border-primary-500' : ''
                }`}
                key={fileType}
              >
                <div className='flex items-center justify-between'>
                  <p>{t(`files.${fileType}`)}</p>
                  <Upload setFile={(file: File | undefined) => handleAddingNewFile(file, fileType)} />
                </div>
                {fileList.some((e) => e.key === fileType) ? (
                  <FileUploadPreview file={fileList.find((e) => e.key == fileType)?.file} />
                ) : (
                  uploadedFileList?.some((uploadedFile) => uploadedFile.fileType === fileType) && (
                    <div className='rounded-md bg-primary-100 px-2 py-2 text-white'>
                      <FileDownloadPreview
                        fileName={
                          uploadedFileList.find((uploadedFile) => uploadedFile.fileType === fileType)
                            ?.fileName as string
                        }
                        url={uploadedFileList.find((uploadedFile) => uploadedFile.fileType === fileType)?.url}
                        pathPrefixes={[userId as string, 'applicationProfile', fileType]}
                        isOwner={true}
                        onDelete={() =>
                          removeFile(
                            uploadedFileList.find(
                              (uploadedFile) => uploadedFile.fileType === fileType,
                            ) as FileDownloadInfo,
                          )
                        }
                      />
                    </div>
                  )
                )}
              </div>
            ))}
            {/* TODO: Change 'Upload File' to translated text */}
            {fileList.length > 0 && <Button onClick={() => void handleUploadFiles()}>{t('profile.upload')}</Button>}
          </div>
        </div>

        <div className='flex flex-col rounded-xl bg-primary-100/20 px-6 pt-8 pb-4'>
          <div className='flex items-center justify-between'>
            <h1 className='mb-2 text-2xl font-semibold'>{t('recruiting.title')}</h1>
          </div>
          <div className='rounded-xl py-4'>
            <p>{t('recruiting.description')}</p>
          </div>
          <Link href='/jobs/createJobPost'>
            <Button className='p-2' layout={false}>
              {t('recruiting.button')}
            </Button>
          </Link>
          <div></div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex flex-1 flex-col gap-4 overflow-hidden rounded-xl bg-primary-100/10 p-4'>
        <div className='flex gap-2 border-b-4 border-primary-100'>
          {TABS.map((tab, index) => (
            <Button
              layout={false}
              className={`rounded-b-none border-none p-3 hover:bg-primary-100 active:bg-primary-100 ${
                selectedTab === tab.title ? 'bg-primary-100' : 'bg-primary-100/60'
              }`}
              key={index}
              onClick={() => setSelectedTab(tab.title)}
            >
              {t(`tabs.${tab.title}`)}
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      messages: JSON.parse(
        JSON.stringify(await import(`../../../public/locales/${ctx.locale || 'en'}.json`)),
      ) as IntlMessages,
    },
  };
};
