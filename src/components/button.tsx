import { motion, type HTMLMotionProps } from 'framer-motion';

type Props = {
  reverse?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  iconLeft?: JSX.Element;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
} & HTMLMotionProps<'button'>;

const Button: React.FC<Props> = ({ reverse, variant = 'primary', fullWidth, iconLeft, className, ...props }) => {
  return (
    <motion.button
      layout={props.layout != null ? props.layout : 'position'}
      type='submit'
      {...props}
      className={`flex items-center justify-center gap-x-2 rounded-md border-2 text-sm font-semibold uppercase disabled:opacity-75 ${
        variant === 'primary'
          ? reverse
            ? 'border-white bg-white text-primary-600 transition-colors duration-200 hover:border-transparent hover:bg-gray-100'
            : 'border-primary-600 bg-primary-600 text-white transition-colors duration-200 hover:bg-primary-800'
          : reverse
          ? 'border-white bg-transparent text-white transition-colors duration-200 hover:bg-white hover:text-primary-600'
          : 'border-primary-600 bg-transparent text-primary-600 transition-colors duration-200 hover:bg-primary-600 enabled:hover:text-white  disabled:bg-primary-100/20 disabled:opacity-50'
      } ${fullWidth ? 'w-full' : ''}
      ${className || 'px-4 py-3'}`}
      {...props}
    >
      {iconLeft && <motion.span layout={props.layout != null ? props.layout : 'position'}>{iconLeft}</motion.span>}
      {props.children && (
        <motion.div
          layout={props.layout != null ? props.layout : 'position'}
          className='flex items-center justify-center gap-x-1 leading-[0.8]'
        >
          {props.children}
        </motion.div>
      )}
    </motion.button>
  );
};

export default Button;
