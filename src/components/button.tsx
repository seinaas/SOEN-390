import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = {
  reverse?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  iconLeft?: JSX.Element;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
} & HTMLMotionProps<'button'>;

const Button: React.FC<Props> = ({ reverse, variant = 'primary', fullWidth, iconLeft, ...props }) => {
  return (
    <motion.button
      layout
      type='submit'
      {...props}
      className={`flex items-center justify-center gap-x-2 rounded-md border-2 text-sm font-semibold uppercase disabled:opacity-75 ${
        variant === 'primary'
          ? reverse
            ? 'border-white bg-white text-primary-600 transition-colors duration-200 hover:bg-gray-200'
            : 'border-primary-600 bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-800'
          : reverse
          ? 'border-white bg-transparent text-white transition-colors duration-200 hover:bg-white hover:text-primary-600'
          : 'border-primary-600 bg-transparent text-primary-600 transition-colors duration-200 hover:bg-primary-600 hover:text-white'
      } ${fullWidth ? 'w-full' : ''}
      ${props.className || 'px-4 py-2'}`}
      {...props}
    >
      {iconLeft}
      <div className='flex items-center justify-center gap-x-1 overflow-hidden leading-[0.8]'>{props.children}</div>
    </motion.button>
  );
};

export default Button;
