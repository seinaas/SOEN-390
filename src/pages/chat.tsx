import type { Messages } from '@prisma/client';
import { differenceInMinutes, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import MainLayout from '../components/mainLayout';
import Modal from '../components/modal';
import EditButton from '../components/profile/editButton';
import type { RouterOutputs } from '../utils/api';
import { api } from '../utils/api';
import { connectToChannel, pusherStore, useSubscribeToChannelEvent, useSubscribeToUserEvent } from '../utils/pusher';
import { type NextPageWithLayout } from './_app';
import { getServerAuthSession } from '../server/auth';
import { type GetServerSidePropsContext } from 'next';
import { useTranslations } from 'next-intl';
import { Upload, uploadFile } from '../components/upload';
import { FileDownloadPreview, FileUploadPreview } from '../components/filePreview';
import { useFileUploading } from '../customHooks/useFileUploading';
import { useStore } from 'zustand';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { env } from '../env/client.mjs';
import { useWindowSize } from '../utils/useWindowSize';
import { IoIosArrowBack } from 'react-icons/io';

function TagsInput({ tagList, setTagList }: { tagList: string[]; setTagList: Dispatch<SetStateAction<string[]>> }) {
  return (
    <div className='tags-input-container mt-1 flex-wrap p-1'>
      {tagList.map((tag, index) => (
        <div className='tag-item mr-1 mt-1 inline-block rounded-2xl bg-primary-100 py-2 px-4 text-white' key={index}>
          <span className='text'>{tag}</span>
          <button
            className='close ml-1'
            onClick={(e) => {
              e.preventDefault();
              setTagList(tagList.filter((tg) => tg != tag));
            }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

function MessageItem({
  message,
  userId,
  nextSenderId,
  lastCreatedAt,
  isFile,
}: {
  message: RouterOutputs['chat']['sendMessage'] & { sender: { firstName: string | null; lastName: string | null } };
  userId: string;
  nextSenderId?: string;
  lastCreatedAt?: Date;
  isFile: boolean;
}) {
  const isSender = message?.senderId === userId;
  const timeFromLastMessage = differenceInMinutes(message.createdAt, lastCreatedAt || new Date());
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300,
          delay: 0.1,
        },
      }}
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`flex flex-col gap-1 ${isSender ? 'items-end text-right' : 'items-start text-left'} max-w-[80%]`}>
        {(!nextSenderId || nextSenderId !== message.senderId || timeFromLastMessage > 5) && (
          <div className='mt-2 flex items-center gap-1'>
            <span>{`${message?.sender?.firstName || ''} ${message?.sender?.lastName || ''}`}</span>
            <span className='text-xs text-gray-500'>| {format(message.createdAt, 'p')}</span>
          </div>
        )}
        <div
          className={`rounded-md ${isFile ? 'pl-2 pr-4' : 'px-4'} py-3 ${
            isSender ? 'bg-primary-500 text-white' : 'bg-primary-100/10 text-primary-500'
          }`}
        >
          {(isFile && (
            <FileDownloadPreview
              fileName={message.message}
              pathPrefixes={['conversations', message.conversationId, 'messages', message.id]}
            />
          )) ||
            message.message}
        </div>
      </div>
    </motion.div>
  );
}

const Chat: NextPageWithLayout = () => {
  const t = useTranslations('chat');

  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [message, setMessage] = useState('');
  const [newFile, setNewFile] = useState<File>();
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [messages, setMessages] = useState<RouterOutputs['conversation']['getConversationMessages']>([]);
  const [showLeaveGroup, setShowLeaveGroup] = useState(false);
  const [showAddUsers, setShowAddUsers] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [tags, setTags] = useState([] as string[]);

  const { data: session } = useSession();
  const utils = api.useContext();

  const members = useStore(pusherStore, (state) => state.members);

  const connections = api.connections.getUserConnections.useQuery(
    { userEmail: session?.user?.email || '' },
    {
      enabled: openNewChatModal || showAddUsers,
    },
  ).data;
  const messagesToUse = api.conversation.getConversationMessages.useQuery({
    id: selectedConversationId || '',
  }).data;
  const createConversation = api.conversation.createConversationFromEmails.useMutation();
  const addToConversation = api.conversation.addToConversation.useMutation();
  const leaveConversation = api.conversation.removeFromConversation.useMutation();
  const newChatMutation = api.chat.sendMessage.useMutation();

  const conversations = api.conversation.getUserConversations.useQuery().data;
  const { getPreSignedPUTUrl } = useFileUploading();

  const { width } = useWindowSize();
  const currentConversation = conversations?.find((c) => c.id === selectedConversationId);

  const moderateMessage = async (message: string): Promise<boolean> => {
    const openaiApiKey = env.NEXT_PUBLIC_OPENAI_KEY;
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({ input: message }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data?.results?.[0].categories['hate'] ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data?.results?.[0].categories['hate/threatening'] ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data?.results?.[0].categories['sexual'] ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data?.results?.[0].categories['violence']
    ) {
      toast.warning(
        'Prospects does not tolerate hate speech or anything associated to it. Please refrain from using it.',
      );
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    if (messagesToUse) {
      setMessages(messagesToUse);
    }
  }, [messagesToUse]);

  useEffect(() => {
    const lastChannel = localStorage.getItem(`${session?.user?.id || ''}-lastChannel`);
    if (lastChannel) {
      connectToChannel(lastChannel);
      setSelectedConversationId(lastChannel);
    }
  }, []);

  // Subscribe to a Pusher event
  useSubscribeToChannelEvent(
    'message-sent',
    (data: Messages & { sender: { firstName: string | null; lastName: string | null; id: string } }) => {
      setMessages((oldData) => [
        {
          ...data,
          createdAt: new Date(data.createdAt),
        },
        ...oldData,
      ]);
    },
  );

  useSubscribeToUserEvent('chat', () => {
    void utils.conversation.getUserConversations.invalidate();
  });

  const handleClick = (conversation: RouterOutputs['conversation']['getUserConversations'][number]) => {
    connectToChannel(conversation.id);
    setSelectedConversationId(conversation.id);
  };

  const confirmLeaveGroup = (conversationId: string) => {
    leaveConversation.mutate(
      {
        conversationId: conversationId,
      },
      {
        onSuccess: () => {
          setShowLeaveGroup(false);
          void utils.conversation.getUserConversations.invalidate();
          setSelectedConversationId(undefined);
        },
      },
    );
  };

  const confirmAddUsers = (conversationId: string) => {
    addToConversation.mutate(
      {
        conversationId: conversationId,
        usersEmail: tags,
      },
      {
        onSuccess: () => {
          void utils.conversation.getUserConversations.invalidate();
          setShowAddUsers(false);
          setTags([]);
        },
      },
    );
  };

  const confirmCreation = () => {
    setOpenNewChatModal(false);
    createConversation.mutate([...tags], {
      onSuccess: (data) => {
        if (data?.id) {
          setSelectedConversationId(data.id);
          void utils.conversation.getUserConversations.invalidate();
          connectToChannel(data.id);
          localStorage.setItem(`${session?.user?.id || ''}-lastChannel`, data.id);
        } else {
          setSelectedConversationId(data.id);
        }
      },
    });
    setTags([]);
  };

  const handleSendNewMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (message) {
      const isModerated = await moderateMessage(message);
      if (isModerated) {
        newChatMutation.mutate({
          message: message,
          conversationId: selectedConversationId || '',
        });
        setMessage('');
      } else {
        setMessage('');
      }
    }

    if (newFile) {
      const newMessage: Messages = await newChatMutation.mutateAsync({
        message: newFile.name,
        conversationId: selectedConversationId as string,
        isFile: true,
      });
      const url = await getPreSignedPUTUrl.mutateAsync({
        fileName: newFile.name,
        pathPrefixes: ['conversations', selectedConversationId as string, 'messages', newMessage.id],
      });
      await uploadFile({ file: newFile, url });
      setNewFile(undefined);
    }
  };

  return (
    <main className='flex h-full max-h-screen w-full overflow-hidden'>
      <div
        className={`flex h-full w-full flex-col overflow-y-auto bg-primary-100/10 xs:w-[350px] ${
          selectedConversationId && width < 640 ? 'hidden' : ''
        }`}
      >
        <div className='flex items-center justify-between rounded-bl-lg bg-primary-500 p-4 text-2xl font-semibold text-white'>
          <h1>{t('sidebar.title')}</h1>
          <EditButton name='chat' type='add' onClick={() => setOpenNewChatModal(true)} />
        </div>

        {!conversations?.length ? (
          <div className='flex h-full flex-col items-center justify-center'>
            <div className='text-2xl font-semibold text-primary-500' data-cy='no-convos'>
              {t('sidebar.empty')}
            </div>
            <div className='text-center text-lg font-semibold leading-none text-primary-200'>
              {t('sidebar.empty-sub')}
            </div>
          </div>
        ) : (
          <div className='flex w-full flex-col gap-2 p-2'>
            {conversations?.map((conversation) => (
              <button
                className={`flex items-center gap-4 rounded-lg px-3 py-4 ${
                  conversation.id === selectedConversationId
                    ? 'bg-primary-100 text-white'
                    : 'text-primary-500 hover:bg-primary-100/10'
                } transition-colors duration-200 `}
                key={conversation.id}
                onClick={() => handleClick(conversation)}
              >
                <div className='relative h-12 min-h-[3rem] w-12 min-w-[3rem]'>
                  <Image
                    fill
                    className='rounded-full object-cover'
                    loader={({ src }) => src}
                    src={conversation?.users[0]?.image || '/placeholder.jpeg'}
                    alt='User Image'
                    referrerPolicy='no-referrer'
                  />

                  {/* Green activity bubble if user is online */}
                  <AnimatePresence initial={false}>
                    {conversation.users.length === 1 && members.has(conversation.users[0]?.id || '') && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className='absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500'
                      ></motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className='max-w-full truncate whitespace-nowrap text-left'>
                  <h1 className='text-ellipsis text-lg font-semibold'>
                    {conversation.users.length < 2
                      ? `${conversation.users[0]?.firstName || ''} ${conversation.users[0]?.lastName || ''}`
                      : conversation.users.map((user) => `${user.firstName || ''} ${user.lastName || ''}`).join(', ')}
                  </h1>
                  <p className='truncate'>
                    {conversation.users.length > 1 && (
                      <span className='font-medium'>{conversation.messages[0]?.sender?.firstName}:</span>
                    )}{' '}
                    {conversation.messages[0]?.message || ''}
                  </p>
                  {/* <div className='text-sm'>
                  {conversation.id === selectedConversationId
                    ? messages[0]?.message || ''
                    : conversation.messages[0]?.message}
                </div> */}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedConversationId && (
        <div className='flex h-full max-w-[800px] flex-1 flex-col'>
          <div className='items-right flex justify-between rounded-br-lg bg-primary-500 p-4 text-2xl font-semibold text-white'>
            <div className='flex items-center gap-2'>
              {width < 640 && (
                <button className='text-white' onClick={() => setSelectedConversationId('')}>
                  <IoIosArrowBack size={24} />
                </button>
              )}
              <h1 className='truncate'>
                {(currentConversation?.users?.length || 0) < 2
                  ? `${currentConversation?.users?.[0]?.firstName || ''} ${
                      currentConversation?.users?.[0]?.lastName || ''
                    }`
                  : currentConversation?.users
                      ?.map((user) => `${user.firstName || ''} ${user.lastName || ''}`)
                      .join(', ') || ''}
              </h1>
            </div>
            <div className='flex'>
              {(currentConversation?.users.length || 0) > 1 && (
                <EditButton name='chat' type='remove' onClick={() => setShowLeaveGroup(true)} />
              )}
              <EditButton name='chat' type='addUsers' onClick={() => setShowAddUsers(true)} />
            </div>
          </div>
          <div className='relative h-full w-full'>
            <div
              data-cy='messages-box'
              className='absolute inset-0 flex flex-col-reverse overflow-auto px-4'
              ref={messagesRef}
            >
              {messages?.map((message, index) => {
                const nextSenderId = messages[index + 1]?.senderId;
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    userId={session?.user?.id || ''}
                    nextSenderId={nextSenderId}
                    lastCreatedAt={messages[index + 1]?.createdAt}
                    isFile={message.isFile}
                  />
                );
              })}
              <div className='float-left clear-both' ref={messageEndRef} />
            </div>
          </div>
          <form className='mt-8 flex items-center p-3' onSubmit={handleSendNewMessage} data-cy='new-message-form'>
            <div className='flex h-fit w-full flex-col justify-center gap-3 rounded-md bg-primary-100/10 px-2 py-3 outline-none'>
              <div className='flex w-full flex-row px-2'>
                <input
                  type='text'
                  className='w-full rounded-md bg-transparent outline-none'
                  placeholder={t('message-placeholder')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  data-cy='new-message-input'
                />
                <Upload
                  setFile={(newFile: File | undefined) => {
                    setNewFile(newFile);
                  }}
                  className='h-6 w-6'
                />
              </div>
              <FileUploadPreview file={newFile} />
            </div>
          </form>
          <ToastContainer />
        </div>
      )}

      <AnimatePresence>
        {openNewChatModal && (
          <Modal
            onCancel={() => setOpenNewChatModal(false)}
            onConfirm={() => confirmCreation()}
            confirmText={t('modals.confirm')}
          >
            <h1 className='mb-4 text-2xl font-semibold'>{t('modals.new')}</h1>
            <div className='flex flex-col'>
              {connections?.map((connection) => (
                <button
                  data-cy={`add-user-${connection.lastName || ''}`}
                  className='flex items-center justify-start rounded-md px-4 py-3 transition-colors duration-200 hover:bg-primary-100/10'
                  key={connection.id}
                  onClick={() => {
                    if (!tags.find((tag) => connection.email == tag)) {
                      setTags([...tags, connection.email]);
                    }
                  }}
                >
                  <div className='relative h-12 w-12'>
                    <Image
                      fill
                      className='rounded-full object-cover'
                      loader={({ src }) => src}
                      src={connection.image || '/placeholder.jpeg'}
                      alt='User Image'
                      referrerPolicy='no-referrer'
                    />
                  </div>
                  <div className='ml-4'>
                    <div className='text-lg font-semibold text-primary-500'>
                      {connection.firstName} {connection.lastName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {tags && (
              <div>
                <TagsInput tagList={tags} setTagList={setTags}></TagsInput>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddUsers && (
          <Modal
            onConfirm={() => confirmAddUsers(selectedConversationId || '')}
            onCancel={() => setShowAddUsers(false)}
            confirmText={t('modals.confirm')}
          >
            <h1 className='mb-4 text-2xl font-semibold'>{t('modals.add-users')}</h1>
            <div className='flex flex-col'>
              {connections
                ?.filter(
                  (connection) =>
                    !conversations
                      ?.find((convo) => convo.id == selectedConversationId)
                      ?.users.map((user) => user.email)
                      .includes(connection.email),
                )
                ?.map((connection) => (
                  <button
                    data-cy={`add-user-${connection.lastName || ''}`}
                    className='flex items-center justify-start rounded-md px-4 py-3 transition-colors duration-200 hover:bg-primary-100/10'
                    key={connection.id}
                    onClick={() => {
                      if (tags.find((tag) => connection.email == tag) == undefined) {
                        setTags([...tags, connection.email]);
                      }
                    }}
                  >
                    <div className='relative h-12 w-12'>
                      <Image
                        fill
                        className='rounded-full object-cover'
                        loader={({ src }) => src}
                        src={connection.image || '/placeholder.jpeg'}
                        alt='User Image'
                        referrerPolicy='no-referrer'
                      />
                    </div>
                    <div className='ml-4'>
                      <div className='text-lg font-semibold text-primary-500'>
                        {connection.firstName} {connection.lastName}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
            {tags && (
              <div>
                <TagsInput tagList={tags} setTagList={setTags}></TagsInput>
              </div>
            )}
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showLeaveGroup && (
          <Modal
            onConfirm={() => confirmLeaveGroup(selectedConversationId || '')}
            onCancel={() => setShowLeaveGroup(false)}
            confirmText={t('modals.yes')}
          >
            <h1 className='mb-4 text-2xl font-semibold'>{t('modals.leave')}</h1>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
};

Chat.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Chat;

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
