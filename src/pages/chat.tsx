import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import MainLayout from '../components/mainLayout';
import Modal from '../components/modal';
import EditButton from '../components/profile/editButton';
import { api } from '../utils/api';
import type { Conversation, Message } from '../utils/Conversation-Service';
import { connectToChannel, useSubscribeToEvent } from '../utils/pusher';
import { type NextPageWithLayout } from './_app';


function MessageItem({ message, userId }: { message: Message; userId: string }) {
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
        <div
          className={`rounded-md px-4 py-3 ${
            isSender ? 'bg-primary-500 text-white' : 'bg-primary-100/10 text-primary-500'
          }`}
        >
          {message.message}
        </div>
        <div className='text-xs text-gray-500'>{message.sentAt}</div>
      </div>
    </motion.div>
  );
}

const Chat: NextPageWithLayout = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [message, setMessage] = useState('');
  const [openNewChatModal, setOpenNewChatModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const utils = api.useContext();
  const connections = api.connections.getUserConnections.useQuery({ userEmail: session?.user?.email || '' }).data;
  const messagesToUse = api.conversation.getConversationMessages.useQuery({
    id: selectedConversationId || '',
  }).data;
  const createConversation = api.conversation.createConversation.useMutation();
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
  useSubscribeToEvent('message-sent', () => {
    void utils.conversation.getConversationMessages.invalidate();
  });

  const handleClick = (conversation: Conversation) => {
    connectToChannel(conversation.id);
    setSelectedConversationId(conversation.id);
  };

  // Connect to the last channel the user was in
  // TODO: Store the channel whenever it is changed

  return (
    <main className='flex h-full max-h-screen w-full overflow-hidden'>
      <div className='flex h-full w-[350px] flex-col bg-primary-100/10'>
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
                  src={
                    (conversation.user1Id == session?.user?.id
                      ? conversation.user2?.image
                      : conversation.user1?.image) || '/placeholder.jpeg'
                  }
                  alt='User Image'
                />
              </div>
              <div className='text-left'>
                <div className='text-lg font-semibold'>
                  {conversation.user1Id == session?.user?.id
                    ? `${conversation.user2?.firstName || ''} ${conversation.user2?.lastName || ''}`
                    : `${conversation.user1?.firstName || ''} ${conversation.user1?.lastName || ''}`}
                </div>
                <div className='text-sm'>
                  {conversation.id === selectedConversationId
                    ? messages[0]?.message || ''
                    : conversation.messages[0]?.message}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      {selectedConversationId && (
        <div className='flex h-full max-w-[800px] flex-1 flex-col p-4'>
          <div className='relative h-full w-full'>
            <div className='absolute inset-0 flex flex-col-reverse overflow-auto px-4' ref={messagesRef}>
              {messages?.map((message) => (
                <MessageItem key={message.id} message={message} userId={session?.user?.id || ''} />
              ))}
              <div className='float-left clear-both' ref={messageEndRef} />
            </div>
          </div>
          <form
            className='mt-8'
            onSubmit={(e) => {
              e.preventDefault();
              setMessage('');
              newChatMutation.mutate({ message, conversationId: selectedConversationId });
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
          <Modal onCancel={() => setOpenNewChatModal(false)}>
            <h1 className='mb-4 text-2xl font-semibold'>New Chat</h1>
            <div className='flex flex-col'>
              {connections?.map(
                (connection) =>
                  // only show connections that don't already have a conversation
                  !conversations?.find((convo) =>
                    convo.user1Id == session?.user?.id
                      ? convo.user2?.email == connection.email
                      : convo.user1?.email == connection.email,
                  ) && (
                    <button
                      className='flex items-center justify-start rounded-md px-4 py-3 transition-colors duration-200 hover:bg-primary-100/10'
                      key={connection.id}
                      onClick={() => {
                        setOpenNewChatModal(false);
                        createConversation.mutate(
                          {
                            userEmail: connection.email,
                          },
                          {
                            onSuccess: (data) => {
                              void utils.conversation.getUserConversations.invalidate();
                              if (data?.id) {
                                setSelectedConversationId(data.id);
                                connectToChannel(data.id);
                                localStorage.setItem('lastChannel', data.id);
                              }
                            },
                          },
                        );
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
                  ),
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </main>
  );
};

Chat.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Chat;
