import { type HTMLProps } from 'react';

type Props = {
  reverse?: boolean;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  iconLeft?: JSX.Element;
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
} & HTMLProps<HTMLButtonElement>;

export const Button: React.FC<Props> = ({ reverse, variant = 'primary', fullWidth, iconLeft, ...props }) => {
  return (
    <button
      type='submit'
      className={`flex items-center justify-center gap-x-3 rounded-md border-4 px-5 py-3 font-bold uppercase disabled:opacity-75 ${
        variant === 'primary'
          ? reverse
            ? 'border-white bg-white text-primary-600'
            : 'border-primary-600 bg-primary-600 text-white'
          : reverse
          ? 'border-white bg-transparent text-white'
          : 'border-primary-600 bg-transparent text-primary-600'
      } ${fullWidth ? 'w-full' : ''}
      ${props.className || ''}`}
      {...props}
    >
      {iconLeft}
      <div className='flex items-center justify-center gap-x-1 overflow-hidden leading-[0.8]'>{props.children}</div>
    </button>
  );
};
