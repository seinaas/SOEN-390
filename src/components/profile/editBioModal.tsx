import { useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../modal';
import { useTranslations } from 'next-intl';

type Props = {
  bio: string;
  onCancel?: () => unknown;
};

const EditBioModal: React.FC<Props> = ({ bio, onCancel }) => {
  const t = useTranslations('profile');
  const [newBio, setNewBio] = useState(bio);

  const updateMutation = api.user.update.useMutation();
  const onSave = async () => {
    await updateMutation.mutateAsync({ bio: newBio });
    onCancel?.();
  };

  return (
    <Modal onCancel={onCancel} onConfirm={onSave}>
      <h1 className='mb-4 text-2xl font-semibold'>{t('about')}</h1>
      <textarea
        data-cy='bio-input'
        placeholder={t('modals.about.placeholder')}
        className='h-32 w-full flex-1 rounded-md border border-gray-300 py-2 px-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
        value={newBio}
        onChange={(e) => setNewBio(e.target.value)}
      />
    </Modal>
  );
};

export default EditBioModal;
