import { type GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Button } from '../../components/button';
import { api } from '../../utils/api';
import { IoMdPeople, IoMdChatboxes, IoMdPersonAdd, IoMdMail, IoMdPhonePortrait } from 'react-icons/io';
import { type NextPageWithLayout } from '../_app';
import MainLayout from '../../components/mainLayout';
import { getServerAuthSession } from '../../server/auth';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

// TODO: Replace with real data
const fillerData = {
  role: 'Software Engineering Student @ Concordia University',
  languages: ['English', 'French'],
  skills: [
    'React',
    'Next.js',
    'TypeScript',
    'tRPC',
    'TailwindCSS',
    'JavaScript',
    'CSS',
    'HTML',
    'Java',
    'C++',
    'Python',
    'C#',
    'SQL',
    'MongoDB',
  ],
  work: [
    {
      company: 'Google',
      position: 'Software Engineering Intern',
      logo: '/logos/google.svg',
      startDate: new Date('2022-10-01'),
      description: 'Worked on the Google Search team',
    },
    {
      company: 'Facebook',
      position: 'Software Engineering Intern',
      logo: '/logos/facebook.svg',
      startDate: new Date('2021-05-01'),
      endDate: new Date('2021-08-01'),
      description: 'Worked on the Facebook Messenger team',
    },
  ],
  education: [
    {
      school: 'Concordia University',
      degree: 'BSc. Software Engineering',
      logo: '/concordia.jpeg',
      startDate: new Date('2019-09-01'),
    },
    {
      school: 'College de Bois-de-Boulogne',
      degree: 'DEC Computer Science and Mathematics',
      logo: '/bdeb.jpeg',
      startDate: new Date('2017-09-01'),
      endDate: new Date('2019-05-01'),
    },
  ],
};

const Profile: NextPageWithLayout = () => {
  const router = useRouter();
  const { email } = router.query;
  const { data: sessionData } = useSession();
  const { data } = api.user.getByEmail.useQuery({ email: email as string });

  return (
    <main className='flex h-full w-full justify-center p-8'>
      <div className='relative flex gap-4'>
        <div>
          <div className='flex max-w-md flex-col rounded-xl bg-primary-100/20 py-8 px-6'>
            <div className='flex flex-col items-center gap-4'>
              <div className='flex items-center gap-4'>
                <div className='relative h-32 min-h-[8rem] w-32 min-w-[8rem] overflow-hidden rounded-full'>
                  <Image
                    loader={() => data?.image || ''}
                    src={data?.image || ''}
                    alt='Profile'
                    fill
                    className='object-cover'
                    referrerPolicy='no-referrer'
                  />
                </div>
                <div>
                  <h1 className='text-2xl font-semibold'>
                    {data?.firstName} {data?.lastName}
                  </h1>
                  <p className='text-sm font-normal text-primary-100'>
                    {/* TODO: Use Real Data */}
                    {fillerData.role}
                  </p>
                  <div className='my-2 h-px w-full bg-primary-100/20'></div>
                  <div className='flex items-center gap-1 text-sm font-bold text-primary-100'>
                    <IoMdPeople size={20} />
                    {/* TODO: Use Real Data */}
                    <span>{data?.connections} Connections</span>
                  </div>
                </div>
              </div>

              {/* Connection Buttons */}
              {sessionData?.user?.email !== email && (
                <div className='mt-4 flex w-full justify-between gap-2'>
                  <Button fullWidth iconLeft={<IoMdPersonAdd size={20} />} variant='secondary' className='px-4 py-2'>
                    Connect
                  </Button>
                  <Button fullWidth iconLeft={<IoMdChatboxes size={20} />} className='px-4 py-2'>
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
                <h1 className='mb-2 font-semibold'>Languages</h1>
                <div className='flex flex-wrap gap-2 text-primary-100'>
                  {fillerData.languages.map((language) => (
                    <div key={language} className='rounded-md bg-primary-100/20 px-2 py-1'>
                      {language}
                    </div>
                  ))}
                </div>
              </div>

              <div className='h-px w-full bg-primary-100/20' />

              {/* Skills Section */}
              <div className='flex w-full flex-col gap-2'>
                <h1 className='mb-2 font-semibold'>Skills</h1>
                <div className='flex flex-wrap gap-2 text-primary-100'>
                  {fillerData.skills.map((skill) => (
                    <div key={skill} className='rounded-md bg-primary-100/20 px-2 py-1'>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-1 flex-col gap-6 overflow-auto rounded-xl bg-primary-100/10 p-8'>
          <div className='rounded-xl bg-primary-100/10 p-6'>
            <h1 className='mb-2 text-2xl font-semibold'>About</h1>
            <p>{`${data?.bio || ''} `}</p>
          </div>

          <div className='rounded-xl bg-primary-100/10 p-6'>
            <h1 className='mb-4 text-2xl font-semibold'>Work Experience</h1>
            <div className='flex flex-col'>
              {fillerData.work.map((work, i) => (
                <div key={work.company}>
                  <div className='flex gap-2'>
                    <div className='relative flex h-12 w-12 items-center justify-center rounded-full bg-white'>
                      <Image alt={`${work.company} Logo`} src={work.logo} width={40} height={40} />
                    </div>
                    <div className='flex flex-col'>
                      <h1 className='text-lg font-semibold'>{work.position}</h1>
                      <p className='text-sm font-semibold leading-[0.8] text-primary-100'>
                        {format(work.startDate, 'MMM yyyy')} -{' '}
                        {work.endDate ? format(work.endDate, 'MMM yyyy') : 'Present'}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <div className='flex min-w-[3rem] justify-center'>
                      <div
                        className={`w-1 ${
                          i == fillerData.work.length - 1
                            ? 'bg-gradient-to-b from-primary-100/50 to-transparent'
                            : 'bg-primary-100/50'
                        }`}
                      />
                    </div>
                    <p className='mt-2 mb-6'>{work.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-xl bg-primary-100/10 p-6'>
            <h1 className='mb-4 text-2xl font-semibold'>Education</h1>
            <div className='flex flex-wrap gap-4'>
              {fillerData.education.map((education) => (
                <div key={education.school} className='flex overflow-hidden rounded-lg'>
                  <div className='relative flex aspect-square h-20 w-20'>
                    <Image alt={`${education.school} Logo`} src={education.logo} fill />
                  </div>
                  <div className='flex flex-col whitespace-nowrap bg-white p-4 pr-6'>
                    <h1 className='text-lg font-semibold'>{education.school}</h1>
                    <p className='text-sm font-semibold leading-[0.8] text-primary-100'>
                      {format(education.startDate, 'MMM yyyy')} -{' '}
                      {education.endDate ? format(education.endDate, 'MMM yyyy') : 'Present'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
