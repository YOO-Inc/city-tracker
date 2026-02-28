import { t, translateTypeName } from '@/lib/i18n';
import { ENTRY_TYPES, getTypeColor } from '@/config/entryTypes';

interface FilterChipsProps {
  selectedType: string | null;
  onChange: (type: string | null) => void;
  typeCounts: Record<string, number>;
  totalCount: number;
}

export function FilterChips({ selectedType, onChange, typeCounts, totalCount }: FilterChipsProps) {
  const isAllSelected = selectedType === null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
      {/* "All" pill */}
      <button
        onClick={() => onChange(null)}
        className={`
          flex items-center flex-shrink-0
          h-14 min-h-0 px-5
          rounded-full
          font-semibold text-elderly-base whitespace-nowrap
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
          ${isAllSelected
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-white border-2 border-surface-200 text-gray-700'
          }
        `}
      >
        {t('entries.filterAll')} ({totalCount})
      </button>

      {/* Type pills */}
      {ENTRY_TYPES.map((type) => {
        const isActive = selectedType === type.name;
        const typeColor = getTypeColor(type.name);
        const count = typeCounts[type.name] || 0;

        return (
          <button
            key={type.name}
            onClick={() => onChange(isActive ? null : type.name)}
            className={`
              flex items-center gap-2 flex-shrink-0
              h-14 min-h-0 px-5
              rounded-full
              font-semibold text-elderly-base whitespace-nowrap
              transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
              ${isActive
                ? 'text-white shadow-md'
                : 'bg-white border-2 border-surface-200 text-gray-700'
              }
            `}
            style={isActive ? { backgroundColor: typeColor } : undefined}
          >
            {/* Color indicator dot (only when not active) */}
            {!isActive && (
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: typeColor }}
              />
            )}
            {translateTypeName(type.name)} ({count})
          </button>
        );
      })}
    </div>
  );
}
