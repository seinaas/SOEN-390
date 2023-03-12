import ListItemButton from '@mui/material/ListItemButton';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import MainLayout from '../components/mainLayout';
import { api } from '../utils/api';
import type { Conversation, Message } from '../utils/Conversation-Service';
import { connectToChannel, useSubscribeToEvent } from '../utils/pusher';
import { type NextPageWithLayout } from './_app';

function MessageItem({ message }: { message: Message }) {
  const isSender = message?.senderId === useSession().data?.user?.id;
  return (
    <>
      <div className='flex flex-col'></div>
      <div
        className={
          !isSender
            ? 'mb-2 flex w-1/2 flex-col items-start break-all'
            : 'mb-2 ml-auto flex w-1/2 flex-col items-end break-all'
        }
      >
        <p className={isSender ? 'text-teal text-right text-sm' : 'text-teal text-sm'}>
          {message?.sender?.email || 'NA'}
        </p>
        <p
          className={
            isSender
              ? 'break-all rounded-bl-3xl rounded-tl-3xl rounded-tr-xl bg-white py-3 px-4 text-black'
              : 'break-all rounded-br-3xl rounded-tr-3xl rounded-tl-xl bg-white py-3 px-4 text-black'
          }
        >
          {message?.message}
        </p>
        <p className={isSender ? 'text-grey-dark mt-1 text-right text-xs' : 'text-grey-dark mt-1 text-xs'}>
          {message?.sentAt}
        </p>
      </div>
    </>
  );
}

