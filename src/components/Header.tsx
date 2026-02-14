interface HeaderProps {
  title: string;
  onBack?: () => void;
  transparent?: boolean;
}

export function Header({ title, onBack, transparent = false }: HeaderProps) {
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
              -ml-2 mr-3
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
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <h1 className="text-elderly-xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
