import { formatDistance, formatDistanceToNowStrict } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosChatboxes, IoMdShare, IoMdThumbsUp, IoMdCreate, IoMdRemove } from 'react-icons/io';
import MainLayout from '../components/mainLayout';
import { type NextPageWithLayout } from './_app';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { type GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/auth';
import { type RouterOutputs, api } from '../utils/api';
import { Upload, uploadFile } from '../components/upload';
import { PostFileDownloadPreview, FileUploadPreview, FileDownloadPreview } from '../components/filePreview';
import { useTranslations } from 'next-intl';
import { enCA, fr } from 'date-fns/locale';
import { useRouter } from 'next/router';

type PostType = RouterOutputs['post']['getPosts'][number];

type PostProps = {
  initialPost: PostType;
  userId: string;
  userImage: string;
  commentingPost: boolean;
  editingPost: boolean;
  setCommentingPostId: React.Dispatch<React.SetStateAction<string>>;
  setEditingPostId: React.Dispatch<React.SetStateAction<string>>;
};
const Post: React.FC<PostProps> = ({
  initialPost,
  userId,
  userImage,
  commentingPost,
  editingPost,
  setCommentingPostId,
  setEditingPostId,
}) => {
  const t = useTranslations('feed');
  const router = useRouter();

  const [editingContent, setEditingContent] = useState('');
  const [shared, setShared] = useState(false);
  const [newComment, setNewComment] = useState('');

  const commentRef = useRef<HTMLInputElement>(null);

  const { data: updatedPost, refetch: refetchPost } = api.post.getPost.useQuery(
    { postId: initialPost.id },
    {
      enabled: false,
    },
  );
  const utils = api.useContext();
  const deletePost = api.post.deletePost.useMutation({
    onSuccess: () => {
      void utils.post.getPosts.invalidate();
    },
  });

  const editPost = api.post.editPost.useMutation();

  const toggleLike = api.post.toggleLike.useMutation();

  const createComment = api.post.createComment.useMutation({
    onSuccess: () => {
      void refetchPost();
      setNewComment('');
    },
  });

  const post = updatedPost || initialPost;
  const isLiked = !!post.likes?.find((like) => like.userId === userId && like.postId === post.id);

  const removePost = (postId: string) => {
    deletePost.mutate({
      postId: postId,
    });
  };

  const modifyPost = (e: React.FormEvent<HTMLFormElement>, postId: string) => {
    e.preventDefault();
    if (editingContent) {
      editPost.mutate(
        {
          postId: postId,
          content: editingContent,
        },
        {
          onSuccess: () => {
            void refetchPost();
            setEditingPostId('');
            setEditingContent('');
          },
        },
      );
    }
  };

  const addComment = (e: React.FormEvent<HTMLFormElement>, comPostId: string) => {
    e.preventDefault();
    if (newComment) {
      createComment.mutate(
        {
          postId: comPostId,
          content: newComment,
        },
        {
          onSuccess: () => {
            void refetchPost();
            setNewComment('');
            setCommentingPostId('');
          },
        },
      );
    }
  };

  const ownsPost = post.userId === userId;

  // Auto focus on comment input
  useEffect(() => {
    if (commentRef.current) {
      commentRef.current.focus();
    }
  }, [commentingPost]);

  return (
    <motion.div
      data-cy='post'
      className='flex flex-col gap-2 rounded-xl bg-primary-100/10 p-4'
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div layout className='mb-2 flex items-start gap-4'>
        <motion.div layout className='relative h-12 min-h-[48px] w-12 min-w-[48px]'>
          <Image
            alt='Logo'
            loader={() => post.User.image || '/placeholder.jpeg'}
            src={post.User.image || 'placeholder.jpeg'}
            fill
            className='rounded-md bg-white object-contain'
            referrerPolicy='no-referrer'
          />
        </motion.div>
        <div className='flex flex-1 flex-col'>
          <motion.div layout className='flex items-center justify-between'>
            <div className='flex flex-row items-center gap-2'>
              <p className='font-bold text-primary-500'>
                {post.User.firstName} {post.User.lastName}
              </p>
              <p className='text-primary-400'>•</p>
              <p className='text-primary-400'>
                {formatDistanceToNowStrict(post.createdAt, {
                  addSuffix: true,
                  locale: router.locale === 'fr' ? fr : enCA,
                })}
              </p>
            </div>
            {ownsPost && (
              <div className='flex items-center gap-1'>
                <div>
                  <button
                    data-cy='edit-post-btn'
                    onClick={() => {
                      setEditingPostId(editingPost ? '' : post.id);
                    }}
                  >
                    <IoMdCreate />
                  </button>
                  <button data-cy='delete-post-btn' onClick={() => removePost(post.id)}>
                    <IoMdRemove />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          {editingPost ? (
            <form data-cy='edit-post-form' onSubmit={(e) => modifyPost(e, post.id)} className='w-full'>
              <input
                data-cy='edit-post-input'
                type='text'
                className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                placeholder={post.content || ''}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
            </form>
          ) : (
            <p className='text-primary-500'>{post.content}</p>
          )}
          {/* Preview of the attached file */}
          {post.hasFiles && (
            <PostFileDownloadPreview post={post} isOwner={ownsPost} data-cy='post-file-download-preview' />
          )}{' '}
        </div>
      </motion.div>
      <motion.div layout className='mt-2 flex items-center gap-2 border-t-2 border-t-primary-100/20 pt-2'>
        <button
          data-cy='like-btn'
          onClick={() => {
            toggleLike.mutate(
              {
                postId: post.id,
              },
              {
                onSuccess: () => {
                  void refetchPost();
                },
              },
            );
          }}
          className={`flex items-center gap-2 rounded-full px-3 py-1 transition-colors duration-200 ${
            isLiked
              ? 'bg-primary-400 text-white hover:bg-primary-200'
              : 'bg-white text-primary-400 hover:bg-primary-100/10'
          }`}
        >
          <IoMdThumbsUp />
          <p>
            {isLiked ? t('liked') : t('like')} {!!post.likes?.length && post.likes.length}
          </p>
        </button>
        <button
          data-cy='comment-btn'
          className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'
          onClick={() => {
            setCommentingPostId(commentingPost ? '' : post.id);
          }}
        >
          <IoIosChatboxes />
          <p>{t('comment')}</p>
        </button>
        <button
          data-cy='share-btn'
          onClick={() => setShared(!shared)}
          className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'
        >
          <IoMdShare />
          <p> {shared ? t('shared') : t('share')}</p>
        </button>
      </motion.div>
      {post.comments?.map((comment) => {
        return <Comment key={comment.commentId} comment={comment} refetchPost={refetchPost} />;
      })}
      <AnimatePresence mode='wait'>
        {commentingPost && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'tween',
              duration: 0.2,
              ease: 'easeInOut',
              delay: 0.1,
            }}
            key={`comment-${post.id}`}
            className='flex items-center gap-4 rounded-xl bg-primary-100/10 p-4'
          >
            <Image
              alt='User Avatar'
              loader={() => userImage || 'placeholder.jpeg'}
              src={'placeholder.jpeg'}
              width={48}
              height={48}
              className='rounded-full'
              referrerPolicy='no-referrer'
            />
            <form data-cy='comment-form' onSubmit={(e) => addComment(e, post.id)} className='w-full'>
              <input
                data-cy='comment-input'
                type='text'
                className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                placeholder={t('comment-placeholder')}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                ref={commentRef}
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

type CommentProps = {
  comment: PostType['comments'][number];
  refetchPost: () => unknown;
};
const Comment: React.FC<CommentProps> = ({ comment, refetchPost }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');

  const editComment = api.post.editComment.useMutation();
  const deleteComment = api.post.deleteComment.useMutation();

  const removeComment = (e: React.MouseEvent, commentId: string) => {
    e.preventDefault();
    deleteComment.mutate(
      {
        commentId: commentId,
      },
      {
        onSuccess: () => {
          void refetchPost();
        },
      },
    );
  };

  const modifyComment = (e: React.FormEvent<HTMLFormElement>, commentId: string) => {
    e.preventDefault();
    if (editingContent) {
      editComment.mutate(
        {
          commentId: commentId,
          content: editingContent,
        },
        {
          onSuccess: () => {
            void refetchPost();
          },
        },
      );
      setIsEditing(false);
      setEditingContent('');
    }
  };
  return (
    <motion.div
      data-cy='comment'
      layout
      key={comment.commentId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-start gap-4 rounded-md bg-primary-100/5 p-4'
    >
      <motion.div layout className='relative h-12 min-h-[48px] w-12 min-w-[48px]'>
        <Image
          alt='Logo'
          loader={() => comment.User.image || '/placeholder.jpeg'}
          src={comment.User.image || 'placeholder.jpeg'}
          fill
          className='rounded-md bg-white object-contain'
          referrerPolicy='no-referrer'
        />
      </motion.div>
      <div className='flex flex-1 flex-col'>
        <motion.div layout className='flex items-center justify-between'>
          <h1 className='font-bold text-primary-500'>
            {comment.User.firstName} {comment.User.lastName}
          </h1>
          <div className='flex items-center gap-1'>
            <button
              data-cy='edit-comment-btn'
              onClick={() => {
                setIsEditing(!isEditing);
              }}
            >
              <IoMdCreate />
            </button>
            <button data-cy='delete-comment-btn' onClick={(e) => removeComment(e, comment.commentId)}>
              <IoMdRemove />
            </button>
          </div>
        </motion.div>
        <div className='flex flex-col justify-center gap-2'>
          {isEditing ? (
            <form data-cy='edit-comment-form' onSubmit={(e) => modifyComment(e, comment.commentId)} className='w-full'>
              <input
                data-cy='edit-comment-input'
                type='text'
                className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                placeholder={comment.content || ''}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
            </form>
          ) : (
            <p className='text-primary-500'>{comment.content ? comment.content : ''}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Feed: NextPageWithLayout = () => {
  const { data } = useSession();
  const t = useTranslations('feed');
  const [newPost, setNewPost] = useState('');
  const [file, setFile] = useState<File>();
  const [commentingPostId, setCommentingPostId] = useState('');
  const [editingPostId, setEditingPostId] = useState('');

  const currentUser = data?.user;
  const utils = api.useContext();

  const posts = api.post.getPosts.useQuery().data;

  const createPost = api.post.createPost.useMutation();

  const getPreSignedPUTUrl = api.cloudFlare.getPresignedPUTUrl.useMutation();

  const addPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPost) {
      createPost.mutate(
        {
          content: newPost,
          hasFiles: file ? true : false,
        },
        {
          onSuccess: (postData) => {
            void utils.post.getPosts.invalidate();
            setNewPost('');
            void handleUploadFile(postData as PostType);
          },
        },
      );
    }
  };

  const handleUploadFile = async (postData: PostType) => {
    if (file && postData) {
      const url = await getPreSignedPUTUrl.mutateAsync({
        fileName: file.name,
        userId: postData.userId,
        postId: postData.id,
        containerType: 'posts',
      });
      await uploadFile({ file, url });
      setFile(undefined);
    }
  };

  //Method passed as props to bind the file state to the Upload component
  const handleSetFile = (newFile: File | undefined) => {
    setFile(newFile);
  };

  return (
    <div className='flex h-full w-full justify-center p-2 md:p-8'>
      <div className='flex w-full max-w-[32rem] flex-col gap-2'>
        {data?.user && (
          <div className='flex flex-col items-center rounded-full bg-primary-100/10 '>
            <div className='flex w-full gap-4 p-4'>
              <div className='flex flex-col '>
                <Image
                  alt='User Avatar'
                  loader={() => data?.user?.image || '/placeholder.jpeg'}
                  src={data.user.image || '/placeholder.jpeg'}
                  width={48}
                  height={48}
                  className='rounded-full'
                  referrerPolicy='no-referrer'
                />
              </div>
              <div className='gap-y- flex flex-grow flex-col justify-center gap-y-2'>
                <form data-cy='post-form' onSubmit={addPost} className='w-full'>
                  <div className='flex h-full items-center rounded-full bg-white py-2 px-6'>
                    <input
                      data-cy='post-input'
                      type='text'
                      className='h-full w-full  text-primary-600 outline-none'
                      placeholder={t('post')}
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                    />
                    <Upload file={file} setFile={handleSetFile} />
                  </div>
                </form>
                {file && <FileUploadPreview file={file} />}
              </div>
            </div>
          </div>
        )}
        <div className='my-2 h-px w-full bg-primary-100/20' />

        <LayoutGroup>
          {posts?.map((post) => (
            <Post
              key={post.id}
              initialPost={post}
              userId={currentUser?.id || ''}
              userImage={currentUser?.image || ''}
              commentingPost={commentingPostId === post.id}
              editingPost={editingPostId === post.id}
              setCommentingPostId={setCommentingPostId}
              setEditingPostId={setEditingPostId}
            />
          ))}
        </LayoutGroup>
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

  return {
    props: {
      messages: JSON.parse(
        JSON.stringify(await import(`../../public/locales/${ctx.locale || 'en'}.json`)),
      ) as IntlMessages,
    },
  };
};
