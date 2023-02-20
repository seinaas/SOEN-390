import { type Variants, motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { IoMdAdd } from 'react-icons/io';

const variants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

type Props = {
  text: string;
} & HTMLMotionProps<'button'>;

const NewSectionButton: React.FC<Props> = ({ text, ...props }) => {
  const [showPlus, setShowPlus] = useState(false);

  return (
    <motion.button
      layout
      variants={variants}
      initial='hidden'
      exit='exit'
      animate='visible'
      onHoverStart={() => setShowPlus(true)}
      onHoverEnd={() => setShowPlus(false)}
      className='flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary-100/20 p-6 transition-colors duration-200 hover:bg-primary-100/10'
      {...props}
    >
      <AnimatePresence mode='popLayout'>
        {showPlus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            <IoMdAdd size={32} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.h1 layout className='text-2xl font-semibold'>
        {text}
      </motion.h1>
    </motion.button>
  );
};

export default NewSectionButton;
