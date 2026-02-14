import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'large';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    relative overflow-hidden
    px-8 rounded-2xl
    font-semibold tracking-wide
    transform active:scale-[0.98]
    focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `;

  const sizeStyles = {
    default: 'h-touch min-h-touch text-elderly-base',
    large: 'h-touch-lg min-h-touch-lg text-elderly-lg',
  };

  const variantStyles = {
    primary: `
      bg-gradient-primary text-white
      shadow-soft hover:shadow-glow
      focus-visible:ring-primary-400/50
    `,
    secondary: `
      bg-white text-gray-700
      border-2 border-surface-200
      shadow-soft hover:border-primary-300 hover:text-primary-600
      focus-visible:ring-primary-400/50
    `,
    ghost: `
      bg-transparent text-gray-600
      hover:bg-surface-100
      focus-visible:ring-gray-400/50
    `,
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
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
