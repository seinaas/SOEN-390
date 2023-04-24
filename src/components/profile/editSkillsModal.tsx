/*
*		Edit Skills Modal
*
*
*		This is a React component for an "Edit Skills" modal, which allows users to add or remove skills. The component receives a list of existing 
*		skills as props, and it manages the state of new skills internally using useState. When the user adds a new skill, it checks if the skill already 
*		exists in the list to avoid duplicates. The component also displays a confirmation modal with a "Save Changes" button, which calls an API function 
*		to update the user's skills. Finally, it uses Framer Motion to animate the appearance and removal of skills from the list.
*/
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { IoMdTrash } from 'react-icons/io';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../utils/api';
import Button from '../button';
import Modal from '../modal';

type Props = {
  skills: string[];
  onCancel?: () => unknown;
};

const formSchema = z.object({
  skill: z.string().min(1).max(20),
});

type FormInputs = z.infer<typeof formSchema>;

const EditSkillsModal: React.FC<Props> = ({ skills, onCancel }) => {
  const [newSkills, setNewSkills] = useState(skills);

  const updateMutation = api.user.update.useMutation();

  const { register, handleSubmit, reset } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await handleSubmit((data) => {
      if (newSkills.find((skill) => skill.toLowerCase() === data.skill.toLowerCase())) return;
      setNewSkills([data.skill, ...newSkills]);
      reset();
    })(e);
  };

  const onSave = async () => {
    await updateMutation.mutateAsync({ skills: newSkills });
    onCancel?.();
  };

  return (
    <Modal onCancel={onCancel} onConfirm={onSave} confirmText='Save Changes'>
      <h1 className='mb-4 text-2xl font-semibold'>Skills</h1>
      <form onSubmit={onSubmit} className='flex flex-col items-center justify-between gap-2 p-2 py-4 xs:flex-row'>
        <input
          data-cy='skill-input'
          type='text'
          className='flex-1 rounded-md border border-gray-300 py-2 px-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
          {...register('skill')}
        />
        <Button data-cy='skill-submit'>Add Skill</Button>
      </form>
      <div className='h-screen max-h-[65vh] overflow-y-auto xs:h-[50vh] xs:max-h-[50vh]'>
        <AnimatePresence mode='popLayout'>
          {newSkills.map((skill, index) => (
            <motion.div
              key={`${skill}`}
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
                index < newSkills.length - 1 ? 'border-b-[1px] border-gray-200' : ''
              }`}
            >
              {skill}
              <button
                onClick={() => {
                  setNewSkills(newSkills.filter((_, i) => i !== index));
                }}
                className='flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors duration-100 hover:bg-red-500/20 active:bg-red-500/50'
              >
                <IoMdTrash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {newSkills.length === 0 && (
          <div className='flex h-full flex-col items-center justify-center p-4'>
            <p className='text-lg font-semibold text-primary-500'>You haven&apos;t added any skills yet</p>
            <p className='leading-[1] text-gray-500'>Add some skills to show off your talents!</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditSkillsModal;
