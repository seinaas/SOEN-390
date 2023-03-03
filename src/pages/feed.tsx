import { formatDistance } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { IoIosChatboxes, IoMdShare, IoMdThumbsUp } from 'react-icons/io';
import MainLayout from '../components/mainLayout';
import { NextPageWithLayout } from './_app';
import { motion } from 'framer-motion';
import { GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/auth';

type Post = {
  poster: string;
  logo: string;
  time: Date;
  likes: number;
  text?: string;
  padding?: boolean;
};

const posts: Post[] = [
  {
    poster: 'Apple',
    logo: 'https://cdn.cdnlogo.com/logos/a/2/apple.svg',
    time: new Date(Date.now() - 1000 * 60 * 60 * 4),
    likes: 123102,
    padding: true,
  },
  {
    poster: 'Netflix',
    logo: 'https://cdn.cdnlogo.com/logos/n/75/netflix.svg',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    likes: 92000,
    padding: true,
  },
  {
    poster: 'Concordia',
    logo: '/concordia.jpeg',
    time: new Date(Date.now() - 1000 * 55),
    likes: 201,
  },
];

const Feed: NextPageWithLayout = () => {
  const { data } = useSession();

  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      poster: 'Apple',
      logo: 'https://cdn.cdnlogo.com/logos/a/2/apple.svg',
      time: new Date(Date.now() - 1000 * 60 * 60 * 4),
      likes: 123102,
      padding: true,
    },
    {
      poster: 'Netflix',
      logo: 'https://cdn.cdnlogo.com/logos/n/75/netflix.svg',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      likes: 92000,
      padding: true,
    },
    {
      poster: 'Concordia',
      logo: '/concordia.jpeg',
      time: new Date(Date.now() - 1000 * 55),
      likes: 201,
    },
  ]);

  const addPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPost) {
      setPosts([
        {
          poster: `${data?.user?.firstName || ''} ${data?.user?.lastName || ''}`,
          logo: data?.user?.image || '',
          time: new Date(),
          text: newPost,
          likes: 0,
        },
        ...posts,
      ]);
      setNewPost('');
    }
  };

  return (
    <div className='flex items-center justify-center p-8'>
      <div className='flex w-[32rem] flex-col gap-2'>
        {data?.user && (
          <div className='flex gap-4 rounded-full bg-primary-100/10 p-4'>
            <Image
              alt='User Avatar'
              loader={() => data?.user?.image || ''}
              src={data.user.image || ''}
              width={48}
              height={48}
              className='rounded-full'
            />
            <form onSubmit={addPost} className='w-full'>
              <input
                type='text'
                className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                placeholder='Start a post'
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
            </form>
          </div>
        )}

        <div className='my-2 h-px w-full bg-primary-100/20' />

        {posts.map((post) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`${post.poster} - ${post.time.getTime()}`}
            className='flex items-start gap-4 rounded-xl bg-primary-100/10 p-4 pr-8'
          >
            <div className='relative h-12 min-h-[48px] w-12 min-w-[48px]'>
              <Image
                alt='Logo'
                loader={() => post.logo || ''}
                src={post.logo || ''}
                fill
                className='rounded-md bg-white object-contain'
                style={{
                  padding: post.padding ? '0.5rem' : '0',
                }}
              />
            </div>
            <div className='flex flex-1 flex-col'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='font-bold text-primary-500'>{post.poster}</p>
                  <p className='text-primary-400'>•</p>
                  <p className='text-primary-400'>{formatDistance(post.time, new Date(), { addSuffix: true })}</p>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='h-[2px] w-[2px] rounded-full bg-primary-600' />
                  <div className='h-[2px] w-[2px] rounded-full bg-primary-600' />
                  <div className='h-[2px] w-[2px] rounded-full bg-primary-600' />
                </div>
              </div>
              <p className='text-primary-500'>
                {post.text
                  ? post.text
                  : `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur lacinia,
                nisl nisl aliquam nisl, eget ultricies nisl nisl sit amet nisl. Suspendisse potenti. Nulla facilisi.
                Nulla facilisi. Nulla facilisi. Nulla facilisi.`}
              </p>
              <div className='mt-2 flex items-center gap-2 border-t-2 border-t-primary-100/20 pt-2'>
                <button className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'>
                  <IoMdThumbsUp />
                  <p>Like</p>
                </button>
                <button className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'>
                  <IoIosChatboxes />
                  <p>Comment</p>
                </button>
                <button className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'>
                  <IoMdShare />
                  <p>Share</p>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

Feed.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Feed;

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