const Chat: NextPageWithLayout = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [image, setImage] = useState(null);
  const { data: session } = useSession();
  const utils = api.useContext();
  const messagesToUse = api.conversation.getConversationMessages.useQuery({
    id: selectedConversationId || 'error',
  }).data;
  const [message, setMessage] = useState('');
  const newChatMutation = api.chat.sendMessage.useMutation();
  const [messages, setMessages] = useState<Message[]>([]);
  let email = undefined;
  if (session) {
    email = session?.user?.email;
  }
  const conversations = api.conversation.getUserConversations.useQuery({
    userEmail: email as string,
  }).data as Conversation[];

  useEffect(() => {
    if (messagesToUse) {
      setMessages(messagesToUse);
    }
  }, [messagesToUse]);
  // Subscribe to a Pusher event
  useSubscribeToEvent('message-sent', (data) => {
    console.log(data);
  });
  const currentConversation = conversations?.find((convo) => convo.id === selectedConversationId);
  const receiver =
    currentConversation?.user1Id == session?.user?.id ? currentConversation?.user2 : currentConversation?.user1;

  const mutatedMessages = (() => {
    // if you want to mutate the data for some reason
    return messages;
  })();

  const handleClick = (conversation: Conversation) => {
    connectToChannel(conversation.user1Id == session?.user?.id ? conversation.user2Id : conversation.user1Id);
    setSelectedConversationId(conversation.id);
  };

  // Connect to the last channel the user was in
  // TODO: Store the channel whenever it is changed

  return (
    <>
      <div className='h-32 w-full' style={{ backgroundColor: '#' }}></div>

      <div className='container mx-auto' style={{ marginTop: '-128px' }}>
        <div className='h-1 py-6'>
          <div className='border-grey flex rounded border shadow-lg' style={{ height: '70vh' }}>
            <div className='bg-grey-lighter flex w-2/5 flex-1 flex-col overflow-auto'>
              <div className='flex items-center justify-between border-b-2 bg-white px-5 py-5'>
                <div className='text-2xl font-semibold text-primary-500'>Your conversations</div>
              </div>
              <div className='bg-grey-lighter flex-1 overflow-auto'>
                {conversations?.length > 0 ? (
                  conversations?.map((conversation) => (
                    <ListItemButton
                      style={{ borderBottom: '1px solid', borderColor: 'lightgray' }}
                      className='flex items-center px-3'
                      key={conversation.user1Id == session?.user?.id ? conversation.user2Id : conversation.user1Id}
                      onClick={() => handleClick(conversation)}
                      selected={selectedConversationId === conversation.id}
                    >
                      <div>
                        <img
                          className='h-12 w-12 rounded-full'
                          src={
                            (conversation.user1Id == session?.user?.id
                              ? conversation.user2?.image
                              : conversation.user1?.image) || '/istockphoto-1298261537-612x612.jpg'
                          }
                          alt='None'
                        />
                      </div>
                      <div className='ml-4 flex-1'>
                        <div className='items-bottom flex justify-between'>
                          <p className='text-grey-darkest'>
                            {conversation.user1Id == session?.user?.id
                              ? conversation.user2?.email
                              : conversation.user1?.email}
                          </p>
                          <p className='text-grey-darkest text-xs'>
                            {conversation?.messages?.sort((a, b) => (a.sentAt > b.sentAt ? -1 : 1))[0]?.sentAt}
                          </p>
                        </div>
                        <p className='text-grey-dark mt-1 text-sm' style={{ textOverflow: 'ellipsis' }}>
                          {conversation?.messages?.length > 0
                            ? (() => {
                                const latestMessage = conversation?.messages?.sort((a, b) =>
                                  a.sentAt > b.sentAt ? -1 : 1,
                                )[0];
                                const sender =
                                  conversation.user1Id == latestMessage?.senderId
                                    ? conversation.user1
                                    : conversation.user2;
                                return sender.id == session?.user?.id
                                  ? 'You: ' + String(latestMessage?.message)
                                  : String(conversation.user2.email) + ': ' + String(latestMessage?.message);
                              })()
                            : ''}
                        </p>
                      </div>
                    </ListItemButton>
                  ))
                ) : (
                  <p className='text-center align-bottom'>You do not have any conversations yet.</p>
                )}
              </div>
            </div>
            <div className='flex w-3/5 flex-col border'>
              {selectedConversationId && (
                <>
                  <div className='flex flex-row items-center justify-between bg-primary-500 py-2 px-3'>
                    <div className='flex items-center'>
                      <div>
                        <img
                          className='h-10 w-10 rounded-full'
                          src={receiver?.image != null ? receiver?.image : '/istockphoto-1298261537-612x612.jpg'}
                          alt='None'
                        />
                      </div>
                      <div className='ml-4'>
                        <p className='text-blue'>{receiver?.email}</p>
                        {/* YOU WILL WANT TO ADD GROUP MEMBER NAMES HERE WHEN YOU IMPLM GROUPS
                        <p className="text-grey-darker text-xs mt-1">
                          Andrés, Tom, Harrison, Arnold, Sylvester
                        </p> */}
                      </div>
                    </div>
                  </div>
                  <div className='flex w-full flex-1 flex-col-reverse justify-between overflow-y-scroll bg-primary-100/20'>
                    <div className='w-full py-2 px-3'>
                      {mutatedMessages?.map((m) => (
                        <MessageItem message={m} key={m.id} />
                      ))}
                    </div>
                  </div>
                  <div className='bg-grey-lighter flex items-center px-4 py-4'>
                    <form
                      className='flex w-full flex-row'
                      onSubmit={async (e) => {
                        console.log('submitted');
                        e.preventDefault();
                        if (message !== '') {
                          const newMessage = {
                            message: message,
                            senderId: session?.user?.id || 'errorSenderId',
                            receiverId: receiver?.id || 'errorReceiverId',
                            sender: session?.user,
                            receiver: receiver,
                            sentAt: ' ',
                            channelId: receiver?.id || 'errorReceiverId',
                            conversationId: selectedConversationId || ' ',
                          };
                          newChatMutation.mutateAsync(newMessage, {
                            onSuccess() {
                              utils.conversation.invalidate();
                              utils.chat.invalidate();
                            },
                          });
                        }

                        setMessage('');
                      }}
                    >
                      <div className='bg-grey-lighter flex'>
                        <input
                          className='flex w-full rounded border px-2 py-2'
                          placeholder='Aa'
                          type='text'
                          onChange={(e) => setMessage(e.target.value)}
                          value={message}
                        />
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Chat.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Chat;
