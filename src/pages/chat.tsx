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
import { connectToChannel, useSubscribeToEvent } from '../utils/pusher';
import { type NextPageWithLayout } from './_app';

function TagsInput({ tagList, setTagList }: { tagList: string[]; setTagList: Dispatch<SetStateAction<string[]>> }) {
  return (
    <div className='tags-input-container mt-1 flex-wrap p-1'>
      {tagList.map((tag, index) => (
        <div className='tag-item mr-1 mt-1 inline-block rounded-2xl bg-primary-100 p-2' key={index}>
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
  lastCreatedAt,
}: {
  message: RouterOutputs['chat']['sendMessage'] & { sender: { firstName: string | null; lastName: string | null } };
  userId: string;
  lastCreatedAt?: Date;
}) {
  const isSender = message?.senderId === userId;
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
      className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex flex-col gap-1 ${isSender ? 'items-end text-right' : 'items-start text-left'} max-w-[80%]`}>
        <div>{`${message?.sender?.firstName || ''} ${message?.sender?.lastName || ''}`}</div>
        <div
          className={`rounded-md px-4 py-3 ${
            isSender ? 'bg-primary-500 text-white' : 'bg-primary-100/10 text-primary-500'
          }`}
        >
          {message.message}
        </div>
        {(!lastCreatedAt || differenceInMinutes(message.createdAt, lastCreatedAt) > 5) && (
          <div className='text-xs text-gray-500'>{format(message.createdAt, 'MMM. do, p')}</div>
        )}
      </div>
    </motion.div>
  );
}

const Chat: NextPageWithLayout = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [message, setMessage] = useState('');
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [messages, setMessages] = useState<
    (Messages & { sender: { firstName: string | null; lastName: string | null } })[]
  >([]);
  const [showAlreadyExists, setShowAlreadyExists] = useState(false);
  const [showLeaveGroup, setShowLeaveGroup] = useState(false);
  const [showAddUsers, setShowAddUsers] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [tags, setTags] = useState([] as string[]);

  const { data: session } = useSession();
  const utils = api.useContext();
  const connections = api.connections.getUserConnections.useQuery(
    { userEmail: session?.user?.email || '' },
    {
      enabled: openNewChatModal,
    },
  ).data;
  const messagesToUse = api.conversation.getConversationMessages.useQuery({
    id: selectedConversationId || '',
  }).data;
  const createConversation = api.conversation.createConversationFromEmails.useMutation();
  const addToConversation = api.conversation.addToConversation.useMutation();
  const leaveConversation = api.conversation.removeFromConversation.useMutation();
  const newChatMutation = api.chat.sendMessage.useMutation();

  const conversations = api.conversation.getUserConversations.useQuery({
    userEmail: session?.user?.email || '',
  }).data;

  useEffect(() => {
    if (messagesToUse) {
      setMessages(messagesToUse);
    }
  }, [messagesToUse]);

  useEffect(() => {
    const lastChannel = localStorage.getItem('lastChannel');
    if (lastChannel) {
      connectToChannel(lastChannel);
      setSelectedConversationId(lastChannel);
    }
  }, []);

  // Subscribe to a Pusher event
  useSubscribeToEvent(
    'message-sent',
    (data: Messages & { sender: { firstName: string | null; lastName: string | null } }) => {
      setMessages((oldData) => [
        {
          ...data,
          createdAt: new Date(data.createdAt),
        },
        ...oldData,
      ]);
    },
  );

  const handleClick = (conversation: RouterOutputs['conversation']['getUserConversations'][number]) => {
    connectToChannel(conversation.id);
    setSelectedConversationId(conversation.id);
  };

  const confirmLeaveGroup = (conversationId: string) => {
    leaveConversation.mutate(
      {
        userId: session?.user?.id || '',
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
    createConversation.mutate([...tags, session?.user?.email || ''], {
      onSuccess: (data) => {
        if (data != 'Already exists' && data?.id) {
          setSelectedConversationId(data.id);
          void utils.conversation.getUserConversations.invalidate();
          connectToChannel(data.id);
          localStorage.setItem('lastChannel', data.id);
        } else {
          setShowAlreadyExists(true);
        }
      },
    });
    setTags([]);
  };

  // Connect to the last channel the user was in
  // TODO: Store the channel whenever it is changed
  return (
    <main className='flex h-full max-h-screen w-full overflow-hidden'>
      <div className='flex h-full w-[350px] flex-col overflow-y-auto bg-primary-100/10'>
        <div className='flex items-center justify-between bg-primary-500 p-4 text-2xl font-semibold text-white'>
          <h1>Your Conversations</h1>
          <EditButton name='chat' type='add' onClick={() => setOpenNewChatModal(true)} />
        </div>
        {!conversations?.length ? (
          <div className='flex h-full flex-col items-center justify-center'>
            <div className='text-2xl font-semibold text-primary-500'>No conversations yet</div>
            <div className='text-lg font-semibold text-primary-500'>Create one to start chatting!</div>
          </div>
        ) : (
          conversations?.map((conversation) => (
            <button
              className={`flex items-center gap-4 px-3 py-4 ${
                conversation.id === selectedConversationId
                  ? 'bg-primary-500 text-white'
                  : 'text-primary-500 hover:bg-primary-100/10'
              } transition-colors duration-200 `}
              key={conversation.id}
              onClick={() => handleClick(conversation)}
            >
              <div className='relative h-12 w-12'>
                <Image
                  fill
                  className='rounded-full object-cover'
                  loader={({ src }) => src}
                  src={conversation?.users[0]?.image || '/placeholder.jpeg'}
                  alt='User Image'
                />
              </div>
              <div className='text-left'>
                <div className='text-lg font-semibold'>
                  {conversation.users.length < 2
                    ? `${conversation.users[0]?.firstName || ''} ${conversation.users[0]?.lastName || ''}`
                    : String(conversation.users.map((user) => `${user.firstName || ''} ${user.lastName || ''}, `)) +
                      ` ${String(session?.user?.firstName)} ${String(session?.user?.lastName)}`}
                </div>
                {/* <div className='text-sm'>
                  {conversation.id === selectedConversationId
                    ? messages[0]?.message || ''
                    : conversation.messages[0]?.message}
                </div> */}
              </div>
            </button>
          ))
        )}
      </div>
      {selectedConversationId && (
        <div className='flex h-full max-w-[800px] flex-1 flex-col p-4'>
          <div className='items-right flex justify-between bg-primary-500 p-4 text-2xl font-semibold text-white'>
            <h1>Messages</h1>
            <div className='flex'>
              <EditButton name='chat' type='remove' onClick={() => setShowLeaveGroup(true)} />
              <EditButton name='chat' type='addUsers' onClick={() => setShowAddUsers(true)} />
            </div>
          </div>
          <div className='relative h-full w-full'>
            <div className='absolute inset-0 flex flex-col-reverse overflow-auto px-4' ref={messagesRef}>
              {messages?.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  userId={session?.user?.id || ''}
                  lastCreatedAt={messages[0]?.createdAt}
                />
              ))}
              <div className='float-left clear-both' ref={messageEndRef} />
            </div>
          </div>
          <form
            className='mt-8'
            onSubmit={(e) => {
              e.preventDefault();
              newChatMutation.mutate({
                message: message,
                conversationId: selectedConversationId,
                senderId: session?.user?.id || '',
                sender: {
                  firstName: session?.user?.firstName || 'Unknown',
                  lastName: session?.user?.lastName || 'User',
                },
              });
              setMessage('');
            }}
          >
            <input
              type='text'
              className='w-full rounded-md bg-primary-100/10 px-4 py-3 outline-none'
              placeholder='Type a message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </form>
        </div>
      )}

      <AnimatePresence>
        {openNewChatModal && (
          <Modal onCancel={() => setOpenNewChatModal(false)} onConfirm={() => confirmCreation()}>
            <h1 className='mb-4 text-2xl font-semibold'>New Chat</h1>
            <div className='flex flex-col'>
              {connections?.map((connection) => (
                <button
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
        {showAlreadyExists && (
          <Modal onConfirm={() => setShowAlreadyExists(false)} confirmText='OK' showCancel={false}>
            <h1 className='mb-4 text-2xl font-semibold'>You already have a similar conversation!</h1>
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddUsers && (
          <Modal
            onConfirm={() => confirmAddUsers(selectedConversationId || '')}
            onCancel={() => setShowAddUsers(false)}
            confirmText='Yes'
          >
            <h1 className='mb-4 text-2xl font-semibold'>Add users to conversation</h1>
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
            confirmText='Yes'
          >
            <h1 className='mb-4 text-2xl font-semibold'>Are you sure you want to leave the group?</h1>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
};

Chat.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Chat;
