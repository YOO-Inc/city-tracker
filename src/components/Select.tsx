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
        <label className="block text-elderly-base font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full h-touch min-h-touch
          px-4 rounded-xl
          text-elderly-base
          bg-white border-2 border-gray-300
          focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20
          appearance-none
          bg-no-repeat bg-right
          cursor-pointer
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 1rem center',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '3rem',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
