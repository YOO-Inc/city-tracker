import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    h-touch-lg min-h-touch-lg
    px-6 rounded-xl
    text-elderly-lg font-semibold
    transition-colors duration-200
    focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-primary text-white
      hover:bg-primary-dark
      focus-visible:ring-primary
      active:bg-primary-dark
    `,
    secondary: `
      bg-gray-100 text-gray-900
      hover:bg-gray-200
      focus-visible:ring-gray-400
      active:bg-gray-200
    `,
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
