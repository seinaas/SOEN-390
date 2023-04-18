import { zodResolver } from '@hookform/resolvers/zod';
import { type Education } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../../utils/api';
import Modal from '../modal';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  school: z.string(),
  degree: z.string(),
  location: z.string().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  description: z.string().nullish(),
});

type FormInputs = z.infer<typeof formSchema>;

type Props = {
  education?: Education;
  onCancel?: () => unknown;
};

const EditEducationModal: React.FC<Props> = ({ education, onCancel }) => {
  const t = useTranslations('profile.modals.education');

  const updateMutation = api.user.updateEducation.useMutation();
  const addMutation = api.user.addEducation.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      degree: education?.degree,
      school: education?.school,
      location: education?.location,
      description: education?.description,
      startDate: education?.startDate?.toISOString().split('T')[0],
      endDate: education?.endDate?.toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormInputs) => {
    try {
      if (education) {
        await updateMutation.mutateAsync({
          educationId: education.educationId,
          ...data,
          startDate: new Date(data.startDate || 0),
          endDate: data.endDate ? new Date(data.endDate) : null,
        });
        onCancel?.();
      } else {
        await addMutation.mutateAsync({
          ...data,
          startDate: new Date(data.startDate || 0),
          endDate: data.endDate ? new Date(data.endDate) : null,
        });
        onCancel?.();
      }
    } catch (e) {
      // TODO: Display error
      console.log(e);
    }
  };

  return (
    <Modal onCancel={onCancel} onConfirm={handleSubmit(onSubmit)}>
      <h1 className='mb-4 text-2xl font-semibold'>{education ? t('edit') : t('new')}</h1>
      <form className='flex w-full flex-col gap-2'>
        <input
          data-cy='degree-input'
          type='text'
          placeholder={t('degree')}
          className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
          {...register('degree')}
        />
        <input
          data-cy='school-input'
          type='text'
          placeholder={t('school')}
          className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
          {...register('school')}
        />
        <input
          data-cy='location-input'
          type='text'
          placeholder={t('location')}
          className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
          {...register('location')}
        />

        <textarea
          data-cy='description-input'
          placeholder={t('description')}
          className='text-md block h-32 w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
          {...register('description')}
        />
        <div className='flex gap-2'>
          <input
            data-cy='start-date-input'
            type='date'
            placeholder='Starting Date'
            className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
            {...register('startDate')}
          />
          <input
            data-cy='end-date-input'
            type='date'
            placeholder='Ending Date'
            className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
            {...register('endDate')}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditEducationModal;
