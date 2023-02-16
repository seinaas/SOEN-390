import { type HTMLProps } from 'react';

type Props = {
  reverse?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  iconLeft?: JSX.Element;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
} & HTMLProps<HTMLButtonElement>;

export const Button: React.FC<Props> = ({ reverse, variant = 'primary', fullWidth, iconLeft, className, ...props }) => {
  return (
    <button
      type='submit'
      {...props}
      className={`flex items-center justify-center gap-x-2 rounded-md border-2 text-sm font-semibold uppercase disabled:opacity-75 ${
        variant === 'primary'
          ? reverse
            ? 'border-white bg-white text-primary-600'
            : 'border-primary-600 bg-primary-600 text-white'
          : reverse
          ? 'border-white bg-transparent text-white'
          : 'border-primary-600 bg-transparent text-primary-600'
      } ${fullWidth ? 'w-full' : ''} ${className || 'px-4 py-3'}`}
    >
      {iconLeft}
      <div className='flex items-center justify-center gap-x-1 overflow-hidden leading-[0.8]'>{props.children}</div>
    </button>
  );
};
