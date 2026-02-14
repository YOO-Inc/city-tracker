import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-elderly-base font-medium text-gray-700 mb-3">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full h-touch min-h-touch
            px-5 pr-12 rounded-2xl
            text-elderly-base font-medium text-gray-900
            bg-white border-2 border-surface-200
            shadow-soft
            focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
            hover:border-surface-300
            appearance-none
            cursor-pointer
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
