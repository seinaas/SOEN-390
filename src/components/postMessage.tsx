import { motion } from 'framer-motion';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import type { RouterOutputs } from '../utils/api';
import { IoMdThumbsUp, IoIosChatboxes } from 'react-icons/io';

export type PostMessage = RouterOutputs['post']['getPosts'][number];
export function PostMessageItem({ post }: { post: RouterOutputs['chat']['sendMessage']['embeddedPost'] }) {
  console.log(post?.createdAt);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={`${post?.User?.firstName || ''} ${post?.User?.lastName || ''} - ${new Date(
        post?.createdAt || 20,
      ).getTime()}`}
      className='flex items-start gap-4 rounded-xl bg-green-100/80 p-4 pr-8'
    >
      <div className='relative h-12 min-h-[48px] w-12 min-w-[48px]'>
        <Image
          alt='Logo'
          loader={() => post?.User?.image || '/placeholder.jpeg'}
          src={post?.User?.image || 'placeholder.jpeg'}
          fill
          className='rounded-md bg-white object-contain'
          referrerPolicy='no-referrer'
        />
      </div>
      <div className='flex flex-1 flex-col'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <p className='font-bold text-primary-500'>
              {post?.User?.firstName} {post?.User?.lastName}
            </p>
            <p className='text-primary-400'>•</p>
            <p className='text-primary-400'>
              {formatDistance(new Date(post?.createdAt || 20), new Date(), { addSuffix: true })}
            </p>
          </div>
        </div>
        <p className='text-primary-500'>
          {post?.content
            ? post?.content
            : `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur lacinia,
                nisl nisl aliquam nisl, eget ultricies nisl nisl sit amet nisl. Suspendisse potenti. Nulla facilisi.
                Nulla facilisi. Nulla facilisi. Nulla facilisi.`}
        </p>
        <div className='mt-2 flex flex-row items-center justify-items-center gap-2 border-t-2 border-t-primary-100/20 pt-2'>
          <div className='flex items-center gap-2 px-3 py-1 text-primary-400 transition-colors duration-200'>
            <IoMdThumbsUp />
            <p>{post?._count?.likes}</p>
          </div>
          <div className='flex items-center gap-2 px-3 py-1 text-primary-400 transition-colors duration-200'>
            <IoIosChatboxes />
            <p>{post?._count?.comments}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
