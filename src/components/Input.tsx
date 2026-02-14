import { TextareaHTMLAttributes } from 'react';

interface InputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Input({
  label,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-elderly-base font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full min-h-[140px]
          px-5 py-4 rounded-2xl
          text-elderly-base text-gray-900
          bg-white border-2 border-surface-200
          shadow-soft
          placeholder:text-gray-400
          focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
          hover:border-surface-300
          resize-none
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
