
/*
*		Edit Button Component
*
*
*		This code defines a React component called EditButton, which is used to render an edit or add button. The component takes in three props: 
*		type (which defaults to 'edit'), name, and onClick (which is an optional function). The type prop is used to determine which icon to display, 
*		either a plus sign or a pencil. When the button is clicked, the onClick function is called. The button is styled with a rounded background and hover/active effects.
*/
import { IoMdAdd, IoMdCreate, IoMdExit, IoMdPersonAdd } from 'react-icons/io';

type Props = {
  type?: 'add' | 'edit' | 'remove' | 'addUsers';
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
      {type === 'remove' && <IoMdExit size={20} />}
      {type === 'addUsers' && <IoMdPersonAdd size={20} />}
    </button>
  );
};

export default EditButton;
