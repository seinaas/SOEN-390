import { motion } from 'framer-motion';
import Button from './button';

type Props = {
  onCancel?: () => unknown;
  onConfirm?: () => unknown;
  confirmText?: string;
  children?: React.ReactNode;
};

const Modal: React.FC<Props> = ({ children, confirmText = 'confirm', onConfirm, onCancel }) => {
  return (
    <>
      <motion.div
        // Needed for animating css variables
        // eslint-disable-next-line
        initial={{ '--tw-bg-opacity': 0 } as any}
        // eslint-disable-next-line
        animate={{ '--tw-bg-opacity': 0.5 } as any}
        // eslint-disable-next-line
        exit={{ '--tw-bg-opacity': 0 } as any}
        className='fixed inset-0 z-50 flex items-end justify-center bg-gray-500 p-4 text-center sm:items-center sm:p-0'
        onMouseDown={onCancel}
      >
        <motion.div
          onMouseDown={(e) => e.stopPropagation()}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{
            scale: 0,
            transition: {
              type: 'linear',
              duration: 0.2,
            },
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            delay: 0.1,
          }}
          className='relative w-full overflow-hidden rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg'
        >
          <div className='px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>{children}</div>
          <div className='flex justify-end gap-2 bg-primary-100/20 p-4'>
            <Button reverse onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onConfirm}>{confirmText}</Button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Modal;
