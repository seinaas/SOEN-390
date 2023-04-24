/*
 *		Input Field Template
 *
 *
 *		This is the React template used to style and make input fields throughout the website. This allows them to gain relative animations and fit within the respective scene well.
 */
import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ForwardedRef, forwardRef } from 'react';

type Props = {
  variant?: 'primary' | 'secondary';
  ref?: ForwardedRef<HTMLInputElement>;
} & HTMLMotionProps<'input'>;

const Input: React.FC<Props> = forwardRef(({ variant = 'primary', ...props }, ref) => {
  return (
    <motion.input
      layout
      className={`text-md block w-full rounded-lg border-2 p-3 text-black shadow-inner outline-0 ring-0 disabled:opacity-75 ${
        variant === 'primary' ? 'border-primary-600' : 'border-white'
      }`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export default Input;
