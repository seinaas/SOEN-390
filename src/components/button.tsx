import React from 'react';
import { type HTMLMotionProps, motion } from 'framer-motion';

type Props = {
  reverse?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  iconLeft?: JSX.Element;
  children?: React.ReactNode;
} & HTMLMotionProps<'button'>;

export const Button: React.FC<Props> = ({ reverse, variant = 'primary', fullWidth, iconLeft, ...props }) => {
  let twStyle = '';
  if (variant === 'primary') {
    if (reverse) {
      twStyle = 'bg-white border-white text-primary-600';
    } else {
      twStyle = 'bg-primary-600 border-primary-600 text-white';
    }
  } else {
    if (reverse) {
      twStyle = 'bg-transparent border-white text-white';
    } else {
      twStyle = 'bg-transparent border-primary-600 text-primary-600';
    }
  }
  return (
    <motion.button
      type='submit'
      className={`flex items-center justify-center gap-x-3 rounded-md border-4 px-5 py-3 font-bold uppercase disabled:opacity-75 ${twStyle} ${
        fullWidth ? 'w-full' : ''
      }
      ${props.className || ''}`}
      {...props}
    >
      {iconLeft}
      <div className='flex items-center justify-center gap-x-1 overflow-hidden leading-[0.8]'>{props.children}</div>
    </motion.button>
  );
};
