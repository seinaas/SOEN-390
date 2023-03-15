import { IoMdAdd, IoMdCreate } from 'react-icons/io';

type Props = {
  type?: 'add' | 'edit';
  name: string;
  onClick?: () => void;
};

const EditButton: React.FC<Props> = ({ type = 'edit', onClick, name }) => {
  return (
    <button
      data-cy={`${type}-${name}-btn`}
      onClick={onClick}
      className='flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-100 hover:bg-primary-100/20 active:bg-primary-100/50'
    >
      {type === 'add' && <IoMdAdd size={28} />}
      {type === 'edit' && <IoMdCreate size={20} />}
    </button>
  );
};

export default EditButton;
