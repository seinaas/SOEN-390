import { formatDistance } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { IoIosChatboxes, IoMdShare, IoMdThumbsUp } from 'react-icons/io';
import MainLayout from '../components/mainLayout';
import type { NextPageWithLayout } from './_app';
import { motion } from 'framer-motion';
import type { GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/auth';
import { api } from '../utils/api';

type Post = {
  poster: string;
  logo: string;
  time: Date;
  likes: number;
  text?: string;
  padding?: boolean;
  id: number;
};

const posts: Post[] = [
  {
    poster: 'Apple',
    logo: 'https://cdn.cdnlogo.com/logos/a/2/apple.svg',
    time: new Date(Date.now() - 1000 * 60 * 60 * 4),
    likes: 123102,
    padding: true,
    id: 1,
  },
  {
    poster: 'Netflix',
    logo: 'https://cdn.cdnlogo.com/logos/n/75/netflix.svg',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    likes: 92000,
    padding: true,
    id: 2,
  },
  {
    poster: 'Concordia',
    logo: '/concordia.jpeg',
    time: new Date(Date.now() - 1000 * 55),
    likes: 201,
    id: 3,
  },
];

const Feed: NextPageWithLayout = () => {
  const { data } = useSession();
  const [likes, setLikes] = useState(0),
    [isLike, setIsLike] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [shared, setShared] = useState(false);
  const [popup, setPop] = useState(false);
  const [comment, setComment] = useState('');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      poster: 'Apple',
      logo: 'https://cdn.cdnlogo.com/logos/a/2/apple.svg',
      time: new Date(Date.now() - 1000 * 60 * 60 * 4),
      likes: 123102,
      padding: true,
      id: 1,
    },
    {
      poster: 'Netflix',
      logo: 'https://cdn.cdnlogo.com/logos/n/75/netflix.svg',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      likes: 92000,
      padding: true,
      id: 2,
    },
    {
      poster: 'Concordia',
      logo: '/concordia.jpeg',
      time: new Date(Date.now() - 1000 * 55),
      likes: 201,
      id: 3,
    },
  ]);

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

  const removePost = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();

    // If the post has comments, they must be deleted first!
    const commentsOnPost = comments?.filter((comment) => comment?.postId === postId);

    if (commentsOnPost) {
      commentsOnPost.map((comment) => {
        removeComment(e, comment.commentId);
      });
    }

    if (deletePost) {
      deletePost.mutate(
        {
          postId: postId,
        },
        {
          onSuccess: () => {
            void utils.post.getPosts.invalidate();
          },
        },
      );
    }
  };

  const modifyPost = (e: React.FormEvent<HTMLFormElement>, postId: string) => {
    e.preventDefault();
    if (editingPost) {
      editPost.mutate(
        {
          postId: postId,
          content: editingPost,
        },
        {
          onSuccess: () => {
            void utils.post.getPosts.invalidate();
          },
        },
      );
      setIsEditingPost(false);
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
            void utils.post.getComments.invalidate();
            setNewComment('');
          },
        },
      );
      setCommentState(false);
    }
  };

  const removeComment = (e: React.MouseEvent, commentId: string) => {
    e.preventDefault();
    if (deleteComment) {
      deleteComment.mutate(
        {
          commentId: commentId,
        },
        {
          onSuccess: () => {
            void utils.post.getComments.invalidate();
          },
        },
      );
    }
  };

  const modifyComment = (e: React.FormEvent<HTMLFormElement>, commentId: string, postId: string) => {
    e.preventDefault();
    if (editingComment) {
      editComment.mutate(
        {
          commentId: commentId,
          postId: postId,
          content: editingComment,
        },
        {
          onSuccess: () => {
            void utils.post.getComments.invalidate();
          },
        },
      );
      setIsEditingComment(false);
    }
  };

  const handleShare = () => {
    setShareCount(shareCount + 1);
    setShared(true);
  };

  return (
    <div className='flex h-full w-full justify-center p-2 md:p-8'>
      <div className='flex w-full max-w-[32rem] flex-col gap-2'>
        {data?.user && (
          <div className='flex gap-4 rounded-full bg-primary-100/10 p-4'>
            <Image
              alt='User Avatar'
              loader={() => data?.user?.image || '/placeholder.jpeg'}
              src={data.user.image || '/placeholder.jpeg'}
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

        {posts?.map((post) => {
          const isLiked =
            likedPosts[post.id] || !!likes?.find((like) => like.userId === currentUser?.id && like.postId === post.id);

          const buttonStyles = isLiked
            ? {
                backgroundColor: 'rgb(5 84 66)',
                color: 'white',
              }
            : {
                backgroundColor: 'white',
                color: 'rgb(5 84 66)',
              };

          const postComments = comments?.filter((comment) => comment.postId === post.id);

          const ownsPost = post.userId === currentUser?.id;
          return (
            <div key={post.id}>
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
                      <p className='text-primary-400'>
                        {formatDistance(post.createdAt, new Date(), { addSuffix: true })}
                      </p>
                    </div>
                    <div className='flex items-center gap-1'>
                      {ownsPost && (
                        <div>
                          <button
                            onClick={() => {
                              setSelectedEditPost(post.id);
                              setIsEditingPost(!isEditingPost);
                            }}
                          >
                            <IoMdCreate />
                          </button>
                          <button onClick={(e) => removePost(e, post.id)}>
                            <IoMdRemove />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditingPost && selectedEditPost === post.id ? (
                    <form onSubmit={(e) => modifyPost(e, post.id)} className='w-full'>
                      <input
                        type='text'
                        className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                        placeholder={post.content}
                        value={editingPost}
                        onChange={(e) => setEditingPost(e.target.value)}
                      />
                    </form>
                  ) : (
                    <p className='text-primary-500'>
                      {post.content
                        ? post.content
                        : `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget consectetur lacinia,
                nisl nisl aliquam nisl, eget ultricies nisl nisl sit amet nisl. Suspendisse potenti. Nulla facilisi.
                Nulla facilisi. Nulla facilisi. Nulla facilisi.`}
                    </p>
                  )}

                  <div className='mt-2 flex items-center gap-2 border-t-2 border-t-primary-100/20 pt-2'>
                    <p className='{"" +(isLike ? "text-primary" : "")}'>
                      <button
                        key={post.id}
                        onClick={() => {
                          const liked = likes?.find(
                            (like) => like.userId === currentUser?.id && like.postId === post.id,
                          );

                          console.log(liked);
                          if (!liked) {
                            createLike.mutate(
                              {
                                postId: post.id,
                                userId: currentUser?.id,
                              },
                              {
                                onSuccess: () => {
                                  toggleLike(post.id, true);
                                  void utils.post.getLikes.invalidate();
                                },
                              },
                            );
                          } else {
                            removeLike.mutate(
                              {
                                postId: post.id,
                                likeId: likes.find((like) => like.userId === currentUser?.id && like.postId === post.id)
                                  .likeId,
                              },
                              {
                                onSuccess: () => {
                                  toggleLike(post.id, false);
                                  void utils.post.getLikes.invalidate();
                                },
                              },
                            );
                          }
                        }}
                        style={buttonStyles}
                        className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'
                      >
                        <IoMdThumbsUp />
                        <p>Like {likes.filter((like) => like.postId === post.id).length}</p>
                      </button>
                    </p>
                    <button
                      className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'
                      onClick={() => {
                        setCommentState(!commentState);
                        setSelectedPost(post.id);
                      }}
                    >
                      <IoIosChatboxes />
                      <p>Comment</p>
                    </button>
                    <button
                      onClick={handleShare}
                      className='flex items-center gap-2 rounded-full bg-white px-3 py-1 text-primary-400 transition-colors duration-200 hover:bg-primary-100/10'
                    >
                      <IoMdShare />
                      <p> {shared ? 'Shared' : 'Share'}</p>
                    </button>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                  {commentState && selectedPost === post.id && (
                    <div className='flex items-start gap-4 rounded-xl bg-primary-100/10 p-4 pr-8'>
                      <Image
                        alt='User Avatar'
                        loader={() => data?.user?.image || 'placeholder.jpeg'}
                        src={'placeholder.jpeg'}
                        width={48}
                        height={48}
                        className='rounded-full'
                        referrerPolicy='no-referrer'
                      />
                      <form onSubmit={(e) => addComment(e, post.id)} className='w-full'>
                        <input
                          type='text'
                          className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                          placeholder='Write a comment'
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>

              {postComments.map((comment) => {
                return (
                  <motion.div
                    key={comment.commentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex items-start gap-4 bg-primary-100/5 p-4 pr-8'
                  >
                    <hr style={{ borderTop: '4px solid darkgreen', height: '10px' }}></hr>
                    <div className='relative h-12 min-h-[48px] w-12 min-w-[48px]'>
                      <Image
                        alt='Logo'
                        loader={() => comment.User.image || '/placeholder.jpeg'}
                        src={comment.User.image || 'placeholder.jpeg'}
                        fill
                        className='rounded-md bg-white object-contain'
                        referrerPolicy='no-referrer'
                      />
                    </div>
                    <div className='flex flex-1 flex-col'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <p className='font-bold text-primary-500'>
                            {comment.User.firstName} {comment.User.lastName} :
                          </p>
                          {isEditingComment && selectedEditComment === comment.commentId ? (
                            <form onSubmit={(e) => modifyComment(e, comment.commentId, post.id)} className='w-full'>
                              <input
                                type='text'
                                className='h-full w-full rounded-full bg-white py-2 px-6 text-primary-600 outline-none'
                                placeholder={comment.content}
                                value={editingComment}
                                onChange={(e) => setEditingComment(e.target.value)}
                              />
                            </form>
                          ) : (
                            <p className='text-primary-500'>{comment.content ? comment.content : ''}</p>
                          )}
                        </div>
                        <div className='flex items-center gap-1'>
                          <button
                            onClick={() => {
                              setSelectedEditComment(comment.commentId);
                              setIsEditingComment(!isEditingComment);
                            }}
                          >
                            <IoMdCreate />
                          </button>
                          <button onClick={(e) => removeComment(e, comment.commentId)}>
                            <IoMdRemove />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
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
