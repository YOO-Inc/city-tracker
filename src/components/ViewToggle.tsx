import { t } from '@/lib/i18n';

interface ViewToggleProps {
  value: 'list' | 'map';
  onChange: (value: 'list' | 'map') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex bg-surface-100 rounded-xl p-1 gap-1">
      <button
        onClick={() => onChange('list')}
        className={`
          flex-1 h-14 min-h-0 rounded-lg
          flex items-center justify-center gap-2
          font-semibold text-elderly-base
          transition-all duration-200
          ${value === 'list'
            ? 'bg-gradient-primary text-white shadow-md'
            : 'bg-transparent text-gray-600 hover:bg-white/50'
          }
        `}
        aria-pressed={value === 'list'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        {t('entries.listView')}
      </button>
      <button
        onClick={() => onChange('map')}
        className={`
          flex-1 h-14 min-h-0 rounded-lg
          flex items-center justify-center gap-2
          font-semibold text-elderly-base
          transition-all duration-200
          ${value === 'map'
            ? 'bg-gradient-primary text-white shadow-md'
            : 'bg-transparent text-gray-600 hover:bg-white/50'
          }
        `}
        aria-pressed={value === 'map'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
          />
        </svg>
        {t('entries.mapView')}
      </button>
    </div>
  );
}
