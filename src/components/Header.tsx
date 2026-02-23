import { isRTL } from '@/lib/i18n';

interface HeaderAction {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

interface HeaderProps {
  title: string;
  onBack?: () => void;
  transparent?: boolean;
  action?: HeaderAction;
}

export function Header({ title, onBack, transparent = false, action }: HeaderProps) {
  const rtl = isRTL();

  return (
    <header
      className={`
        sticky top-0 z-40
        ${transparent ? 'bg-transparent' : 'glass border-b border-white/50'}
      `}
    >
      <div className="flex items-center h-touch-lg px-4">
        {onBack && (
          <button
            onClick={onBack}
            className="
              -ms-2 me-3
              w-12 h-12 min-h-0
              flex items-center justify-center
              rounded-2xl
              text-gray-600
              hover:bg-surface-100
              active:bg-surface-200
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2
            "
            aria-label="Go back"
          >
            <svg
              className={`w-7 h-7 ${rtl ? '' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              style={{ transform: rtl ? 'scaleX(-1)' : undefined }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-elderly-xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {action && (
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className="
              -me-2 ms-3
              w-12 h-12 min-h-0
              flex items-center justify-center
              rounded-2xl
              text-gray-500
              hover:bg-surface-100 hover:text-gray-700
              active:bg-surface-200
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            aria-label={action.label}
          >
            {action.icon}
          </button>
        )}
      </div>
    </header>
  );
}
