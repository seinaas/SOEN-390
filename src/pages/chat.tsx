
import ListItemButton from '@mui/material/ListItemButton';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import MainLayout from '../components/mainLayout';
import { api } from '../utils/api';
import { Conversation, Message } from '../utils/Conversation-Service';
import { connectToChannel, useSubscribeToEvent } from '../utils/pusher';
import { type NextPageWithLayout } from './_app';

function MessageItem({
  message
}: {
  message: Message
}) {

  const isSender = message?.senderId === useSession().data?.user?.id
  return (
    <>
      <div className="flex flex-col"></div>
      <div className={!isSender ? "w-1/2 flex flex-col mb-2 break-all items-start" : "w-1/2 flex flex-col mb-2 break-all items-end ml-auto"}>
        <p className={isSender ? "text-sm text-teal text-right" : "text-sm text-teal"}>
          {message?.sender?.email || "NA"}
        </p>
        <p className={isSender ? "py-3 px-4 bg-white rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-black break-all" : "break-all py-3 px-4 bg-white rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-black"}>
          {message?.message}
        </p>
        <p className={isSender ? "text-right text-xs text-grey-dark mt-1" : "text-xs text-grey-dark mt-1"}>
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
  const messagesToUse = api.conversation.getConversationMessages.useQuery({ id: selectedConversationId || 'error' }).data
  const [message, setMessage] = useState("");
  const newChatMutation = api.chat.sendMessage.useMutation();
  const [messages, setMessages] = useState<Message[]>([]);
  let email = undefined;
  if (session) {
    email = session?.user?.email;
  }
  const conversations = api.conversation.getUserConversations.useQuery({
    userEmail: email as string
  }).data as Conversation[];

  useEffect(() => {
    if (messagesToUse) {
      setMessages(messagesToUse)
    }
  }, [messagesToUse])
  // Subscribe to a Pusher event
  useSubscribeToEvent('message-sent', (data) => {
    console.log(data);
  });
  const currentConversation = conversations?.find(convo => convo.id === selectedConversationId);
  const receiver = currentConversation?.user1Id == session?.user?.id ? currentConversation?.user2 : currentConversation?.user1;

  const mutatedMessages = (() => {
    // if you want to mutate the data for some reason
    return messages
  })()

  const handleClick = (conversation: Conversation) => {
    connectToChannel(conversation.user1Id == session?.user?.id ? conversation.user2Id : conversation.user1Id);
    setSelectedConversationId(conversation.id);
  }

  // Connect to the last channel the user was in
  // TODO: Store the channel whenever it is changed

  return (
    <>
      <div className="w-full h-32" style={{ backgroundColor: "#" }}></div>

      <div className="container mx-auto" style={{ marginTop: "-128px" }}>
        <div className="py-6 h-1">
          <div className="flex border border-grey rounded shadow-lg" style={{ height: '70vh' }}>
            <div className="bg-grey-lighter flex-1 overflow-auto w-2/5 flex flex-col">
              <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2">
                <div className="font-semibold text-2xl text-primary-500">Your conversations</div>
              </div>
              <div className="bg-grey-lighter flex-1 overflow-auto">
                {conversations?.length > 0 ? conversations?.map((conversation) => (

                  <ListItemButton style={{ borderBottom: '1px solid', borderColor: "lightgray" }} className="px-3 flex items-center"
                    id={conversation.user1Id == session?.user?.id ? conversation.user2Id : conversation.user1Id}
                    onClick={() => handleClick(conversation)}
                    selected={selectedConversationId === conversation.id}
                  >
                    <div>
                      <img className="h-12 w-12 rounded-full"
                        src={(conversation.user1Id == session?.user?.id ? conversation.user2?.image : conversation.user1?.image) || "/istockphoto-1298261537-612x612.jpg"} />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-bottom justify-between">
                        <p className="text-grey-darkest">
                          {conversation.user1Id == session?.user?.id ? conversation.user2?.email : conversation.user1?.email}
                        </p>
                        <p className="text-xs text-grey-darkest">
                          {conversation?.messages?.sort((a, b) => a.sentAt > b.sentAt ? -1 : 1)[0]?.sentAt}
                        </p>
                      </div>
                      <p className="text-grey-dark mt-1 text-sm" style={{ textOverflow: "ellipsis" }}>
                        {conversation?.messages?.length > 0 ? (() => {
                          let latestMessage = conversation?.messages?.sort((a, b) => a.sentAt > b.sentAt ? -1 : 1)[0];
                          let sender = conversation.user1Id == latestMessage?.senderId ? conversation.user1 : conversation.user2;
                          return sender.id == session?.user?.id ? "You: " + latestMessage?.message : conversation.user2.email + ": " + latestMessage?.message
                        })() : ''}
                      </p>
                    </div>
                  </ListItemButton>

                )) : <p className="align-bottom text-center">You do not have any conversations yet.</p>}
              </div>
            </div>
            <div className="w-3/5 border flex flex-col">
              {selectedConversationId &&
                <>
                  <div className="py-2 px-3 bg-primary-500 flex flex-row justify-between items-center">
                    <div className="flex items-center">
                      <div>
                        <img className="w-10 h-10 rounded-full" src={receiver?.image != null ? receiver?.image : "/istockphoto-1298261537-612x612.jpg"} />
                      </div>
                      <div className="ml-4">
                        <p className="text-blue">
                          {receiver?.email}
                        </p>
                        {/* YOU WILL WANT TO ADD GROUP MEMBER NAMES HERE WHEN YOU IMPLM GROUPS
                        <p className="text-grey-darker text-xs mt-1">
                          Andrés, Tom, Harrison, Arnold, Sylvester
                        </p> */}

                      </div>
                    </div>
                  </div>
                  <div className="w-full flex-1 flex flex-col-reverse overflow-y-scroll bg-primary-100/20 justify-between">
                    <div className="py-2 w-full px-3">
                      {mutatedMessages?.map((m) =>
                        <MessageItem message={m} />
                      )}

                    </div>
                  </div>
                  <div className="bg-grey-lighter px-4 py-4 flex items-center">
                    <form
                      className="flex flex-row w-full"
                      onSubmit={(e) => {
                        console.log("submitted");
                        e.preventDefault();
                        if (message !== "") {
                          const newMessage = {
                            message: message,
                            senderId: session?.user?.id || "errorSenderId",
                            receiverId: receiver?.id || "errorReceiverId",
                            sender: session?.user,
                            receiver: receiver,
                            sentAt: " ",
                            channelId: receiver?.id || "errorReceiverId",
                            conversationId: selectedConversationId || " ",
                          }
                          newChatMutation.mutateAsync(newMessage, {
                            onSuccess() {
                              utils.conversation.invalidate();
                              utils.chat.invalidate();
                            }
                          })
                        }

                        setMessage("");
                      }}
                    >
                      <div className="bg-grey-lighter flex">
                        <input className="flex w-full border rounded px-2 py-2" placeholder="Aa" type="text" onChange={(e) => setMessage(e.target.value)} value={message} />
                      </div>
                    </form>
                  </div></>}
            </div>
          </div>
        </div>
      </div>
    </>

  );
};

Chat.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Chat;