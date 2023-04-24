import { useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../modal';
import { type NotificationType } from '@prisma/client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type Props = {
  onCancel?: () => unknown;
};

const TYPES = [
  {
    key: 'likes',
    type: 'Likes',
  },
  {
    key: 'comments',
    type: 'Comments',
  },
  {
    key: 'connections',
    type: 'connections',
  },
] as const;

const NotificationSettingsModal: React.FC<Props> = ({ onCancel }) => {
  const t = useTranslations('notifications.settings');
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
    <Modal onCancel={onCancel} onConfirm={onSave}>
      <h1 className='mb-4 text-2xl font-semibold'>{t('title')}</h1>
      <div className='flex flex-col gap-2'>
        {TYPES.map((type) => {
          // Really convoluted way to get the correct types for the notification type
          // but whatever
          let correctTypes: NotificationType[];
          if (type.type === 'connections') {
            correctTypes = ['ConnectionRequest', 'ConnectionAccepted', 'ConnectionResponse'];
          } else {
            correctTypes = [type.type.slice(0, -1) as NotificationType];
          }

          const isMuted = correctTypes.every((t) => muted.includes(t));
          return (
            <div className='flex items-center gap-4 rounded-md bg-primary-100/10 p-2' key={type.key}>
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
              <h2 className='text-lg font-semibold text-primary-300'>{t(type.key)}</h2>
            </div>
          );
        })}
        <div className='flex items-center justify-between'></div>
      </div>
    </Modal>
  );
};

export default NotificationSettingsModal;
