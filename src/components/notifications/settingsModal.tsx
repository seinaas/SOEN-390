/*
*		Notification Settings Modal
*
*
*		This is a React component that renders a modal for notification settings. It uses the useState hook to manage the muted notification types, which are fetched from the API using a custom hook.
*		The user can mute or unmute notification types by clicking a button, which updates the muted state. When the user clicks the "Save Changes" button, the muted notification types 
*		are updated using another custom API hook. The component also includes Framer Motion animation for the mute button.
*/
import { useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../modal';
import { type NotificationType } from '@prisma/client';
import { motion } from 'framer-motion';

type Props = {
  onCancel?: () => unknown;
};

const NotificationSettingsModal: React.FC<Props> = ({ onCancel }) => {
  const [muted, setMuted] = useState<NotificationType[]>([]); // ['likes', 'comments'

  api.notifications.getMutedNotificationTypes.useQuery(undefined, {
    onSuccess: (data) => {
      setMuted(data);
    },
    refetchOnWindowFocus: false,
  });

  const updateMutation = api.notifications.updateMutedNotificationTypes.useMutation();
  const onSave = () => {
    updateMutation.mutate(muted);
    onCancel?.();
  };

  return (
    <Modal onCancel={onCancel} onConfirm={onSave} confirmText='Save Changes'>
      <h1 className='mb-4 text-2xl font-semibold'>Notification Settings</h1>
      <div className='flex flex-col gap-2'>
        {['Likes', 'Comments', 'Connections'].map((type) => {
          // Really convoluted way to get the correct types for the notification type
          // but whatever
          let correctTypes: NotificationType[];
          if (type.toLowerCase() === 'connections') {
            correctTypes = ['ConnectionRequest', 'ConnectionAccepted', 'ConnectionResponse'];
          } else {
            correctTypes = [type.slice(0, -1) as NotificationType];
          }

          const isMuted = correctTypes.every((t) => muted.includes(t));
          return (
            <div className='flex items-center gap-4 rounded-md bg-primary-100/10 p-2' key={type}>
              <button
                onClick={() => {
                  if (isMuted) {
                    setMuted((prev) => prev.filter((t) => !correctTypes.includes(t)));
                  } else {
                    setMuted((prev) => [...prev, ...correctTypes]);
                  }
                }}
                className={`w-10 rounded-full p-1 ${isMuted ? 'bg-primary-300' : 'bg-primary-100/40'}`}
              >
                <motion.div
                  animate={{
                    x: isMuted ? '100%' : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  className='h-4 w-4 rounded-full bg-white'
                />
              </button>
              <h2 className='text-lg font-semibold text-primary-300'>Mute {type}</h2>
            </div>
          );
        })}
        <div className='flex items-center justify-between'></div>
      </div>
    </Modal>
  );
};

export default NotificationSettingsModal;
