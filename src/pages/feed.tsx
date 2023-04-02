import { formatDistance } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useState } from 'react';
import { IoIosChatboxes, IoMdShare, IoMdThumbsUp } from 'react-icons/io';
import MainLayout from '../components/mainLayout';
import { type NextPageWithLayout } from './_app';
import { AnimatePresence, motion } from 'framer-motion';
import { type GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/auth';
import type { RouterOutputs } from '../utils/api';
import { api } from '../utils/api';
import Modal from '../components/modal';
import type { PostMessage } from '../components/postMessage';

const Feed: NextPageWithLayout = () => {
  const [postToShare, setPostToShare] = useState<PostMessage>({} as PostMessage);
  const [messageToShare, setMessageToShare] = useState('');
  const [sharePostModal, setSharePostModal] = useState(false);
  const { data } = useSession();
  const [convosToShare, setConvosToShare] = useState([] as string[]);
  const [newPost, setNewPost] = useState('');

  const utils = api.useContext();
  const createPost = api.post.createPost.useMutation();
  const sendMessage = api.chat.sendMessage.useMutation();
  const posts = api.post.getPosts.useQuery().data;

  const conversations = api.conversation.getUserConversations.useQuery(undefined, {
    enabled: sharePostModal,
  }).data;

  const addPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPost) {
      createPost.mutate(
        {
          content: newPost,
        },
        {
          onSuccess: () => {
            void utils.post.getPosts.invalidate();
            setNewPost('');
          },
        },
      );
    }
  };
  const sharePost = (post: RouterOutputs['post']['getPosts'][number]) => {
    convosToShare.forEach((convoToShare) => {
      sendMessage.mutate({
        message: messageToShare,
        post: post,
        conversationId: convoToShare,
      });
    });
    setConvosToShare([]);
    setPostToShare({} as PostMessage);
    setSharePostModal(false);
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
              referrerPolicy='no-referrer'
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

        {posts?.map((post) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={`${post.User.firstName || ''} ${post.User.lastName || ''} - ${post.createdAt.getTime()}`}
            className='flex items-start gap-4 rounded-xl bg-primary-100/10 p-4 pr-8'
          >
            <div className='relative h-12 min-h-[48px] w-12 min-w-[48px]'>
              <Image
                alt='Logo'
                loader={() => post.User.image || '/placeholder.jpeg'}
                src={post.User.image || 'placeholder.jpeg'}
                fill
                className='rounded-md bg-white object-contain'
                referrerPolicy='no-referrer'
              />
            </div>
            <div className='flex flex-1 flex-col'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <p className='font-bold text-primary-500'>
                    {post.User.firstName} {post.User.lastName}
                  </p>
                  <p className='text-primary-400'>•</p>
                  <p className='text-primary-400'>{formatDistance(post.createdAt, new Date(), { addSuffix: true })}</p>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='h-[2px] w-[2px] rounded-full bg-primary-600' />
                  <div className='h-[2px] w-[2px] rounded-full bg-primary-600' />
                  <div className='h-[2px] w-[2px] rounded-full bg-primary-600' />
                </div>
              </div>
              <p className='text-primary-500'>
                {post.content
                  ? post.content
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
                <button
                  className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'
                  onClick={() => {
                    setPostToShare(post);
                    setSharePostModal(true);
                  }}
                >
                  <IoMdShare />
                  <p>Share</p>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {sharePostModal && (
          <Modal
            onCancel={() => {
              setConvosToShare([]);
              setPostToShare({} as PostMessage);
              setSharePostModal(false);
            }}
            onConfirm={() => sharePost(postToShare)}
          >
            <h1 className='mb-4 text-2xl font-semibold'>Share post</h1>
            <div className='mb-2 flex flex-col'>
              {conversations?.map((conversation, index) => (
                <div className='mb-2 flex flex-row' key={index}>
                  <input
                    key={conversation.id}
                    type='checkbox'
                    id={`custom-checkbox-${index}`}
                    className='peer hidden'
                    checked={convosToShare.find((convo) => conversation.id === convo) != undefined}
                    onChange={() => {
                      if (convosToShare.find((convo) => conversation.id === convo) == undefined) {
                        setConvosToShare((oldConvos) => [...oldConvos, conversation.id]);
                      } else {
                        setConvosToShare([...convosToShare.filter((convo) => convo !== conversation.id)]);
                      }
                    }}
                  />
                  <label
                    htmlFor={`custom-checkbox-${index}`}
                    className='w-full cursor-pointer select-none
                  rounded-lg py-3 px-6 font-bold text-gray-200 transition-colors duration-200 ease-in-out peer-checked:bg-primary-100/10'
                  >
                    <div className='flex items-center'>
                      <div className='relative h-12 w-12'>
                        <Image
                          fill
                          className='rounded-full object-cover'
                          loader={({ src }) => src}
                          src={conversation?.users[0]?.image || '/placeholder.jpeg'}
                          alt='User Image'
                        />
                      </div>
                      <div className='ml-4'>
                        <div className='text-lg font-semibold text-primary-500'>
                          {conversation?.users?.length < 2
                            ? `${conversation.users[0]?.firstName || ''} ${conversation.users[0]?.lastName || ''}`
                            : String(
                                conversation.users.map((user) => `${user.firstName || ''} ${user.lastName || ''}, `),
                              ) + ` ${String(data?.user?.firstName)} ${String(data?.user?.lastName)}`}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              ))}
              {convosToShare.length > 0 && (
                <input
                  type='text'
                  className='mt-5 w-full rounded-md bg-primary-100/10 px-4 py-3 pt-2 outline-none'
                  placeholder='Type a message...'
                  value={messageToShare}
                  onChange={(e) => setMessageToShare(e.target.value)}
                />
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
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
