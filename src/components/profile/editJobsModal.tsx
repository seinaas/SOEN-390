import { zodResolver } from '@hookform/resolvers/zod';
import { Job } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../../utils/api';
import Modal from '../modal';

const formSchema = z.object({
  logo: z.string().nullish(),
  title: z.string(),
  company: z.string(),
  location: z.string().nullish(),
  description: z.string().nullish(),
  startDate: z.string(),
  endDate: z.string().nullish(),
});

type FormInputs = z.infer<typeof formSchema>;

type Props = {
  job?: Job;
  onCancel?: () => unknown;
};

const EditJobsModal: React.FC<Props> = ({ job, onCancel }) => {
  const updateMutation = api.user.updateJob.useMutation();
  const addMutation = api.user.addJob.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: job?.title,
      company: job?.company,
      location: job?.location,
      description: job?.description,
      startDate: job?.startDate?.toISOString().split('T')[0],
      endDate: job?.endDate?.toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: FormInputs) => {
    try {
      if (job) {
        await updateMutation.mutateAsync({
          jobId: job.jobId,
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
    <Modal onCancel={onCancel} onConfirm={handleSubmit(onSubmit)} confirmText='Save Changes'>
      <h1 className='mb-4 text-2xl font-semibold'>{job ? 'Edit Experience' : 'Add a Job'}</h1>
      <form className='flex w-full flex-col gap-2'>
        <input
          data-cy='job-title-input'
          type='text'
          placeholder='Job Title'
          className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
          {...register('title')}
        />

        <input
          data-cy='company-input'
          type='text'
          placeholder='Company Name'
          className='text-md block w-full rounded-lg border border-gray-300 p-3 shadow-inner outline-0 ring-0 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75'
          {...register('company')}
        />

        <textarea
          data-cy='description-input'
          placeholder='Job Description'
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

export default EditJobsModal;
