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
        <label className="block text-elderly-base font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full min-h-[120px]
          px-4 py-3 rounded-xl
          text-elderly-base
          bg-white border-2 border-gray-300
          focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20
          resize-none
          ${className}
        `}
        {...props}
      />
    </div>
  );
}
