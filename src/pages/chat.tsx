import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useStore } from 'zustand';
import Button from '../components/button';
import MainLayout from '../components/mainLayout';
import { api } from '../utils/api';
import { connectToChannel, pusherStore, useSubscribeToEvent } from '../utils/pusher';
import { type NextPageWithLayout } from './_app';

const formSchema = z.object({
  message: z.string(),
});

type FormInputs = z.infer<typeof formSchema>;

const Chat: NextPageWithLayout = () => {
  const newChatMutation = api.chat.submit.useMutation();
  const { channel } = useStore(pusherStore, (state) => state);

  // Subscribe to a Pusher event
  useSubscribeToEvent('test-event', ({ message }: { message: string }) => {
    console.log('Chat received!', message);
  });

  const { register, handleSubmit, reset } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  // Connect to the last channel the user was in
  // TODO: Store the channel whenever it is changed
  useEffect(() => {
    const lastChannel = localStorage.getItem('lastChannel');
    if (lastChannel) {
      connectToChannel(lastChannel);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit(async (data) => {
      await newChatMutation.mutateAsync(data);
      reset();
    })(e);
  };

  return (
    <main className='relative flex h-full w-full flex-col justify-center gap-4 xs:py-4 xs:px-4 md:flex-row lg:px-8'>
      <div>
        {/* Instead of a button, user's should be able to click on existing chats or start a chat with another user to join a channel */}
        <h1 data-cy='channel-name'>
          {channel?.name ? `Current Channel: ${channel?.name}` : 'Not currently in a channel'}
        </h1>
        <Button data-cy='join-channel-btn' onClick={() => connectToChannel('test')}>
          Join Test Channel
        </Button>
      </div>
      {channel && (
        <form onSubmit={onSubmit}>
          <input
            data-cy='chat-input'
            type='text'
            className='flex-1 rounded-md border border-gray-300 py-2 px-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
            {...register('message')}
          />
        </form>
      )}
    </main>
  );
};

Chat.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Chat;
