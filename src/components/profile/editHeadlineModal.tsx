/*
 *		Edit Headline Modal 
 *
 *
 *		This file defines a React functional component called "EditHeadlineModal". The component takes in two props, "headline" and "onCancel". It uses the "useState" hook to create a state 
 *    variable called "newHeadline" and a setter function called "setNewHeadline". The component also uses the "useTranslations" hook to access translations for the modal. It renders a modal 
 *    component with a title, an input field for the new headline, and cancel and save buttons. When the save button is clicked, the "updateMutation" function from the "api" module is called 
 *    to update the user's headline, and the "onCancel" function is called to close the modal.
 */
import { useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../modal';
import { useTranslations } from 'next-intl';

type Props = {
  headline: string;
  onCancel?: () => unknown;
};

const EditHeadlineModal: React.FC<Props> = ({ headline, onCancel }) => {
  const t = useTranslations('profile.modals.headline');
  const [newHeadline, setNewHeadline] = useState(headline);

  const updateMutation = api.user.update.useMutation();
  const onSave = async () => {
    await updateMutation.mutateAsync({ headline: newHeadline });
    onCancel?.();
  };

  return (
    <Modal onCancel={onCancel} onConfirm={onSave}>
      <h1 className='mb-4 text-2xl font-semibold'>{t('title')}</h1>
      <input
        data-cy='headline-input'
        type='text'
        placeholder={t('placeholder')}
        className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
        value={newHeadline}
        onChange={(e) => setNewHeadline(e.target.value)}
      />
    </Modal>
  );
};

export default EditHeadlineModal;
