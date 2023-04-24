/*
*		Profile Page Component
*
*
*		This is a React component that defines the profile page of a user on a web app. It contains the user's image, name, headline, and a button to view their connections. 
*		It also has buttons to edit the user's skills, bio, education, and job experience. The component queries the server for the user's information and connections, and 
*		can send and accept connection requests. If the user is viewing their own profile, they can edit their information. The component uses Framer Motion to animate certain elements.
*/
import { type GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../../components/button';
import { api } from '../../utils/api';
import {
  IoMdPeople,
  IoMdChatboxes,
  IoMdPersonAdd,
  IoMdMail,
  IoMdPhonePortrait,
  IoIosCheckmarkCircle,
  IoIosPaperPlane,
  IoIosCloseCircle,
  IoIosArrowForward,
} from 'react-icons/io';
import { type NextPageWithLayout } from '../_app';
import MainLayout from '../../components/mainLayout';
import { getServerAuthSession } from '../../server/auth';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import EditButton from '../../components/profile/editButton';
import EditSkillsModal from '../../components/profile/editSkillsModal';
import EditBioModal from '../../components/profile/editBioModal';
import NewSectionButton from '../../components/profile/newSectionButton';
import EditJobsModal from '../../components/profile/editJobsModal';
import EditEducationModal from '../../components/profile/editEducationModal';
import EditLanguagesModal from '../../components/profile/editLanguagesModal';
import { langsByCode } from '../../utils/languages';

const variants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const Profile: NextPageWithLayout = () => {
  const [viewConnections, setViewConnections] = useState(false);

  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [edittingJobId, setEdittingJobId] = useState('');
  const [edittingEducationId, setEdittingEducationId] = useState('');

  const updateQueries = async () => {
    await utils.user.getByEmail.invalidate();
    await utils.connections.getConnectionStatus.invalidate();
    await utils.connections.getUserConnections.invalidate();
  };

  const utils = api.useContext();
  const router = useRouter();
  const { email } = router.query;
  const { data: sessionData } = useSession();
  const { data } = api.user.getByEmail.useQuery({ email: email as string });
  const requestMutation = api.connections.sendConnectionRequest.useMutation({
    async onSuccess() {
      await updateQueries();
    },
  });
  const acceptMutation = api.connections.acceptConnection.useMutation({
    async onSuccess() {
      await updateQueries();
    },
  });
  const cancelMutation = api.connections.removeConnection.useMutation({
    async onSuccess() {
      await updateQueries();
    },
  });
  const { data: connection } = api.connections.getConnectionStatus.useQuery(
    { userEmail: data?.email || '' },
    // Don't fetch connection status if the user is viewing their own profile
    { enabled: !!sessionData?.user?.email && email != sessionData?.user?.email },
  );
  const { data: connections } = api.connections.getUserConnections.useQuery({ userEmail: (email as string) || '' });

  const canEdit = sessionData?.user?.email === data?.email;

  return (
    <main className='relative flex h-full w-full flex-col justify-center gap-4 xs:py-4 xs:px-4 md:flex-row lg:px-8'>
      {/* Left Side */}
      <div className='flex-1 md:max-w-md'>
        <div className='flex flex-col rounded-xl bg-primary-100/20 py-8 px-6'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-4'>
              <div className='relative h-32 min-h-[8rem] w-32 min-w-[8rem] overflow-hidden rounded-full bg-primary-100/20'>
                <Image
                  loader={() => data?.image || '/placeholder.jpeg'}
                  src={data?.image || '/placeholder.jpeg'}
                  alt='Profile'
                  fill
                  className='object-cover'
                  referrerPolicy='no-referrer'
                  priority
                />
              </div>
              <div>
                <h1 className='text-2xl font-semibold'>
                  {data?.firstName} {data?.lastName}
                </h1>
                <p className='text-sm font-normal text-primary-100'>{data?.headline}</p>
                <div className='my-2 h-px w-full bg-primary-100/20'></div>

                <button
                  onClick={() => {
                    setViewConnections(!viewConnections);
                  }}
                  className='flex w-full items-center justify-between rounded-md border-b-2 bg-primary-100/20 px-3 py-3 text-sm font-bold text-primary-100 duration-100 hover:cursor-pointer hover:bg-primary-100/40 hover:transition-colors'
                >
                  <div className='flex items-center gap-1'>
                    {viewConnections ? (
                      <span>View Profile</span>
                    ) : (
                      <>
                        <IoMdPeople size={20} />
                        <AnimatePresence mode='popLayout'>
                          {data?.numConnections != null && email && (
                            <motion.span
                              key={`connections-${data.numConnections}-${email as string}`}
                              exit={{ y: -10, opacity: 0 }}
                              animate={{ y: [10, 0], opacity: [0, 1] }}
                              initial={false}
                              transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 30,
                              }}
                            >
                              {data.numConnections}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <span> {data?.numConnections === 1 ? 'Connection' : 'Connections'}</span>
                      </>
                    )}
                  </div>
                  <motion.span
                    animate={{
                      rotate: viewConnections ? 180 : 0,
                    }}
                  >
                    <IoIosArrowForward />
                  </motion.span>
                </button>
              </div>
            </div>

            {/* Connection Buttons */}
            {sessionData?.user?.email && sessionData.user.email !== email && connection && (
              <div className='mt-4 flex w-full justify-between gap-2'>
                {connection.status === 'Sent' && (
                  <>
                    <Button
                      fullWidth
                      iconLeft={<IoIosPaperPlane size={20} />}
                      variant='secondary'
                      className='px-4 py-2'
                      disabled
                    >
                      Sent
                    </Button>
                    <Button
                      iconLeft={<IoIosCloseCircle size={20} />}
                      variant='secondary'
                      className='px-4 py-2'
                      onClick={() => data?.email && cancelMutation.mutate({ userEmail: data.email })}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {connection.status === 'Received' && (
                  <>
                    <Button
                      fullWidth
                      iconLeft={<IoIosCheckmarkCircle size={20} />}
                      className='px-4 py-2'
                      onClick={() => data?.email && acceptMutation.mutate({ userEmail: data.email })}
                    >
                      Accept
                    </Button>
                    <Button
                      fullWidth
                      iconLeft={<IoIosCloseCircle size={20} />}
                      variant='secondary'
                      className='px-4 py-2'
                      onClick={() => data?.email && cancelMutation.mutate({ userEmail: data.email })}
                    >
                      Ignore
                    </Button>
                  </>
                )}
                {connection.status === '' && (
                  <Button
                    fullWidth
                    iconLeft={<IoMdPersonAdd size={20} />}
                    variant='secondary'
                    className='px-4 py-2'
                    onClick={() => data?.email && requestMutation.mutate({ userEmail: data.email })}
                  >
                    Connect
                  </Button>
                )}
                <Button reverse fullWidth iconLeft={<IoMdChatboxes size={20} />} className='max-w-[50%] px-4 py-2'>
                  Message
                </Button>
              </div>
            )}

            <div className='h-px w-full bg-primary-100/20' />

            {/* Contact Information Section */}
            <div className='flex w-full flex-col gap-2'>
              <h1 className='mb-2 font-semibold'>Contact Information</h1>
              <div className='flex items-center gap-2 rounded-md bg-primary-100/20 p-3 text-primary-600'>
                <IoMdMail />
                <div className='text-sm font-semibold'>{data?.email}</div>
              </div>
              {data?.phone && (
                <div className='flex items-center gap-2 rounded-md bg-primary-100/20 p-3 text-primary-600'>
                  <IoMdPhonePortrait />
                  <div className='text-sm font-semibold'>{data.phone}</div>
                </div>
              )}
            </div>

            <div className='h-px w-full bg-primary-100/20' />

            <div className='flex w-full flex-col gap-2'>
              <div className='flex justify-between'>
                <h1 className='mb-2 font-semibold'>Languages</h1>
                {canEdit && (
                  <EditButton name='langs' data-cy='edit-langs-btn' onClick={() => setShowLanguagesModal(true)} />
                )}
              </div>
              <div data-cy='languages' className='flex flex-wrap gap-2 text-primary-100'>
                {data?.languages &&
                  data.languages.map((langCode) => (
                    <div key={langCode} className='rounded-md bg-primary-100/20 px-2 py-1'>
                      {langsByCode[langCode as keyof typeof langsByCode]}
                    </div>
                  ))}
              </div>
            </div>

            <div className='h-px w-full bg-primary-100/20' />

            {/* Skills Section */}
            <div className='flex w-full flex-col gap-2'>
              <div className='flex justify-between'>
                <h1 className='mb-2 font-semibold'>Skills</h1>
                {canEdit && <EditButton name='skills' onClick={() => setShowSkillsModal(true)} />}
              </div>
              <div data-cy='skills' className='flex flex-wrap gap-2 text-primary-100'>
                {data?.skills.map((skill) => (
                  <div key={skill} className='rounded-md bg-primary-100/20 px-2 py-1'>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <AnimatePresence mode='wait'>
        {viewConnections ? (
          <motion.div
            layoutId='right-container'
            className='flex flex-1 flex-col gap-6 overflow-auto rounded-xl bg-primary-100/10 p-8'
          >
            <motion.h1 layout className='text-2xl font-semibold'>
              {data?.firstName}&apos;s Connections
            </motion.h1>
            {connections?.length ? (
              <motion.div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
                {connections.map((connection, index) => (
                  <Link key={connection.id} href={`/u/${connection.email}`} onClick={() => setViewConnections(false)}>
                    <motion.div
                      layout
                      variants={variants}
                      initial='hidden'
                      exit='exit'
                      animate='visible'
                      transition={{
                        delay: index * 0.05,
                      }}
                      className='flex items-center gap-4 rounded-xl bg-primary-100/10 p-4'
                    >
                      <div className='relative h-12 w-12 overflow-hidden rounded-full bg-primary-100/20'>
                        {connection.image && (
                          <Image
                            loader={() => connection.image || ''}
                            src={connection.image}
                            alt={`${connection.firstName || ''}-image`}
                            fill
                            className='object-cover'
                            referrerPolicy='no-referrer'
                          />
                        )}
                      </div>
                      <div className='flex flex-col gap-1'>
                        <h1 className='text-lg font-semibold'>{connection.firstName}</h1>
                        <h1 className='text-sm font-semibold text-primary-100'>{connection.headline}</h1>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            ) : (
              <motion.div layout className='flex flex-col gap-2'>
                <h1 className='text-lg font-semibold'>No Connections</h1>
                <h1 className='text-sm font-semibold text-primary-100'>
                  {data?.firstName} has not connected with anyone yet.
                </h1>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={false}
            layoutId='right-container'
            className='flex flex-1 flex-col gap-6 overflow-auto rounded-xl bg-primary-100/10 p-8'
          >
            {data?.bio ? (
              <motion.div
                layout
                key='about-section'
                variants={variants}
                initial='hidden'
                exit='exit'
                animate='visible'
                className='rounded-xl bg-primary-100/10 p-6'
              >
                <div className='flex justify-between'>
                  <h1 className='mb-2 text-2xl font-semibold'>About</h1>
                  {canEdit && <EditButton name='bio' onClick={() => setShowBioModal(true)} />}
                </div>
                <p data-cy='bio'>{`${data?.bio || ''} `}</p>
              </motion.div>
            ) : (
              <>
                {canEdit && (
                  <NewSectionButton data-cy='new-bio-btn' text='About' onClick={() => setShowBioModal(true)} />
                )}
              </>
            )}
            {!!data?.jobs.length ? (
              <motion.div
                layout
                variants={variants}
                initial='hidden'
                exit='exit'
                animate='visible'
                transition={{ delay: 0.05 }}
                className='rounded-xl bg-primary-100/10 p-6'
              >
                <div className='flex justify-between'>
                  <h1 className='mb-4 text-2xl font-semibold'>Work Experience</h1>
                  {canEdit && <EditButton name='job' type='add' onClick={() => setEdittingJobId('new')} />}
                </div>
                <div className='flex flex-col' data-cy='work-experience'>
                  {data.jobs.map((job, i) => (
                    <motion.div key={job.company}>
                      <div className='flex gap-2'>
                        <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-white'>
                          {/* TODO: Update Placeholder Image */}
                          <Image alt={`${job.company || ''} Logo`} src={'/logos/google.svg'} width={40} height={40} />
                        </div>
                        <div className='flex flex-1 flex-col'>
                          <div className='flex justify-between'>
                            <h1 className='text-lg font-semibold'>{job.title}</h1>
                            {canEdit && <EditButton name='job' onClick={() => setEdittingJobId(job.jobId)} />}
                          </div>
                          <p className='text-sm font-semibold leading-[0.8] text-primary-100'>
                            {job.startDate && format(job.startDate, 'MMM yyyy')} -{' '}
                            {job.endDate ? format(job.endDate, 'MMM yyyy') : 'Present'}
                          </p>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <div className='flex min-w-[3rem] justify-center'>
                          <div
                            className={`w-1 ${
                              i == data?.jobs.length - 1
                                ? 'bg-gradient-to-b from-primary-100/50 to-transparent'
                                : 'bg-primary-100/50'
                            }`}
                          />
                        </div>
                        <p className='mt-2 mb-6'>{job.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {canEdit && (
                  <NewSectionButton
                    data-cy='new-job-btn'
                    text='Work Experience'
                    onClick={() => setEdittingJobId('new')}
                  />
                )}
              </>
            )}
            {!!data?.education.length ? (
              <motion.div
                layout
                variants={variants}
                initial='hidden'
                exit='exit'
                animate='visible'
                transition={{ delay: 0.1 }}
                className='rounded-xl bg-primary-100/10 p-6'
              >
                <div className='flex justify-between'>
                  <h1 className='mb-4 text-2xl font-semibold'>Education</h1>
                  {canEdit && <EditButton name='edu' type='add' onClick={() => setEdittingEducationId('new')} />}
                </div>
                <div className='flex flex-wrap gap-4' data-cy='education'>
                  {data.education.map((education) => (
                    <div key={education.school} className='flex overflow-hidden rounded-lg'>
                      <div className='relative flex aspect-square h-20 w-20'>
                        {/* TODO: Update Placeholder Image */}
                        <Image alt={`${education.school || ''} Logo`} src='/concordia.jpeg' fill />
                      </div>
                      <div className='flex flex-col whitespace-nowrap bg-white p-4 pr-6'>
                        <div className='flex items-center justify-between'>
                          <h1 className='text-lg font-semibold'>{education.school}</h1>
                          {canEdit && (
                            <EditButton name='edu' onClick={() => setEdittingEducationId(education.educationId)} />
                          )}
                        </div>
                        <p className='text-sm font-semibold leading-[0.8] text-primary-100'>
                          {education.startDate && format(education.startDate, 'MMM yyyy')} -{' '}
                          {education.endDate ? format(education.endDate, 'MMM yyyy') : 'Present'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {canEdit && (
                  <NewSectionButton
                    data-cy='new-edu-btn'
                    text='Education'
                    onClick={() => setEdittingEducationId('new')}
                  />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSkillsModal && data?.skills && (
          <EditSkillsModal
            skills={data.skills}
            onCancel={async () => {
              setShowSkillsModal(false);
              await utils.user.getByEmail.refetch();
            }}
          />
        )}
        {showLanguagesModal && data?.languages && (
          <EditLanguagesModal
            languages={data.languages}
            onCancel={async () => {
              setShowLanguagesModal(false);
              await utils.user.getByEmail.refetch();
            }}
          />
        )}
        {showBioModal && (
          <EditBioModal
            bio={data?.bio || ''}
            onCancel={async () => {
              setShowBioModal(false);
              await utils.user.getByEmail.refetch();
            }}
          />
        )}
        {edittingJobId && data?.jobs && (
          <EditJobsModal
            job={data.jobs.find((job) => job.jobId == edittingJobId)}
            onCancel={async () => {
              setEdittingJobId('');
              await utils.user.getByEmail.refetch();
            }}
          />
        )}
        {edittingEducationId && data?.education && (
          <EditEducationModal
            education={data.education.find((education) => education.educationId == edittingEducationId)}
            onCancel={async () => {
              setEdittingEducationId('');
              await utils.user.getByEmail.refetch();
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

Profile.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Profile;

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

  return { props: {} };
};
