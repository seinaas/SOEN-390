import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoMdTrash } from 'react-icons/io';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../utils/api';
import Button from '../button';
import Modal from '../modal';
import { langsByCode, langsByName } from '../../utils/languages';

type Props = {
  languages: string[];
  onCancel?: () => unknown;
};

const formSchema = z.object({
  language: z.enum(['English', ...Object.keys(langsByName)]),
});

type FormInputs = z.infer<typeof formSchema>;

const EditLanguagesModal: React.FC<Props> = ({ languages, onCancel }) => {
  const [newLanguages, setNewLanguages] = useState(languages);

  const updateMutation = api.user.update.useMutation();

  const { register, handleSubmit, reset } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit((data) => {
      if (newLanguages.find((lang) => lang.toLowerCase() === data.language.toLowerCase())) return;
      setNewLanguages([langsByName[data.language as keyof typeof langsByName], ...newLanguages]);
      reset();
    })(e);
  };

  const onSave = async () => {
    await updateMutation.mutateAsync({ languages: newLanguages });
    onCancel?.();
  };

  return (
    <Modal onCancel={onCancel} onConfirm={onSave} confirmText='Save Changes'>
      <h1 className='mb-4 text-2xl font-semibold'>Languages</h1>
      <form onSubmit={onSubmit} className='flex flex-col items-center justify-between gap-2 p-2 py-4 xs:flex-row'>
        <input
          data-cy='lang-input'
          {...register('language')}
          list='languages'
          placeholder='Add a language'
          className='w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
        />
        <datalist id='languages'>
          {Object.entries(langsByCode).map(([code, name]) => (
            <option key={code} value={name} />
          ))}
        </datalist>
        <Button data-cy='lang-submit'>Add</Button>
      </form>
      <div className='h-screen max-h-[65vh] overflow-y-auto xs:h-[50vh] xs:max-h-[50vh]'>
        <AnimatePresence mode='popLayout'>
          {newLanguages.map((langCode, index) => (
            <motion.div
              key={`${langCode}`}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className={`flex items-center justify-between p-2 py-4 ${
                index < newLanguages.length - 1 ? 'border-b-[1px] border-gray-200' : ''
              }`}
            >
              {langsByCode[langCode as keyof typeof langsByCode]}
              <button
                onClick={() => {
                  setNewLanguages(newLanguages.filter((_, i) => i !== index));
                }}
                className='flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors duration-100 hover:bg-red-500/20 active:bg-red-500/50'
              >
                <IoMdTrash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {newLanguages.length === 0 && (
          <div className='flex h-full flex-col items-center justify-center p-4'>
            <p className='text-lg font-semibold text-primary-500'>You haven&apos;t added any languages yet</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditLanguagesModal;
